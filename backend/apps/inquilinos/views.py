from django.db.models import QuerySet
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.viewsets import ModelViewSet

from apps.auditoria.mixins import AuditMixin
from .models import Inquilino
from .serializers import InquilinoSerializer


class InquilinoViewSet(AuditMixin, ModelViewSet):
    audit_recurso = 'inquilino'
    queryset: QuerySet[Inquilino] = Inquilino.objects.prefetch_related('contratos__pagos').all()
    serializer_class = InquilinoSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['fecha_ingreso']
    search_fields = ['nombre', 'apellido', 'documento', 'email']
    ordering_fields = ['apellido', 'nombre', 'fecha_ingreso']
    ordering = ['apellido', 'nombre']
