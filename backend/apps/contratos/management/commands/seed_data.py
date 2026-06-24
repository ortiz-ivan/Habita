"""
Management command to populate the database with realistic simulated data.
Run with: python manage.py seed_data [--clear]
"""
import random
from argparse import ArgumentParser
from datetime import date, timedelta
from typing import Any

from django.core.management.base import BaseCommand
from django.db import transaction
from apps.habitaciones.models import Habitacion
from apps.inquilinos.models import Inquilino
from apps.contratos.models import Contrato
from apps.pagos.models import Pago


NOMBRES = [
    "Carlos", "María", "Juan", "Ana", "Luis", "Sofía", "Diego", "Valentina",
    "Andrés", "Camila", "Rodrigo", "Gabriela", "Sebastián", "Natalia", "Felipe",
    "Lucía", "Matías", "Paula", "Nicolás", "Daniela", "Jorge", "Fernanda",
    "Ricardo", "Verónica", "Alejandro", "Patricia", "Gustavo", "Claudia",
    "Eduardo", "Marcela",
]

APELLIDOS = [
    "García", "Martínez", "López", "Rodríguez", "González", "Pérez", "Sánchez",
    "Ramírez", "Torres", "Flores", "Rivera", "Morales", "Herrera", "Jiménez",
    "Vargas", "Castro", "Ramos", "Ortega", "Romero", "Aguilar", "Medina",
    "Reyes", "Chavez", "Díaz", "Vega", "Mendoza", "Guerrero", "Núñez",
    "Ruiz", "Salazar",
]

DESCRIPCIONES = [
    "Habitación luminosa con vista al patio interior.",
    "Amplio espacio con buena ventilación natural.",
    "Habitación tranquila en zona silenciosa del edificio.",
    "Incluye closet empotrado y estantería.",
    "Bien iluminada, piso de madera.",
    "Con vista a la calle, segundo piso.",
    "Habitación cómoda con calefacción incluida.",
    "Espacio funcional ideal para estudiante o profesional.",
    "Con muebles incluidos y excelente iluminación.",
    "",
]

OBSERVACIONES_CONTRATO = [
    "Inquilino referenciado por otro residente.",
    "Contrato renovado por segundo período.",
    "Se acordó pago los primeros 5 días del mes.",
    "Incluye servicio de limpieza semanal.",
    "",
    "",
    "",
]

OBSERVACIONES_PAGO = [
    "Pago realizado en horario de oficina.",
    "Se emitió recibo.",
    "Pago adelantado del siguiente mes.",
    "Abono parcial, diferencia pendiente.",
    "",
    "",
    "",
]


def random_date(start: date, end: date) -> date:
    delta = (end - start).days
    return start + timedelta(days=random.randint(0, delta))


def random_phone() -> str:
    prefixes = ["09", "09", "09", "02"]
    prefix = random.choice(prefixes)
    suffix = "".join([str(random.randint(0, 9)) for _ in range(8)])
    return prefix + suffix


def random_documento() -> str:
    return str(random.randint(1_000_000, 9_999_999))


class Command(BaseCommand):
    help = "Populates the database with simulated data for development/demo purposes."

    def add_arguments(self, parser: ArgumentParser) -> None:
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Delete all existing data before seeding.",
        )
        parser.add_argument(
            "--habitaciones",
            type=int,
            default=20,
            help="Number of rooms to create (default: 20).",
        )
        parser.add_argument(
            "--inquilinos",
            type=int,
            default=25,
            help="Number of tenants to create (default: 25).",
        )

    @transaction.atomic
    def handle(self, *args: Any, **options: Any) -> None:
        if options["clear"]:
            self.stdout.write("Clearing existing data...")
            Pago.objects.all().delete()
            Contrato.objects.all().delete()
            Inquilino.objects.all().delete()
            Habitacion.objects.all().delete()
            self.stdout.write(self.style.WARNING("All data cleared."))

        n_habitaciones = options["habitaciones"]
        n_inquilinos = options["inquilinos"]

        self.stdout.write(f"Creating {n_habitaciones} rooms...")
        habitaciones = self._create_habitaciones(n_habitaciones)

        self.stdout.write(f"Creating {n_inquilinos} tenants...")
        inquilinos = self._create_inquilinos(n_inquilinos)

        self.stdout.write("Creating contracts and payments...")
        self._create_contratos_y_pagos(habitaciones, inquilinos)

        self.stdout.write(self.style.SUCCESS("Seed completed successfully."))
        self._print_summary()

    def _create_habitaciones(self, count: int) -> list[Habitacion]:
        pisos = list(range(1, 5))
        habitaciones = []
        numeros_usados = set(
            Habitacion.objects.values_list("numero", flat=True)
        )

        created = 0
        attempts = 0
        while created < count and attempts < count * 3:
            attempts += 1
            piso = random.choice(pisos)
            numero = f"{piso}{random.randint(1, 15):02d}"
            if numero in numeros_usados:
                continue
            numeros_usados.add(numero)

            precio_base = random.choice([400_000, 450_000, 500_000, 550_000, 600_000, 650_000, 700_000, 800_000])
            hab = Habitacion.objects.create(
                numero=numero,
                piso=piso,
                precio=precio_base,
                estado=random.choices(
                    [
                        Habitacion.Estado.OCUPADA,
                        Habitacion.Estado.DISPONIBLE,
                        Habitacion.Estado.RESERVADA,
                        Habitacion.Estado.MANTENIMIENTO,
                    ],
                    weights=[55, 25, 12, 8],
                )[0],
                descripcion=random.choice(DESCRIPCIONES),
                capacidad=random.choices([1, 2, 3], weights=[60, 30, 10])[0],
                tiene_banio_privado=random.random() < 0.45,
            )
            habitaciones.append(hab)
            created += 1

        return habitaciones

    def _create_inquilinos(self, count: int) -> list[Inquilino]:
        inquilinos = []
        emails_usados = set(Inquilino.objects.values_list("email", flat=True))
        docs_usados = set(Inquilino.objects.values_list("documento", flat=True))

        created = 0
        attempts = 0
        today = date.today()
        while created < count and attempts < count * 3:
            attempts += 1
            nombre = random.choice(NOMBRES)
            apellido = random.choice(APELLIDOS)
            doc = random_documento()
            email = f"{nombre.lower()}.{apellido.lower()}{random.randint(1, 99)}@gmail.com"

            if email in emails_usados or doc in docs_usados:
                continue
            emails_usados.add(email)
            docs_usados.add(doc)

            fecha_ingreso = random_date(today - timedelta(days=730), today - timedelta(days=30))
            inq = Inquilino.objects.create(
                nombre=nombre,
                apellido=apellido,
                telefono=random_phone(),
                email=email,
                documento=doc,
                fecha_ingreso=fecha_ingreso,
                contacto_emergencia=f"{random.choice(NOMBRES)} {random.choice(APELLIDOS)} - {random_phone()}",
            )
            inquilinos.append(inq)
            created += 1

        return inquilinos

    def _create_contratos_y_pagos(
        self, habitaciones: list[Habitacion], inquilinos: list[Inquilino]
    ) -> None:
        today = date.today()
        random.shuffle(inquilinos)
        inquilino_pool = list(inquilinos)

        for hab in habitaciones:
            if hab.estado == Habitacion.Estado.MANTENIMIENTO:
                continue
            if hab.estado == Habitacion.Estado.DISPONIBLE and random.random() < 0.4:
                continue

            if not inquilino_pool:
                break

            inquilino = inquilino_pool.pop()

            # Decide if there's a historical closed contract before the active one
            tiene_historial = random.random() < 0.35
            if tiene_historial:
                hist_inicio = random_date(today - timedelta(days=900), today - timedelta(days=400))
                hist_fin = hist_inicio + timedelta(days=random.randint(90, 270))
                hist_estado = random.choice([Contrato.Estado.FINALIZADO, Contrato.Estado.CANCELADO])
                hist_monto = hab.precio - random.randint(0, 50_000)
                hist_contrato = Contrato.objects.create(
                    habitacion=hab,
                    inquilino=random.choice(inquilinos),
                    fecha_inicio=hist_inicio,
                    fecha_fin=hist_fin,
                    monto_mensual=hist_monto,
                    deposito=hist_monto,
                    estado=hist_estado,
                    observacion=random.choice(OBSERVACIONES_CONTRATO),
                )
                self._create_pagos_for_contrato(hist_contrato, hist_inicio, hist_fin, today, closed=True)

            # Active or recent contract
            if hab.estado == Habitacion.Estado.OCUPADA:
                contrato_inicio = random_date(today - timedelta(days=365), today - timedelta(days=15))
                contrato_fin = None
                estado = random.choices(
                    [Contrato.Estado.ACTIVO, Contrato.Estado.MOROSO],
                    weights=[80, 20],
                )[0]
            elif hab.estado == Habitacion.Estado.RESERVADA:
                contrato_inicio = today + timedelta(days=random.randint(1, 20))
                contrato_fin = None
                estado = Contrato.Estado.ACTIVO
            else:
                contrato_inicio = random_date(today - timedelta(days=200), today - timedelta(days=60))
                contrato_fin = contrato_inicio + timedelta(days=random.randint(60, 120))
                estado = Contrato.Estado.FINALIZADO

            monto_mensual = hab.precio + random.randint(-50_000, 50_000)
            contrato = Contrato.objects.create(
                habitacion=hab,
                inquilino=inquilino,
                fecha_inicio=contrato_inicio,
                fecha_fin=contrato_fin,  # type: ignore[misc]  # django-stubs no infiere null=True en create()
                monto_mensual=monto_mensual,
                deposito=monto_mensual,
                estado=estado,
                observacion=random.choice(OBSERVACIONES_CONTRATO),
            )

            end_for_pagos = contrato_fin or today
            if contrato_inicio <= today:
                self._create_pagos_for_contrato(
                    contrato,
                    contrato_inicio,
                    end_for_pagos,
                    today,
                    closed=(contrato.estado == Contrato.Estado.FINALIZADO),
                )

    def _create_pagos_for_contrato(
        self,
        contrato: Contrato,
        inicio: date,
        fin: date,
        today: date,
        closed: bool,
    ) -> None:
        metodos = list(Pago.MetodoPago.values)
        metodo_weights = [40, 35, 15, 10]  # efectivo, transferencia, tarjeta, qr

        current = date(inicio.year, inicio.month, 1)
        end = min(fin, today)

        while current <= end:
            due_day = min(5, 28)
            fecha_vencimiento = date(current.year, current.month, due_day)

            if closed or fecha_vencimiento <= today:
                if contrato.estado == Contrato.Estado.MOROSO and current >= today - timedelta(days=60):
                    estado = random.choices(
                        [Pago.Estado.VENCIDO, Pago.Estado.PENDIENTE],
                        weights=[60, 40],
                    )[0]
                    fecha_pago = fecha_vencimiento
                    metodo = None
                    monto = contrato.monto_mensual
                else:
                    paid_on_time = random.random() < 0.85
                    if paid_on_time:
                        offset = random.randint(-2, 5)
                        fecha_pago = fecha_vencimiento + timedelta(days=offset)
                        if fecha_pago > today:
                            fecha_pago = today
                        estado = Pago.Estado.PAGADO
                    else:
                        fecha_pago = fecha_vencimiento + timedelta(days=random.randint(6, 20))
                        if fecha_pago > today:
                            estado = Pago.Estado.PENDIENTE
                            fecha_pago = fecha_vencimiento
                        else:
                            estado = random.choice([Pago.Estado.PAGADO, Pago.Estado.PARCIAL])
                    metodo = random.choices(metodos, weights=metodo_weights)[0]
                    monto = contrato.monto_mensual
                    if estado == Pago.Estado.PARCIAL:
                        monto = int(monto * random.uniform(0.4, 0.8))
            else:
                # Future month
                estado = Pago.Estado.PENDIENTE
                fecha_pago = fecha_vencimiento
                metodo = None
                monto = contrato.monto_mensual

            Pago.objects.create(
                contrato=contrato,
                monto=monto,
                fecha_pago=fecha_pago,
                metodo_pago=metodo or Pago.MetodoPago.EFECTIVO,
                estado=estado,
                observacion=random.choice(OBSERVACIONES_PAGO),
            )

            # Advance to next month
            month = current.month + 1
            year = current.year
            if month > 12:
                month = 1
                year += 1
            current = date(year, month, 1)

    def _print_summary(self) -> None:
        self.stdout.write("\n--- Summary ---")
        self.stdout.write(f"  Habitaciones : {Habitacion.objects.count()}")
        self.stdout.write(f"  Inquilinos   : {Inquilino.objects.count()}")
        self.stdout.write(f"  Contratos    : {Contrato.objects.count()}")
        self.stdout.write(f"  Pagos        : {Pago.objects.count()}")
        self.stdout.write("")
        for eh in Habitacion.Estado:
            n = Habitacion.objects.filter(estado=eh).count()
            self.stdout.write(f"  Hab. {eh.label:<15}: {n}")
        self.stdout.write("")
        for ec in Contrato.Estado:
            n = Contrato.objects.filter(estado=ec).count()
            self.stdout.write(f"  Contratos {ec.label:<12}: {n}")
        self.stdout.write("")
        for ep in Pago.Estado:
            n = Pago.objects.filter(estado=ep).count()
            self.stdout.write(f"  Pagos {ep.label:<15}: {n}")
