from django.db.models import Prefetch, QuerySet
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.viewsets import ModelViewSet

from apps.auditoria.mixins import AuditMixin
from apps.contratos.models import Contrato
from .models import Inquilino
from .serializers import InquilinoSerializer


class InquilinoViewSet(AuditMixin, ModelViewSet):
    audit_recurso = 'inquilino'
    queryset: QuerySet[Inquilino] = Inquilino.objects.prefetch_related(
        Prefetch(
            'contratos',
            queryset=Contrato.objects.filter(
                estado__in=['activo', 'moroso']
            ).select_related('habitacion').prefetch_related('pagos').order_by('-created_at'),
            to_attr='contratos_activos',
        )
    )
    serializer_class = InquilinoSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['fecha_ingreso']
    search_fields = ['nombre', 'apellido', 'documento', 'email']
    ordering_fields = ['apellido', 'nombre', 'fecha_ingreso']
    ordering = ['apellido', 'nombre']
