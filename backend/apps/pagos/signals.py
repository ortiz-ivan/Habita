from typing import Any

from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from .models import Pago
from .services import invalidar_resumen_cache


@receiver(post_save, sender=Pago)
@receiver(post_delete, sender=Pago)
def _invalidar_resumen_al_modificar_pago(sender: type[Pago], **kwargs: Any) -> None:
    invalidar_resumen_cache()
