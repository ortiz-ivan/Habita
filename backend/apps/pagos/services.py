from datetime import date, timedelta

from django.conf import settings
from django.utils import timezone

from .models import Pago

DIAS_POR_VENCER = getattr(settings, 'PAGOS_DIAS_POR_VENCER', 5)


def sincronizar_estados_vencimiento(hoy: date | None = None) -> dict[str, int]:
    """Deriva 'por_vencer' y 'vencido' a partir de fecha_vencimiento vs. hoy.

    Solo transiciona pagos en pendiente/por_vencer: pagado y parcial
    quedan siempre bajo control manual, y vencido es un estado "pegajoso"
    que solo se resuelve cobrando el pago (no se revierte por fecha).
    """
    hoy = hoy or timezone.now().date()
    limite = hoy + timedelta(days=DIAS_POR_VENCER)

    a_vencido = Pago.objects.filter(
        estado__in=[Pago.Estado.PENDIENTE, Pago.Estado.POR_VENCER],
        fecha_vencimiento__lt=hoy,
    ).update(estado=Pago.Estado.VENCIDO)

    a_por_vencer = Pago.objects.filter(
        estado=Pago.Estado.PENDIENTE,
        fecha_vencimiento__gte=hoy,
        fecha_vencimiento__lte=limite,
    ).update(estado=Pago.Estado.POR_VENCER)

    a_pendiente = Pago.objects.filter(
        estado=Pago.Estado.POR_VENCER,
        fecha_vencimiento__gt=limite,
    ).update(estado=Pago.Estado.PENDIENTE)

    return {'vencido': a_vencido, 'por_vencer': a_por_vencer, 'pendiente': a_pendiente}
