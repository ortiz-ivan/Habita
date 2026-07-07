from argparse import ArgumentParser
from typing import Any

from django.core.management.base import BaseCommand
from django.db import transaction
from apps.contratos.models import Contrato
from apps.pagos.services import sincronizar_estados_vencimiento


class Command(BaseCommand):
    help = 'Marca como morosos los contratos activos que tienen pagos vencidos.'

    def add_arguments(self, parser: ArgumentParser) -> None:
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Muestra los contratos afectados sin aplicar cambios.',
        )

    def handle(self, *args: Any, **options: Any) -> None:
        dry_run = options['dry_run']

        sincronizar_estados_vencimiento()

        candidatos = (
            Contrato.objects
            .filter(estado='activo', pagos__estado='vencido')
            .select_related('habitacion', 'inquilino')
            .distinct()
        )

        if not candidatos.exists():
            self.stdout.write('No hay contratos para marcar como morosos.')
            return

        for c in candidatos:
            self.stdout.write(
                f'{"[DRY-RUN] " if dry_run else ""}'
                f'Contrato #{c.id} — {c.inquilino} / Hab. {c.habitacion.numero}'
            )

        if not dry_run:
            with transaction.atomic():
                total = candidatos.update(estado='moroso')
            self.stdout.write(
                self.style.SUCCESS(f'{total} contrato(s) marcado(s) como morosos.')
            )
