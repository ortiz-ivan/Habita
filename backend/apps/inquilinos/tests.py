import datetime
from django.db.models.deletion import ProtectedError
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from apps.usuarios.models import Usuario
from apps.inquilinos.models import Inquilino
from apps.habitaciones.models import Habitacion
from apps.contratos.models import Contrato


def make_user():
    return Usuario.objects.create_user(username='testuser', password='pass1234')


def make_inquilino(nombre='Juan', apellido='Pérez', email='juan@test.com', documento='12345', **kwargs):
    defaults = dict(
        nombre=nombre, apellido=apellido, telefono='0981000000',
        email=email, documento=documento,
        fecha_ingreso=datetime.date.today(), contacto_emergencia='—',
    )
    defaults.update(kwargs)
    return Inquilino.objects.create(**defaults)


class InquilinoModelTest(TestCase):

    def test_str_incluye_apellido_y_nombre(self):
        inq = make_inquilino(nombre='Juan', apellido='Pérez')
        self.assertIn('Pérez', str(inq))
        self.assertIn('Juan', str(inq))

    def test_email_unico_a_nivel_modelo(self):
        from django.db import IntegrityError
        make_inquilino(email='dup@test.com', documento='111')
        with self.assertRaises(IntegrityError):
            make_inquilino(email='dup@test.com', documento='222')

    def test_documento_unico_a_nivel_modelo(self):
        from django.db import IntegrityError
        make_inquilino(email='a@test.com', documento='DOC001')
        with self.assertRaises(IntegrityError):
            make_inquilino(email='b@test.com', documento='DOC001')

    def test_no_puede_eliminarse_con_contrato(self):
        hab = Habitacion.objects.create(numero='101', piso=1, precio=500_000)
        inq = make_inquilino()
        Contrato.objects.create(
            habitacion=hab, inquilino=inq, fecha_inicio=datetime.date.today(),
            monto_mensual=500_000, deposito=500_000,
        )
        with self.assertRaises(ProtectedError):
            inq.delete()


class InquilinoAPITest(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.user = make_user()
        self.client.force_authenticate(user=self.user)

    def _data(self, email='juan@test.com', documento='12345', **kwargs):
        defaults = dict(
            nombre='Juan', apellido='Pérez', telefono='0981000000',
            email=email, documento=documento,
            fecha_ingreso=str(datetime.date.today()),
            contacto_emergencia='—',
        )
        defaults.update(kwargs)
        return defaults

    # --- Autenticación ---

    def test_list_requiere_autenticacion(self):
        anon = APIClient()
        self.assertEqual(anon.get('/api/v1/inquilinos/').status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_requiere_autenticacion(self):
        anon = APIClient()
        self.assertEqual(anon.post('/api/v1/inquilinos/', self._data(), format='json').status_code, status.HTTP_401_UNAUTHORIZED)

    # --- CRUD básico ---

    def test_create_inquilino(self):
        response = self.client.post('/api/v1/inquilinos/', self._data(), format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Inquilino.objects.count(), 1)

    def test_email_duplicado_retorna_400(self):
        make_inquilino(email='juan@test.com', documento='11111')
        response = self.client.post('/api/v1/inquilinos/', self._data(email='juan@test.com', documento='22222'), format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_documento_duplicado_retorna_400(self):
        make_inquilino(email='a@test.com', documento='12345')
        response = self.client.post('/api/v1/inquilinos/', self._data(email='b@test.com', documento='12345'), format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_list_inquilinos(self):
        make_inquilino(email='a@t.com', documento='001')
        make_inquilino(email='b@t.com', documento='002')
        response = self.client.get('/api/v1/inquilinos/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 2)

    def test_retrieve_inquilino(self):
        inq = make_inquilino()
        response = self.client.get(f'/api/v1/inquilinos/{inq.pk}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'juan@test.com')

    def test_update_telefono(self):
        inq = make_inquilino()
        response = self.client.patch(f'/api/v1/inquilinos/{inq.pk}/', {'telefono': '0999888777'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        inq.refresh_from_db()
        self.assertEqual(inq.telefono, '0999888777')

    def test_delete_sin_contratos(self):
        inq = make_inquilino()
        response = self.client.delete(f'/api/v1/inquilinos/{inq.pk}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Inquilino.objects.count(), 0)

    # --- Búsqueda ---

    def test_search_por_nombre(self):
        make_inquilino(nombre='Carlos', apellido='Gomez', email='carlos@t.com', documento='001')
        make_inquilino(nombre='María', apellido='López', email='maria@t.com', documento='002')
        response = self.client.get('/api/v1/inquilinos/?search=Carlos')
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['nombre'], 'Carlos')

    def test_search_por_apellido(self):
        make_inquilino(apellido='Gonzalez', email='g@t.com', documento='001')
        make_inquilino(apellido='Ramirez', email='r@t.com', documento='002')
        response = self.client.get('/api/v1/inquilinos/?search=Gonzalez')
        self.assertEqual(response.data['count'], 1)

    def test_search_por_documento(self):
        make_inquilino(email='x@t.com', documento='ABC123')
        make_inquilino(email='y@t.com', documento='DEF456')
        response = self.client.get('/api/v1/inquilinos/?search=ABC123')
        self.assertEqual(response.data['count'], 1)

    def test_search_por_email(self):
        make_inquilino(email='target@empresa.com', documento='001')
        make_inquilino(email='other@test.com', documento='002')
        response = self.client.get('/api/v1/inquilinos/?search=target@empresa.com')
        self.assertEqual(response.data['count'], 1)
