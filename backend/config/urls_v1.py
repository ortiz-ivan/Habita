from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('auth/token/',         TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(),   name='token_refresh'),

    path('habitaciones/', include('apps.habitaciones.urls')),
    path('inquilinos/',   include('apps.inquilinos.urls')),
    path('contratos/',    include('apps.contratos.urls')),
    path('pagos/',        include('apps.pagos.urls')),
    path('usuarios/',     include('apps.usuarios.urls')),
]
