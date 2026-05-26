from rest_framework.routers import DefaultRouter
from .views import ContratoViewSet

router = DefaultRouter()
router.register('', ContratoViewSet, basename='contrato')

urlpatterns = router.urls
