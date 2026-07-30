from datetime import date, timedelta
from typing import Any

from django.conf import settings
from django.db.models import Sum
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


def calcular_resumen(fecha_desde: str | None = None, fecha_hasta: str | None = None) -> dict[str, Any]:
    """Ingresos del mes actual/anterior y monto adeudado (opcionalmente acotado por fecha de vencimiento)."""
    hoy = timezone.now().date()
    inicio_mes = hoy.replace(day=1)
    fin_mes_anterior = inicio_mes - timedelta(days=1)
    inicio_mes_anterior = fin_mes_anterior.replace(day=1)

    ingresos_mes = Pago.objects.filter(
        estado='pagado',
        fecha_pago__gte=inicio_mes,
        fecha_pago__lte=hoy,
    ).aggregate(t=Sum('monto'))['t'] or 0

    ingresos_mes_anterior = Pago.objects.filter(
        estado='pagado',
        fecha_pago__gte=inicio_mes_anterior,
        fecha_pago__lte=fin_mes_anterior,
    ).aggregate(t=Sum('monto'))['t'] or 0

    qs_adeudado = Pago.objects.filter(estado__in=['pendiente', 'por_vencer', 'vencido'])
    if fecha_desde:
        qs_adeudado = qs_adeudado.filter(fecha_vencimiento__gte=fecha_desde)
    if fecha_hasta:
        qs_adeudado = qs_adeudado.filter(fecha_vencimiento__lte=fecha_hasta)
    monto_adeudado = qs_adeudado.aggregate(t=Sum('monto'))['t'] or 0

    return {
        'ingresos_mes': ingresos_mes,
        'ingresos_mes_anterior': ingresos_mes_anterior,
        'monto_adeudado': monto_adeudado,
    }
