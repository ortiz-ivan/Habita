from rest_framework.viewsets import ModelViewSet
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from .models import Habitacion
from .serializers import HabitacionSerializer


class HabitacionViewSet(ModelViewSet):
    queryset = Habitacion.objects.all()
    serializer_class = HabitacionSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['estado', 'piso', 'tiene_banio_privado']
    search_fields = ['numero', 'descripcion']
    ordering_fields = ['piso', 'numero', 'precio']
    ordering = ['piso', 'numero']
