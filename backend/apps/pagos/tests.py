import datetime
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from apps.usuarios.models import Usuario
from apps.habitaciones.models import Habitacion
from apps.inquilinos.models import Inquilino
from apps.contratos.models import Contrato
from apps.pagos.models import Pago
from apps.pagos.services import sincronizar_estados_vencimiento, DIAS_POR_VENCER


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
        fecha_fin=datetime.date.today() + datetime.timedelta(days=365),
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
            'fecha_vencimiento': str(datetime.date.today()),
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
            fecha_vencimiento=datetime.date.today(), fecha_pago=datetime.date.today(),
            metodo_pago=Pago.MetodoPago.EFECTIVO,
            estado=Pago.Estado.PAGADO,
        )
        Pago.objects.create(
            contrato=self.contrato, monto=300_000,
            fecha_vencimiento=datetime.date.today(), fecha_pago=datetime.date.today(),
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
            fecha_vencimiento=datetime.date.today(), fecha_pago=datetime.date.today(),
            metodo_pago=Pago.MetodoPago.EFECTIVO,
            estado=Pago.Estado.PENDIENTE,
        )
        response = self.client.patch(f'/api/v1/pagos/{pago.pk}/', {'estado': 'pagado'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        pago.refresh_from_db()
        self.assertEqual(pago.estado, Pago.Estado.PAGADO)

    def test_cobrar_no_pisa_fecha_vencimiento(self):
        vencimiento = datetime.date.today() - datetime.timedelta(days=3)
        pago = Pago.objects.create(
            contrato=self.contrato, monto=500_000,
            fecha_vencimiento=vencimiento, fecha_pago=vencimiento,
            metodo_pago=Pago.MetodoPago.EFECTIVO,
            estado=Pago.Estado.VENCIDO,
        )
        hoy = datetime.date.today()
        response = self.client.patch(
            f'/api/v1/pagos/{pago.pk}/',
            {'estado': 'pagado', 'fecha_pago': str(hoy)},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        pago.refresh_from_db()
        self.assertEqual(pago.estado, Pago.Estado.PAGADO)
        self.assertEqual(pago.fecha_pago, hoy)
        self.assertEqual(pago.fecha_vencimiento, vencimiento)

    def test_delete_pago(self):
        pago = Pago.objects.create(
            contrato=self.contrato, monto=500_000,
            fecha_vencimiento=datetime.date.today(), fecha_pago=datetime.date.today(),
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
            contrato=self.contrato, monto=100_000, fecha_vencimiento=ayer, fecha_pago=ayer,
            metodo_pago=Pago.MetodoPago.EFECTIVO, estado=Pago.Estado.PAGADO,
        )
        Pago.objects.create(
            contrato=self.contrato, monto=200_000, fecha_vencimiento=hoy, fecha_pago=hoy,
            metodo_pago=Pago.MetodoPago.TRANSFERENCIA, estado=Pago.Estado.PENDIENTE,
        )
        Pago.objects.create(
            contrato=self.contrato, monto=300_000, fecha_vencimiento=manana, fecha_pago=manana,
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
            contrato=contrato2, monto=500_000,
            fecha_vencimiento=datetime.date.today(), fecha_pago=datetime.date.today(),
            metodo_pago=Pago.MetodoPago.EFECTIVO, estado=Pago.Estado.PENDIENTE,
        )
        response = self.client.get(f'/api/v1/pagos/?contrato={self.contrato.pk}')
        self.assertEqual(response.data['count'], 3)

    def test_filter_fecha_sin_resultados_devuelve_cero(self):
        futuro = self.manana + datetime.timedelta(days=30)
        response = self.client.get(f'/api/v1/pagos/?fecha_desde={futuro}')
        self.assertEqual(response.data['count'], 0)


class SincronizarEstadosVencimientoTest(TestCase):
    """Cubre apps.pagos.services.sincronizar_estados_vencimiento."""

    def setUp(self):
        self.hab = make_habitacion()
        self.inq = make_inquilino()
        self.contrato = make_contrato(self.hab, self.inq)
        self.hoy = datetime.date.today()

    def _make_pago(self, estado, fecha_vencimiento):
        return Pago.objects.create(
            contrato=self.contrato, monto=500_000,
            fecha_vencimiento=fecha_vencimiento, fecha_pago=fecha_vencimiento,
            metodo_pago=Pago.MetodoPago.EFECTIVO, estado=estado,
        )

    def test_pendiente_vencido_pasa_a_vencido(self):
        pago = self._make_pago(Pago.Estado.PENDIENTE, self.hoy - datetime.timedelta(days=1))
        sincronizar_estados_vencimiento(self.hoy)
        pago.refresh_from_db()
        self.assertEqual(pago.estado, Pago.Estado.VENCIDO)

    def test_pendiente_hoy_no_es_vencido(self):
        pago = self._make_pago(Pago.Estado.PENDIENTE, self.hoy)
        sincronizar_estados_vencimiento(self.hoy)
        pago.refresh_from_db()
        self.assertNotEqual(pago.estado, Pago.Estado.VENCIDO)

    def test_pendiente_dentro_del_umbral_pasa_a_por_vencer(self):
        pago = self._make_pago(Pago.Estado.PENDIENTE, self.hoy + datetime.timedelta(days=DIAS_POR_VENCER))
        sincronizar_estados_vencimiento(self.hoy)
        pago.refresh_from_db()
        self.assertEqual(pago.estado, Pago.Estado.POR_VENCER)

    def test_pendiente_lejos_del_umbral_no_cambia(self):
        pago = self._make_pago(Pago.Estado.PENDIENTE, self.hoy + datetime.timedelta(days=DIAS_POR_VENCER + 1))
        sincronizar_estados_vencimiento(self.hoy)
        pago.refresh_from_db()
        self.assertEqual(pago.estado, Pago.Estado.PENDIENTE)

    def test_por_vencer_vencido_pasa_a_vencido(self):
        pago = self._make_pago(Pago.Estado.POR_VENCER, self.hoy - datetime.timedelta(days=1))
        sincronizar_estados_vencimiento(self.hoy)
        pago.refresh_from_db()
        self.assertEqual(pago.estado, Pago.Estado.VENCIDO)

    def test_por_vencer_fuera_de_umbral_vuelve_a_pendiente(self):
        pago = self._make_pago(Pago.Estado.POR_VENCER, self.hoy + datetime.timedelta(days=DIAS_POR_VENCER + 5))
        sincronizar_estados_vencimiento(self.hoy)
        pago.refresh_from_db()
        self.assertEqual(pago.estado, Pago.Estado.PENDIENTE)

    def test_vencido_es_pegajoso_no_se_revierte(self):
        pago = self._make_pago(Pago.Estado.VENCIDO, self.hoy + datetime.timedelta(days=10))
        sincronizar_estados_vencimiento(self.hoy)
        pago.refresh_from_db()
        self.assertEqual(pago.estado, Pago.Estado.VENCIDO)

    def test_pagado_nunca_se_toca(self):
        pago = self._make_pago(Pago.Estado.PAGADO, self.hoy - datetime.timedelta(days=30))
        sincronizar_estados_vencimiento(self.hoy)
        pago.refresh_from_db()
        self.assertEqual(pago.estado, Pago.Estado.PAGADO)

    def test_parcial_nunca_se_toca(self):
        pago = self._make_pago(Pago.Estado.PARCIAL, self.hoy - datetime.timedelta(days=30))
        sincronizar_estados_vencimiento(self.hoy)
        pago.refresh_from_db()
        self.assertEqual(pago.estado, Pago.Estado.PARCIAL)

    def test_filtro_por_estado_por_vencer_via_api(self):
        client = APIClient()
        user = Usuario.objects.create_user(username='syncuser', password='pass1234')
        client.force_authenticate(user=user)
        self._make_pago(Pago.Estado.PENDIENTE, self.hoy + datetime.timedelta(days=1))
        # El middleware sincroniza antes de que la vista resuelva el queryset.
        response = client.get('/api/v1/pagos/?estado=por_vencer')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['estado'], 'por_vencer')
