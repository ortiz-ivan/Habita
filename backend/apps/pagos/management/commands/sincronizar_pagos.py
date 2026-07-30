from typing import Any

from django.core.management.base import BaseCommand

from apps.pagos.services import sincronizar_estados_vencimiento


class Command(BaseCommand):
    help = (
        'Recalcula el estado de los pagos (pendiente/por_vencer/vencido) según fecha_vencimiento. '
        'Se ejecuta automáticamente cada 15 min vía Celery Beat (ver apps.pagos.tasks); '
        'este comando es para correrlo manualmente si hace falta.'
    )

    def handle(self, *args: Any, **options: Any) -> None:
        resultado = sincronizar_estados_vencimiento()
        self.stdout.write(self.style.SUCCESS(
            f'Actualizados: {resultado["vencido"]} a vencido, '
            f'{resultado["por_vencer"]} a por_vencer, '
            f'{resultado["pendiente"]} de vuelta a pendiente.'
        ))
