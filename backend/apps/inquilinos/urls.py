from rest_framework.routers import DefaultRouter
from .views import InquilinoViewSet

router = DefaultRouter()
router.register('', InquilinoViewSet, basename='inquilino')

urlpatterns = router.urls
