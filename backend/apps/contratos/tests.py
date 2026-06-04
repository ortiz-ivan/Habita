import datetime
from io import StringIO
from django.core.management import call_command
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from apps.usuarios.models import Usuario
from apps.habitaciones.models import Habitacion
from apps.inquilinos.models import Inquilino
from apps.contratos.models import Contrato
from apps.contratos.services import on_contrato_created, on_contrato_deleted, on_contrato_updated
from apps.pagos.models import Pago


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

    def test_contrato_moroso_mantiene_habitacion_ocupada(self):
        hab = make_habitacion()
        inq = make_inquilino()
        contrato = make_contrato(hab, inq, estado=Contrato.Estado.MOROSO)

        on_contrato_created(contrato)

        hab.refresh_from_db()
        self.assertEqual(hab.estado, Habitacion.Estado.OCUPADA)

    def test_on_contrato_deleted_estado_inactivo_no_sincroniza(self):
        hab = make_habitacion()
        inq = make_inquilino()
        contrato = make_contrato(hab, inq, estado=Contrato.Estado.FINALIZADO)
        contrato.delete()

        on_contrato_deleted(hab, Contrato.Estado.FINALIZADO)

        hab.refresh_from_db()
        self.assertEqual(hab.estado, Habitacion.Estado.DISPONIBLE)


class ContratoAPITest(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.user = Usuario.objects.create_user(username='testuser', password='pass1234')
        self.client.force_authenticate(user=self.user)
        self.hab = make_habitacion()
        self.inq = make_inquilino()

    def _data(self, **kwargs):
        defaults = dict(
            habitacion=self.hab.pk,
            inquilino=self.inq.pk,
            fecha_inicio=str(datetime.date.today()),
            monto_mensual=500_000,
            deposito=500_000,
            estado=Contrato.Estado.ACTIVO,
        )
        defaults.update(kwargs)
        return defaults

    # --- Autenticación ---

    def test_create_requiere_autenticacion(self):
        anon = APIClient()
        self.assertEqual(
            anon.post('/api/v1/contratos/', self._data(), format='json').status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    # --- Integración servicio + API ---

    def test_create_via_api_marca_habitacion_ocupada(self):
        response = self.client.post('/api/v1/contratos/', self._data(), format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.hab.refresh_from_db()
        self.assertEqual(self.hab.estado, Habitacion.Estado.OCUPADA)

    def test_delete_via_api_libera_habitacion(self):
        create_resp = self.client.post('/api/v1/contratos/', self._data(), format='json')
        contrato_id = create_resp.data['id']
        self.hab.refresh_from_db()
        self.assertEqual(self.hab.estado, Habitacion.Estado.OCUPADA)

        delete_resp = self.client.delete(f'/api/v1/contratos/{contrato_id}/')
        self.assertEqual(delete_resp.status_code, status.HTTP_204_NO_CONTENT)
        self.hab.refresh_from_db()
        self.assertEqual(self.hab.estado, Habitacion.Estado.DISPONIBLE)

    def test_finalizar_contrato_libera_habitacion(self):
        create_resp = self.client.post('/api/v1/contratos/', self._data(), format='json')
        contrato_id = create_resp.data['id']
        self.hab.refresh_from_db()
        self.assertEqual(self.hab.estado, Habitacion.Estado.OCUPADA)

        patch_resp = self.client.patch(
            f'/api/v1/contratos/{contrato_id}/', {'estado': 'finalizado'}, format='json',
        )
        self.assertEqual(patch_resp.status_code, status.HTTP_200_OK)
        self.hab.refresh_from_db()
        self.assertEqual(self.hab.estado, Habitacion.Estado.DISPONIBLE)

    # --- Validación de regla de negocio ---

    def test_no_permite_dos_contratos_activos_misma_habitacion(self):
        inq2 = make_inquilino(email='otro@test.com', documento='222')
        make_contrato(self.hab, self.inq)
        response = self.client.post(
            '/api/v1/contratos/', self._data(inquilino=inq2.pk), format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('habitacion', str(response.data))

    def test_si_permite_contrato_activo_si_otro_esta_finalizado(self):
        inq2 = make_inquilino(email='otro@test.com', documento='222')
        make_contrato(self.hab, self.inq, estado=Contrato.Estado.FINALIZADO)
        response = self.client.post(
            '/api/v1/contratos/', self._data(inquilino=inq2.pk), format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    # --- Filtros y búsqueda ---

    def test_filter_por_estado(self):
        make_contrato(self.hab, self.inq, estado=Contrato.Estado.ACTIVO)
        hab2 = make_habitacion(numero='102')
        inq2 = make_inquilino(email='b@test.com', documento='222')
        make_contrato(hab2, inq2, estado=Contrato.Estado.FINALIZADO)
        response = self.client.get('/api/v1/contratos/?estado=activo')
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['estado'], 'activo')

    def test_filter_por_inquilino(self):
        make_contrato(self.hab, self.inq)
        inq2 = make_inquilino(email='b@test.com', documento='222')
        hab2 = make_habitacion(numero='102')
        make_contrato(hab2, inq2)
        response = self.client.get(f'/api/v1/contratos/?inquilino={self.inq.pk}')
        self.assertEqual(response.data['count'], 1)

    def test_filter_por_habitacion(self):
        make_contrato(self.hab, self.inq)
        inq2 = make_inquilino(email='b@test.com', documento='222')
        hab2 = make_habitacion(numero='102')
        make_contrato(hab2, inq2)
        response = self.client.get(f'/api/v1/contratos/?habitacion={hab2.pk}')
        self.assertEqual(response.data['count'], 1)

    def test_search_por_nombre_inquilino(self):
        make_contrato(self.hab, self.inq)  # 'Juan Pérez'
        response = self.client.get('/api/v1/contratos/?search=Juan')
        self.assertEqual(response.data['count'], 1)

    def test_search_por_numero_habitacion(self):
        make_contrato(self.hab, self.inq)  # numero='101'
        response = self.client.get('/api/v1/contratos/?search=101')
        self.assertEqual(response.data['count'], 1)

    def test_read_serializer_anida_habitacion_e_inquilino(self):
        make_contrato(self.hab, self.inq)
        response = self.client.get('/api/v1/contratos/')
        result = response.data['results'][0]
        self.assertIn('numero', result['habitacion'])
        self.assertIn('nombre', result['inquilino'])


class MarcarMorososCommandTest(TestCase):

    def setUp(self):
        self.hab = make_habitacion()
        self.inq = make_inquilino()
        self.contrato = make_contrato(self.hab, self.inq, estado=Contrato.Estado.ACTIVO)

    def _make_pago(self, estado):
        return Pago.objects.create(
            contrato=self.contrato,
            monto=500_000,
            fecha_pago=datetime.date.today(),
            metodo_pago=Pago.MetodoPago.EFECTIVO,
            estado=estado,
        )

    def test_marca_contrato_con_pago_vencido_como_moroso(self):
        self._make_pago(Pago.Estado.VENCIDO)
        call_command('marcar_morosos', stdout=StringIO())
        self.contrato.refresh_from_db()
        self.assertEqual(self.contrato.estado, Contrato.Estado.MOROSO)

    def test_no_afecta_contratos_sin_pagos_vencidos(self):
        self._make_pago(Pago.Estado.PAGADO)
        call_command('marcar_morosos', stdout=StringIO())
        self.contrato.refresh_from_db()
        self.assertEqual(self.contrato.estado, Contrato.Estado.ACTIVO)

    def test_dry_run_no_modifica_la_base_de_datos(self):
        self._make_pago(Pago.Estado.VENCIDO)
        call_command('marcar_morosos', dry_run=True, stdout=StringIO())
        self.contrato.refresh_from_db()
        self.assertEqual(self.contrato.estado, Contrato.Estado.ACTIVO)

    def test_no_marca_contratos_ya_finalizados(self):
        contrato_fin = make_contrato(
            make_habitacion(numero='102'),
            make_inquilino(email='b@t.com', documento='222'),
            estado=Contrato.Estado.FINALIZADO,
        )
        Pago.objects.create(
            contrato=contrato_fin, monto=500_000,
            fecha_pago=datetime.date.today(),
            metodo_pago=Pago.MetodoPago.EFECTIVO,
            estado=Pago.Estado.VENCIDO,
        )
        call_command('marcar_morosos', stdout=StringIO())
        contrato_fin.refresh_from_db()
        self.assertEqual(contrato_fin.estado, Contrato.Estado.FINALIZADO)

    def test_output_cuando_no_hay_candidatos(self):
        out = StringIO()
        call_command('marcar_morosos', stdout=out)
        self.assertIn('No hay contratos', out.getvalue())
