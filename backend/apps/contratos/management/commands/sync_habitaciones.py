from typing import Any

from django.core.management.base import BaseCommand
from apps.habitaciones.models import Habitacion
from apps.contratos.services import _sincronizar_habitacion


class Command(BaseCommand):
    help = 'Re-sincroniza el estado de todas las habitaciones basandose en sus contratos activos.'

    def handle(self, *args: Any, **options: Any) -> None:
        habitaciones = Habitacion.objects.all()
        cambiadas = 0
        for h in habitaciones:
            estado_antes = h.estado
            _sincronizar_habitacion(h)
            h.refresh_from_db()
            if h.estado != estado_antes:
                self.stdout.write(f'  Hab. {h.numero}: {estado_antes} -> {h.estado}')
                cambiadas += 1

        if cambiadas:
            self.stdout.write(self.style.SUCCESS(f'\n{cambiadas} habitacion(es) corregida(s).'))
        else:
            self.stdout.write(self.style.SUCCESS('\nTodo sincronizado, ningun cambio necesario.'))
