from rest_framework.routers import DefaultRouter
from .views import HabitacionViewSet, TipoHabitacionViewSet

router = DefaultRouter()
router.register('tipos', TipoHabitacionViewSet, basename='tipo-habitacion')
router.register('', HabitacionViewSet, basename='habitacion')

urlpatterns = router.urls
