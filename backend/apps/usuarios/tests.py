from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from apps.usuarios.models import Usuario
from config.auth_views import REFRESH_COOKIE


def make_user(username='admin', password='securepass123', **kwargs):
    return Usuario.objects.create_user(username=username, password=password, **kwargs)


class AuthTokenTest(TestCase):

    def setUp(self):
        self.client = APIClient()
        make_user()

    def test_obtain_token_credenciales_validas(self):
        response = self.client.post(
            '/api/v1/auth/token/',
            {'username': 'admin', 'password': 'securepass123'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        # El refresh token no va en el body: se entrega en cookie HttpOnly.
        self.assertNotIn('refresh', response.data)
        self.assertIn(REFRESH_COOKIE, response.cookies)
        self.assertTrue(response.cookies[REFRESH_COOKIE]['httponly'])

    def test_obtain_token_password_incorrecto(self):
        response = self.client.post(
            '/api/v1/auth/token/',
            {'username': 'admin', 'password': 'wrongpass'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_obtain_token_usuario_inexistente(self):
        response = self.client.post(
            '/api/v1/auth/token/',
            {'username': 'ghost', 'password': 'any'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_refresh_token_valido_genera_nuevo_access(self):
        # El refresh token viaja en la cookie HttpOnly que el client
        # arrastra automáticamente entre requests, no en el body.
        self.client.post(
            '/api/v1/auth/token/',
            {'username': 'admin', 'password': 'securepass123'},
            format='json',
        )
        response = self.client.post('/api/v1/auth/token/refresh/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)

    def test_refresh_token_invalido_retorna_401(self):
        self.client.cookies[REFRESH_COOKIE] = 'not-a-valid-token'
        response = self.client.post('/api/v1/auth/token/refresh/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_refresh_sin_cookie_retorna_401(self):
        response = self.client.post('/api/v1/auth/token/refresh/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_todos_los_endpoints_requieren_autenticacion(self):
        anon = APIClient()
        endpoints = [
            '/api/v1/habitaciones/',
            '/api/v1/inquilinos/',
            '/api/v1/contratos/',
            '/api/v1/pagos/',
            '/api/v1/usuarios/',
        ]
        for url in endpoints:
            with self.subTest(url=url):
                self.assertEqual(
                    anon.get(url).status_code,
                    status.HTTP_401_UNAUTHORIZED,
                )


class UsuarioModelTest(TestCase):

    def test_rol_default_es_recepcionista(self):
        user = Usuario.objects.create_user(username='nuevo', password='pass1234')
        self.assertEqual(user.rol, Usuario.Rol.RECEPCIONISTA)

    def test_str_incluye_rol(self):
        user = Usuario.objects.create_user(
            username='admin', password='pass1234', rol=Usuario.Rol.ADMINISTRADOR,
        )
        self.assertIn('administrador', str(user).lower())

    def test_choices_de_rol(self):
        roles = [r.value for r in Usuario.Rol]
        self.assertIn('administrador', roles)
        self.assertIn('recepcionista', roles)
        self.assertIn('supervisor', roles)


class UsuarioAPITest(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.user = make_user(rol=Usuario.Rol.ADMINISTRADOR)
        self.client.force_authenticate(user=self.user)

    def test_me_retorna_usuario_autenticado(self):
        response = self.client.get('/api/v1/usuarios/me/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'admin')
        self.assertIn('rol', response.data)

    def test_me_requiere_autenticacion(self):
        anon = APIClient()
        response = anon.get('/api/v1/usuarios/me/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_crear_usuario_con_rol_supervisor(self):
        response = self.client.post('/api/v1/usuarios/', {
            'username': 'supervisor1',
            'password': 'pass1234!',
            'rol': Usuario.Rol.SUPERVISOR,
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(
            Usuario.objects.get(username='supervisor1').rol,
            Usuario.Rol.SUPERVISOR,
        )

    def test_crear_usuario_password_muy_corta_retorna_400(self):
        response = self.client.post('/api/v1/usuarios/', {
            'username': 'short',
            'password': '123',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_list_usuarios(self):
        make_user(username='otro', password='pass1234')
        response = self.client.get('/api/v1/usuarios/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(response.data['count'], 2)
