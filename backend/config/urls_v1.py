from django.urls import path, include
from config.auth_views import CookieTokenObtainPairView, CookieTokenRefreshView, LogoutView

urlpatterns = [
    path('auth/token/',         CookieTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', CookieTokenRefreshView.as_view(),    name='token_refresh'),
    path('auth/logout/',        LogoutView.as_view(),                 name='logout'),

    path('habitaciones/', include('apps.habitaciones.urls')),
    path('inquilinos/',   include('apps.inquilinos.urls')),
    path('contratos/',    include('apps.contratos.urls')),
    path('pagos/',        include('apps.pagos.urls')),
    path('usuarios/',     include('apps.usuarios.urls')),
]
