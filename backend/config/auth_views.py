from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken

from apps.auditoria.mixins import get_ip
from apps.auditoria.models import AuditLog
from config.throttling import LoginRateThrottle

REFRESH_COOKIE = 'habita_refresh'
COOKIE_PATH = '/api/v1/auth/'


def _cookie_max_age():
    return int(settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds())


def _set_refresh_cookie(response, token_str):
    response.set_cookie(
        key=REFRESH_COOKIE,
        value=token_str,
        httponly=True,
        secure=not settings.DEBUG,
        samesite='Strict',
        path=COOKIE_PATH,
        max_age=_cookie_max_age(),
    )


def _delete_refresh_cookie(response):
    response.delete_cookie(REFRESH_COOKIE, path=COOKIE_PATH)


class CookieTokenObtainPairView(TokenObtainPairView):
    throttle_classes = [LoginRateThrottle]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            raise InvalidToken(e.args[0])

        tokens = serializer.validated_data
        response = Response({'access': tokens['access']})
        _set_refresh_cookie(response, tokens['refresh'])

        username = request.data.get('username', '')
        try:
            from django.contrib.auth import get_user_model
            usuario = get_user_model().objects.get(username=username)
        except Exception:
            usuario = None
        AuditLog.objects.create(
            usuario=usuario,
            accion=AuditLog.Accion.LOGIN,
            recurso='sesion',
            descripcion=f'Inicio de sesión: {username}',
            ip=get_ip(request),
        )

        return response


class CookieTokenRefreshView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token_str = request.COOKIES.get(REFRESH_COOKIE)
        if not token_str:
            return Response({'detail': 'No autenticado.'}, status=401)

        try:
            refresh = RefreshToken(token_str)
        except TokenError:
            response = Response({'detail': 'Sesión expirada.'}, status=401)
            _delete_refresh_cookie(response)
            return response

        # Get access token before rotating
        access = str(refresh.access_token)

        # Blacklist old token and generate new refresh token
        try:
            refresh.blacklist()
        except AttributeError:
            pass

        refresh.set_jti()
        refresh.set_exp()
        refresh.set_iat()

        response = Response({'access': access})
        _set_refresh_cookie(response, str(refresh))
        return response


class LogoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token_str = request.COOKIES.get(REFRESH_COOKIE)
        if token_str:
            try:
                RefreshToken(token_str).blacklist()
            except (TokenError, AttributeError):
                pass

        if request.user and request.user.is_authenticated:
            AuditLog.objects.create(
                usuario=request.user,
                accion=AuditLog.Accion.LOGOUT,
                recurso='sesion',
                descripcion=f'Cierre de sesión: {request.user.username}',
                ip=get_ip(request),
            )

        response = Response({'detail': 'Sesión cerrada.'})
        _delete_refresh_cookie(response)
        return response
