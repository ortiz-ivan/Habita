import datetime
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from apps.usuarios.models import Usuario
from apps.habitaciones.models import Habitacion
from apps.inquilinos.models import Inquilino
from apps.contratos.models import Contrato
from apps.pagos.models import Pago


def make_habitacion(numero='101'):
    return Habitacion.objects.create(numero=numero, piso=1, precio=500_000)


def make_inquilino(email='i@test.com', documento='999'):
    return Inquilino.objects.create(
        nombre='Ana', apellido='López',
        telefono='0981000000', email=email,
        documento=documento, fecha_ingreso=datetime.date.today(),
        contacto_emergencia='—',
    )


def make_contrato(habitacion, inquilino):
    return Contrato.objects.create(
        habitacion=habitacion,
        inquilino=inquilino,
        fecha_inicio=datetime.date.today(),
        monto_mensual=500_000,
        deposito=500_000,
        estado=Contrato.Estado.ACTIVO,
    )


class PagoAPITest(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.user = Usuario.objects.create_user(username='testuser', password='pass1234')
        self.client.force_authenticate(user=self.user)

        self.hab = make_habitacion()
        self.inq = make_inquilino()
        self.contrato = make_contrato(self.hab, self.inq)

    def _pago_data(self, estado=Pago.Estado.PENDIENTE):
        return {
            'contrato': self.contrato.pk,
            'monto': 500_000,
            'fecha_pago': str(datetime.date.today()),
            'metodo_pago': Pago.MetodoPago.EFECTIVO,
            'estado': estado,
        }

    def test_create_pago_requires_auth(self):
        anon = APIClient()
        response = anon.post('/api/v1/pagos/', self._pago_data(), format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_pago_authenticated(self):
        response = self.client.post('/api/v1/pagos/', self._pago_data(), format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Pago.objects.count(), 1)

    def test_list_pagos(self):
        Pago.objects.create(**{**self._pago_data(), 'contrato': self.contrato})
        response = self.client.get('/api/v1/pagos/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)

    def test_filter_pagos_by_estado(self):
        Pago.objects.create(
            contrato=self.contrato, monto=500_000,
            fecha_pago=datetime.date.today(),
            metodo_pago=Pago.MetodoPago.EFECTIVO,
            estado=Pago.Estado.PAGADO,
        )
        Pago.objects.create(
            contrato=self.contrato, monto=300_000,
            fecha_pago=datetime.date.today(),
            metodo_pago=Pago.MetodoPago.EFECTIVO,
            estado=Pago.Estado.VENCIDO,
        )

        response = self.client.get('/api/v1/pagos/?estado=vencido')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['estado'], 'vencido')

    def test_update_pago(self):
        pago = Pago.objects.create(
            contrato=self.contrato, monto=500_000,
            fecha_pago=datetime.date.today(),
            metodo_pago=Pago.MetodoPago.EFECTIVO,
            estado=Pago.Estado.PENDIENTE,
        )
        response = self.client.patch(f'/api/v1/pagos/{pago.pk}/', {'estado': 'pagado'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        pago.refresh_from_db()
        self.assertEqual(pago.estado, Pago.Estado.PAGADO)

    def test_delete_pago(self):
        pago = Pago.objects.create(
            contrato=self.contrato, monto=500_000,
            fecha_pago=datetime.date.today(),
            metodo_pago=Pago.MetodoPago.EFECTIVO,
            estado=Pago.Estado.PENDIENTE,
        )
        response = self.client.delete(f'/api/v1/pagos/{pago.pk}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Pago.objects.count(), 0)


class PagoFiltrosFechaTest(TestCase):
    """Cubre el PagoFilter: fecha_desde, fecha_hasta y metodo_pago."""

    def setUp(self):
        self.client = APIClient()
        self.user = Usuario.objects.create_user(username='testuser2', password='pass1234')
        self.client.force_authenticate(user=self.user)

        hab = make_habitacion('201')
        inq = make_inquilino(email='fdate@test.com', documento='800')
        self.contrato = make_contrato(hab, inq)

        hoy = datetime.date.today()
        ayer = hoy - datetime.timedelta(days=1)
        manana = hoy + datetime.timedelta(days=1)

        Pago.objects.create(
            contrato=self.contrato, monto=100_000, fecha_pago=ayer,
            metodo_pago=Pago.MetodoPago.EFECTIVO, estado=Pago.Estado.PAGADO,
        )
        Pago.objects.create(
            contrato=self.contrato, monto=200_000, fecha_pago=hoy,
            metodo_pago=Pago.MetodoPago.TRANSFERENCIA, estado=Pago.Estado.PENDIENTE,
        )
        Pago.objects.create(
            contrato=self.contrato, monto=300_000, fecha_pago=manana,
            metodo_pago=Pago.MetodoPago.QR, estado=Pago.Estado.PENDIENTE,
        )
        self.hoy = hoy
        self.ayer = ayer
        self.manana = manana

    def test_filter_fecha_desde_excluye_anteriores(self):
        response = self.client.get(f'/api/v1/pagos/?fecha_desde={self.hoy}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 2)  # hoy + mañana

    def test_filter_fecha_hasta_excluye_posteriores(self):
        response = self.client.get(f'/api/v1/pagos/?fecha_hasta={self.hoy}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 2)  # ayer + hoy

    def test_filter_rango_exacto_devuelve_un_dia(self):
        response = self.client.get(f'/api/v1/pagos/?fecha_desde={self.hoy}&fecha_hasta={self.hoy}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)

    def test_filter_metodo_pago_transferencia(self):
        response = self.client.get('/api/v1/pagos/?metodo_pago=transferencia')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['metodo_pago'], 'transferencia')

    def test_filter_por_contrato(self):
        hab2 = make_habitacion('301')
        inq2 = make_inquilino(email='second@test.com', documento='700')
        contrato2 = make_contrato(hab2, inq2)
        Pago.objects.create(
            contrato=contrato2, monto=500_000, fecha_pago=datetime.date.today(),
            metodo_pago=Pago.MetodoPago.EFECTIVO, estado=Pago.Estado.PENDIENTE,
        )
        response = self.client.get(f'/api/v1/pagos/?contrato={self.contrato.pk}')
        self.assertEqual(response.data['count'], 3)

    def test_filter_fecha_sin_resultados_devuelve_cero(self):
        futuro = self.manana + datetime.timedelta(days=30)
        response = self.client.get(f'/api/v1/pagos/?fecha_desde={futuro}')
        self.assertEqual(response.data['count'], 0)
