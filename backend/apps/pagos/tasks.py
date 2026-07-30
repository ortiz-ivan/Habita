from celery import shared_task

from .services import sincronizar_estados_vencimiento


@shared_task
def sincronizar_pagos_task() -> dict[str, int]:
    return sincronizar_estados_vencimiento()
