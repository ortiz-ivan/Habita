from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Usuario
from .serializers import UsuarioSerializer, UsuarioCreateSerializer


class UsuarioViewSet(ModelViewSet):
    queryset = Usuario.objects.all()
    http_method_names = ['get', 'post', 'patch', 'delete']

    def get_serializer_class(self):
        if self.action == 'create':
            return UsuarioCreateSerializer
        return UsuarioSerializer

    @action(detail=False, methods=['get'], url_path='me')
    def me(self, request):
        serializer = UsuarioSerializer(request.user)
        return Response(serializer.data)
