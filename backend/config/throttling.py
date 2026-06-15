from rest_framework.throttling import AnonRateThrottle
from rest_framework_simplejwt.views import TokenObtainPairView
from apps.auditoria.mixins import get_ip
from apps.auditoria.models import AuditLog


class LoginRateThrottle(AnonRateThrottle):
    scope = 'login'


class ThrottledTokenObtainPairView(TokenObtainPairView):
    throttle_classes = [LoginRateThrottle]

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            from django.contrib.auth import get_user_model
            username = request.data.get('username', '')
            try:
                usuario = get_user_model().objects.get(username=username)
            except get_user_model().DoesNotExist:
                usuario = None
            AuditLog.objects.create(
                usuario=usuario,
                accion=AuditLog.Accion.LOGIN,
                recurso='sesion',
                descripcion=f'Inicio de sesión: {username}',
                ip=get_ip(request),
            )
        return response
