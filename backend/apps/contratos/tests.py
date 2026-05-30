import datetime
from django.test import TestCase
from apps.habitaciones.models import Habitacion
from apps.inquilinos.models import Inquilino
from apps.contratos.models import Contrato
from apps.contratos.services import on_contrato_created, on_contrato_deleted, on_contrato_updated


def make_habitacion(**kwargs):
    defaults = dict(numero='101', piso=1, precio=500_000)
    defaults.update(kwargs)
    return Habitacion.objects.create(**defaults)


def make_inquilino(**kwargs):
    defaults = dict(
        nombre='Juan', apellido='Pérez',
        telefono='0981000000', email='juan@test.com',
        documento='1234567', fecha_ingreso=datetime.date.today(),
        contacto_emergencia='María Pérez',
    )
    defaults.update(kwargs)
    return Inquilino.objects.create(**defaults)


def make_contrato(habitacion, inquilino, estado=Contrato.Estado.ACTIVO):
    return Contrato.objects.create(
        habitacion=habitacion,
        inquilino=inquilino,
        fecha_inicio=datetime.date.today(),
        monto_mensual=500_000,
        deposito=500_000,
        estado=estado,
    )


class ContratoServiceTest(TestCase):

    def test_on_contrato_created_sets_habitacion_ocupada(self):
        hab = make_habitacion()
        inq = make_inquilino()
        contrato = make_contrato(hab, inq)

        on_contrato_created(contrato)

        hab.refresh_from_db()
        self.assertEqual(hab.estado, Habitacion.Estado.OCUPADA)

    def test_on_contrato_created_no_cambia_si_estado_inactivo(self):
        hab = make_habitacion()
        inq = make_inquilino()
        contrato = make_contrato(hab, inq, estado=Contrato.Estado.FINALIZADO)

        on_contrato_created(contrato)

        hab.refresh_from_db()
        self.assertEqual(hab.estado, Habitacion.Estado.DISPONIBLE)

    def test_on_contrato_deleted_sets_habitacion_disponible(self):
        hab = make_habitacion(estado=Habitacion.Estado.OCUPADA)
        inq = make_inquilino()
        contrato = make_contrato(hab, inq)
        contrato.delete()

        on_contrato_deleted(hab, Contrato.Estado.ACTIVO)

        hab.refresh_from_db()
        self.assertEqual(hab.estado, Habitacion.Estado.DISPONIBLE)

    def test_no_libera_habitacion_si_quedan_contratos_activos(self):
        hab = make_habitacion()
        inq1 = make_inquilino(email='a@test.com', documento='111')
        inq2 = make_inquilino(email='b@test.com', documento='222')
        make_contrato(hab, inq1)
        contrato2 = make_contrato(hab, inq2)

        on_contrato_deleted(hab, Contrato.Estado.ACTIVO)

        hab.refresh_from_db()
        self.assertEqual(hab.estado, Habitacion.Estado.OCUPADA)

    def test_on_contrato_updated_libera_habitacion_anterior(self):
        hab1 = make_habitacion(numero='101', estado=Habitacion.Estado.OCUPADA)
        hab2 = make_habitacion(numero='102')
        inq = make_inquilino()
        contrato = make_contrato(hab1, inq)

        contrato.habitacion = hab2
        contrato.save()
        on_contrato_updated(contrato, hab1, Contrato.Estado.ACTIVO)

        hab1.refresh_from_db()
        hab2.refresh_from_db()
        self.assertEqual(hab1.estado, Habitacion.Estado.DISPONIBLE)
        self.assertEqual(hab2.estado, Habitacion.Estado.OCUPADA)
