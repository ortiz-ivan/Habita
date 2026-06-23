from __future__ import annotations

from typing import TYPE_CHECKING

from django.db import transaction
from apps.habitaciones.models import Habitacion

if TYPE_CHECKING:
    from .models import Contrato

# Contratos que implican ocupación de habitación
ESTADOS_ACTIVOS = frozenset(['activo', 'moroso'])


def _sincronizar_habitacion(habitacion: Habitacion) -> None:
    """Ajusta el estado de la habitación según si tiene contratos activos."""
    from .models import Contrato
    tiene_activo = Contrato.objects.filter(
        habitacion=habitacion,
        estado__in=ESTADOS_ACTIVOS,
    ).exists()
    nuevo = Habitacion.Estado.OCUPADA if tiene_activo else Habitacion.Estado.DISPONIBLE
    if habitacion.estado != nuevo:
        habitacion.estado = nuevo
        habitacion.save(update_fields=['estado', 'updated_at'])


@transaction.atomic
def on_contrato_created(contrato: Contrato) -> None:
    _sincronizar_habitacion(contrato.habitacion)


@transaction.atomic
def on_contrato_updated(contrato: Contrato, habitacion_prev: Habitacion, estado_prev: str) -> None:
    # Si cambió la habitación, liberar la anterior también
    if habitacion_prev.pk != contrato.habitacion.pk:
        _sincronizar_habitacion(habitacion_prev)
    _sincronizar_habitacion(contrato.habitacion)


@transaction.atomic
def on_contrato_deleted(habitacion: Habitacion, estado: str) -> None:
    _sincronizar_habitacion(habitacion)
