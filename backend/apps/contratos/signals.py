from __future__ import annotations

from typing import Any, TYPE_CHECKING

from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

if TYPE_CHECKING:
    from .models import Contrato


@receiver(post_save, sender='contratos.Contrato')
def sync_habitacion_on_save(sender: type[Any], instance: Contrato, **kwargs: Any) -> None:
    from .services import _sincronizar_habitacion
    _sincronizar_habitacion(instance.habitacion)


@receiver(post_delete, sender='contratos.Contrato')
def sync_habitacion_on_delete(sender: type[Any], instance: Contrato, **kwargs: Any) -> None:
    from .services import _sincronizar_habitacion, ESTADOS_ACTIVOS
    if instance.estado in ESTADOS_ACTIVOS:
        _sincronizar_habitacion(instance.habitacion)
