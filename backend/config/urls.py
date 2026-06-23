from django.contrib import admin
from django.urls import path, include
from django.http import HttpRequest, JsonResponse


def health(request: HttpRequest) -> JsonResponse:
    return JsonResponse({'status': 'ok'})


urlpatterns = [
    path('health/', health),
    path('admin/', admin.site.urls),
    path('api/v1/', include('config.urls_v1')),
]
