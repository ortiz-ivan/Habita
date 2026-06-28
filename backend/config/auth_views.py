from datetime import timedelta
from typing import Any, cast

from django.conf import settings
from django.http import HttpResponse
from drf_spectacular.utils import extend_schema, OpenApiResponse, inline_serializer
from rest_framework import serializers as drf_serializers
from rest_framework.request import Request
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken

from apps.auditoria.mixins import get_ip
from apps.auditoria.models import AuditLog
from config.throttling import LoginRateThrottle

REFRESH_COOKIE = 'habita_refresh'
COOKIE_PATH = '/api/v1/auth/'


def _cookie_max_age() -> int:
    lifetime = cast(timedelta, settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'])
    return int(lifetime.total_seconds())


def _set_refresh_cookie(response: HttpResponse, token_str: str) -> None:
    response.set_cookie(
        key=REFRESH_COOKIE,
        value=token_str,
        httponly=True,
        secure=not settings.DEBUG,
        samesite='Strict',
        path=COOKIE_PATH,
        max_age=_cookie_max_age(),
    )


def _delete_refresh_cookie(response: HttpResponse) -> None:
    response.delete_cookie(REFRESH_COOKIE, path=COOKIE_PATH)


_LoginRequest = inline_serializer('LoginRequest', fields={
    'username': drf_serializers.CharField(),
    'password': drf_serializers.CharField(),
})
_AccessTokenResponse = inline_serializer('AccessTokenResponse', fields={
    'access': drf_serializers.CharField(help_text='JWT de acceso (30 min). El refresh token se envía en cookie HttpOnly.'),
})


@extend_schema(tags=['Auth'])
class CookieTokenObtainPairView(TokenObtainPairView):
    throttle_classes = [LoginRateThrottle]

    @extend_schema(
        summary='Iniciar sesión',
        description='Autentica al usuario y devuelve un JWT de acceso en el body. El refresh token se almacena en cookie HttpOnly.',
        request=_LoginRequest,
        responses={
            200: _AccessTokenResponse,
            401: OpenApiResponse(description='Credenciales incorrectas'),
            429: OpenApiResponse(description='Demasiados intentos (5/min)'),
        },
    )
    def post(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            raise InvalidToken(e.args[0])

        tokens = serializer.validated_data
        response = Response({'access': tokens['access']})
        _set_refresh_cookie(response, tokens['refresh'])

        username = request.data.get('username', '')
        try:
            from django.contrib.auth import get_user_model
            usuario = get_user_model().objects.get(username=username)
        except Exception:
            usuario = None
        AuditLog.objects.create(
            usuario=usuario,
            accion=AuditLog.Accion.LOGIN,
            recurso='sesion',
            descripcion=f'Inicio de sesión: {username}',
            ip=get_ip(request),
        )

        return response


@extend_schema(tags=['Auth'])
class CookieTokenRefreshView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        summary='Renovar token de acceso',
        description='Lee el refresh token desde la cookie HttpOnly y emite un nuevo JWT de acceso.',
        request=None,
        responses={
            200: _AccessTokenResponse,
            401: OpenApiResponse(description='Cookie ausente o refresh token expirado'),
        },
    )
    def post(self, request: Request) -> Response:
        token_str = request.COOKIES.get(REFRESH_COOKIE)
        if not token_str:
            return Response({'detail': 'No autenticado.'}, status=401)

        try:
            refresh = RefreshToken(token_str)  # type: ignore[arg-type]  # simplejwt stub incorrecto: acepta str
        except TokenError:
            response = Response({'detail': 'Sesión expirada.'}, status=401)
            _delete_refresh_cookie(response)
            return response

        # Get access token before rotating
        access = str(refresh.access_token)

        # Blacklist old token and generate new refresh token
        try:
            refresh.blacklist()
        except AttributeError:
            pass

        refresh.set_jti()
        refresh.set_exp()
        refresh.set_iat()

        response = Response({'access': access})
        _set_refresh_cookie(response, str(refresh))
        return response


@extend_schema(tags=['Auth'])
class LogoutView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        summary='Cerrar sesión',
        description='Invalida el refresh token (blacklist) y elimina la cookie HttpOnly.',
        request=None,
        responses={200: inline_serializer('LogoutResponse', fields={
            'detail': drf_serializers.CharField(),
        })},
    )
    def post(self, request: Request) -> Response:
        token_str = request.COOKIES.get(REFRESH_COOKIE)
        if token_str:
            try:
                RefreshToken(token_str).blacklist()  # type: ignore[arg-type]  # simplejwt stub incorrecto: acepta str
            except (TokenError, AttributeError):
                pass

        if request.user and request.user.is_authenticated:
            AuditLog.objects.create(
                usuario=request.user,
                accion=AuditLog.Accion.LOGOUT,
                recurso='sesion',
                descripcion=f'Cierre de sesión: {request.user.username}',
                ip=get_ip(request),
            )

        response = Response({'detail': 'Sesión cerrada.'})
        _delete_refresh_cookie(response)
        return response
