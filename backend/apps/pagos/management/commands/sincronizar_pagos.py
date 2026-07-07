from typing import Any

from django.core.management.base import BaseCommand

from apps.pagos.services import sincronizar_estados_vencimiento


class Command(BaseCommand):
    help = (
        'Recalcula el estado de los pagos (pendiente/por_vencer/vencido) según fecha_pago. '
        'El middleware ya lo hace en cada request; este comando es para correrlo manualmente '
        'o vía cron/tarea programada externa si se prefiere no depender del middleware.'
    )

    def handle(self, *args: Any, **options: Any) -> None:
        resultado = sincronizar_estados_vencimiento()
        self.stdout.write(self.style.SUCCESS(
            f'Actualizados: {resultado["vencido"]} a vencido, '
            f'{resultado["por_vencer"]} a por_vencer, '
            f'{resultado["pendiente"]} de vuelta a pendiente.'
        ))
