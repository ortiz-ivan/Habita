
import datetime
from django.db.models.deletion import ProtectedError
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from apps.usuarios.models import Usuario
from apps.habitaciones.models import Habitacion
from apps.inquilinos.models import Inquilino
from apps.contratos.models import Contrato


def make_user():
    return Usuario.objects.create_user(username='testuser', password='pass1234')


def make_habitacion(numero='101', piso=1, precio=500_000, **kwargs):
    return Habitacion.objects.create(numero=numero, piso=piso, precio=precio, **kwargs)


def make_inquilino(email='test@test.com', documento='12345'):
    return Inquilino.objects.create(
        nombre='Ana', apellido='García', telefono='0981000000',
        email=email, documento=documento,
        fecha_ingreso=datetime.date.today(), contacto_emergencia='—',
    )


class HabitacionModelTest(TestCase):

    def test_str_incluye_numero(self):
        hab = make_habitacion(numero='101')
        self.assertIn('101', str(hab))

    def test_estado_default_disponible(self):
        hab = make_habitacion()
        self.assertEqual(hab.estado, Habitacion.Estado.DISPONIBLE)

    def test_numero_unico_a_nivel_modelo(self):
        from django.db import IntegrityError
        make_habitacion(numero='101')
        with self.assertRaises(IntegrityError):
            make_habitacion(numero='101')

    def test_no_puede_eliminarse_con_contrato_activo(self):
        hab = make_habitacion()
        inq = make_inquilino()
        Contrato.objects.create(
            habitacion=hab, inquilino=inq, fecha_inicio=datetime.date.today(),
            fecha_fin=datetime.date.today() + datetime.timedelta(days=365),
            monto_mensual=500_000, deposito=500_000,
        )
        with self.assertRaises(ProtectedError):
            hab.delete()


class HabitacionAPITest(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.user = make_user()
        self.client.force_authenticate(user=self.user)

    def _data(self, numero='101', **kwargs):
        return dict(numero=numero, piso=1, precio=500_000, **kwargs)

    # --- Autenticación ---

    def test_list_requiere_autenticacion(self):
        anon = APIClient()
        self.assertEqual(anon.get('/api/v1/habitaciones/').status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_requiere_autenticacion(self):
        anon = APIClient()
        self.assertEqual(anon.post('/api/v1/habitaciones/', self._data(), format='json').status_code, status.HTTP_401_UNAUTHORIZED)

    # --- CRUD básico ---

    def test_create_habitacion(self):
        response = self.client.post('/api/v1/habitaciones/', self._data(), format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Habitacion.objects.count(), 1)
        self.assertEqual(response.data['numero'], '101')

    def test_create_numero_duplicado_retorna_400(self):
        make_habitacion(numero='101')
        response = self.client.post('/api/v1/habitaciones/', self._data(numero='101'), format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_list_habitaciones(self):
        make_habitacion(numero='101')
        make_habitacion(numero='102')
        response = self.client.get('/api/v1/habitaciones/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 2)

    def test_retrieve_habitacion(self):
        hab = make_habitacion()
        response = self.client.get(f'/api/v1/habitaciones/{hab.pk}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['numero'], '101')

    def test_update_precio(self):
        hab = make_habitacion()
        response = self.client.patch(f'/api/v1/habitaciones/{hab.pk}/', {'precio': 750_000}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        hab.refresh_from_db()
        self.assertEqual(hab.precio, 750_000)

    def test_delete_sin_contratos(self):
        hab = make_habitacion()
        response = self.client.delete(f'/api/v1/habitaciones/{hab.pk}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Habitacion.objects.count(), 0)

    # --- Filtros ---

    def test_filter_por_estado(self):
        make_habitacion(numero='101', estado=Habitacion.Estado.DISPONIBLE)
        make_habitacion(numero='102', estado=Habitacion.Estado.OCUPADA)
        response = self.client.get('/api/v1/habitaciones/?estado=disponible')
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['numero'], '101')

    def test_filter_por_piso(self):
        make_habitacion(numero='101', piso=1)
        make_habitacion(numero='201', piso=2)
        response = self.client.get('/api/v1/habitaciones/?piso=2')
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['numero'], '201')

    def test_filter_por_banio_privado(self):
        make_habitacion(numero='101', tiene_banio_privado=True)
        make_habitacion(numero='102', tiene_banio_privado=False)
        response = self.client.get('/api/v1/habitaciones/?tiene_banio_privado=true')
        self.assertEqual(response.data['count'], 1)

    def test_search_por_numero(self):
        make_habitacion(numero='101A')
        make_habitacion(numero='202B')
        response = self.client.get('/api/v1/habitaciones/?search=101')
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['numero'], '101A')
