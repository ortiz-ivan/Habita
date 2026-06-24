from typing import Any, cast

from django.db.models import Model, QuerySet
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.serializers import BaseSerializer
from rest_framework.viewsets import ModelViewSet

from apps.auditoria.mixins import AuditMixin
from apps.auditoria.models import AuditLog
from .models import Contrato
from .serializers import ContratoReadSerializer, ContratoWriteSerializer
from . import services


class ContratoViewSet(AuditMixin, ModelViewSet):
    audit_recurso = 'contrato'
    queryset: QuerySet[Contrato] = Contrato.objects.select_related('habitacion', 'inquilino').prefetch_related('pagos').all()
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['estado', 'habitacion', 'inquilino']
    search_fields = ['inquilino__nombre', 'inquilino__apellido', 'habitacion__numero']
    ordering_fields = ['fecha_inicio', 'fecha_fin', 'monto_mensual', 'created_at']
    ordering = ['-created_at']

    def get_serializer_class(self) -> type[BaseSerializer[Any]]:
        if self.action in ['create', 'update', 'partial_update']:
            return ContratoWriteSerializer
        return ContratoReadSerializer

    def perform_create(self, serializer: BaseSerializer[Any]) -> None:
        contrato = serializer.save()
        services.on_contrato_created(contrato)
        self._log(AuditLog.Accion.CREAR, contrato.pk, str(contrato))

    def perform_update(self, serializer: BaseSerializer[Any]) -> None:
        assert serializer.instance is not None
        habitacion_prev = serializer.instance.habitacion
        estado_prev = serializer.instance.estado
        contrato = serializer.save()
        services.on_contrato_updated(contrato, habitacion_prev, estado_prev)
        self._log(AuditLog.Accion.EDITAR, contrato.pk, str(contrato))

    def perform_destroy(self, instance: Model) -> None:
        contrato = cast(Contrato, instance)
        habitacion = contrato.habitacion
        estado = contrato.estado
        pk, desc = contrato.pk, str(contrato)
        contrato.delete()
        services.on_contrato_deleted(habitacion, estado)
        self._log(AuditLog.Accion.ELIMINAR, pk, desc)
