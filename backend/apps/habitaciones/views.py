from rest_framework.viewsets import ModelViewSet
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Prefetch
from apps.contratos.models import Contrato
from .models import Habitacion
from .serializers import HabitacionSerializer


class HabitacionViewSet(ModelViewSet):
    queryset = Habitacion.objects.prefetch_related(
        Prefetch(
            'contratos',
            queryset=Contrato.objects.filter(
                estado__in=['activo', 'moroso']
            ).select_related('inquilino'),
            to_attr='contratos_activos',
        )
    )
    serializer_class = HabitacionSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['estado', 'piso', 'tiene_banio_privado']
    search_fields = ['numero', 'descripcion']
    ordering_fields = ['piso', 'numero', 'precio']
    ordering = ['piso', 'numero']
