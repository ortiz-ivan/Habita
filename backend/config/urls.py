from django.contrib import admin
from django.urls import path, include
from django.http import HttpRequest, JsonResponse
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView


def health(request: HttpRequest) -> JsonResponse:
    return JsonResponse({'status': 'ok'})


urlpatterns = [
    path('health/', health),
    path('admin/', admin.site.urls),
    path('api/v1/', include('config.urls_v1')),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]
