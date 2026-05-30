from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


def health(request):
    return JsonResponse({'status': 'ok'})


urlpatterns = [
    path('health/', health),
    path('admin/', admin.site.urls),

    # Auth
    path('api/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # API
    path('api/habitaciones/', include('apps.habitaciones.urls')),
    path('api/inquilinos/', include('apps.inquilinos.urls')),
    path('api/contratos/', include('apps.contratos.urls')),
    path('api/pagos/', include('apps.pagos.urls')),
    path('api/usuarios/', include('apps.usuarios.urls')),
]
