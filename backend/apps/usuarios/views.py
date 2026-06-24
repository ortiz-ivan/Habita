from typing import Any

from django.db.models import QuerySet
from rest_framework.decorators import action
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.serializers import BaseSerializer
from rest_framework.viewsets import ModelViewSet

from apps.auditoria.mixins import AuditMixin
from .models import Usuario
from .serializers import UsuarioSerializer, UsuarioCreateSerializer


class UsuarioViewSet(AuditMixin, ModelViewSet):
    audit_recurso = 'usuario'
    queryset: QuerySet[Usuario] = Usuario.objects.all()
    http_method_names = ['get', 'post', 'patch', 'delete']

    def get_serializer_class(self) -> type[BaseSerializer[Any]]:
        if self.action == 'create':
            return UsuarioCreateSerializer
        return UsuarioSerializer

    @action(detail=False, methods=['get'], url_path='me')
    def me(self, request: Request) -> Response:
        serializer = UsuarioSerializer(request.user)
        return Response(serializer.data)
