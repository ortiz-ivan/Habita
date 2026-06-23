from typing import Any

from django.http import HttpRequest
from django.db.models import Model
from rest_framework.request import Request
from rest_framework.serializers import BaseSerializer

from .models import AuditLog


def get_ip(request: HttpRequest | Request) -> str | None:
    forwarded = request.META.get('HTTP_X_FORWARDED_FOR')
    return forwarded.split(',')[0].strip() if forwarded else request.META.get('REMOTE_ADDR')


class AuditMixin:
    """
    Mixin para ModelViewSet que registra crear/editar/eliminar automáticamente.
    Definir audit_recurso = 'nombre' en el ViewSet.
    Para ViewSets con perform_* personalizados, llamar self._log() manualmente.
    """
    audit_recurso: str = ''

    def _log(self, accion: str, recurso_id: int | None = None, descripcion: str = '') -> None:
        request: Request = self.request  # type: ignore[attr-defined]
        AuditLog.objects.create(
            usuario=request.user if request.user.is_authenticated else None,
            accion=accion,
            recurso=self.audit_recurso,
            recurso_id=recurso_id,
            descripcion=descripcion,
            ip=get_ip(request),
        )

    def perform_create(self, serializer: BaseSerializer[Any]) -> None:
        super().perform_create(serializer)  # type: ignore[misc]
        assert serializer.instance is not None  # garantizado por serializer.save()
        self._log(AuditLog.Accion.CREAR, serializer.instance.pk, str(serializer.instance))

    def perform_update(self, serializer: BaseSerializer[Any]) -> None:
        super().perform_update(serializer)  # type: ignore[misc]
        assert serializer.instance is not None  # garantizado por serializer.save()
        self._log(AuditLog.Accion.EDITAR, serializer.instance.pk, str(serializer.instance))

    def perform_destroy(self, instance: Model) -> None:
        pk, desc = instance.pk, str(instance)
        super().perform_destroy(instance)  # type: ignore[misc]
        self._log(AuditLog.Accion.ELIMINAR, pk, desc)
