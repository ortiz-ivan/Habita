from rest_framework.viewsets import ModelViewSet
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from .models import Contrato
from .serializers import ContratoReadSerializer, ContratoWriteSerializer


class ContratoViewSet(ModelViewSet):
    queryset = Contrato.objects.select_related('habitacion', 'inquilino').all()
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['estado', 'habitacion', 'inquilino']
    search_fields = ['inquilino__nombre', 'inquilino__apellido', 'habitacion__numero']
    ordering_fields = ['fecha_inicio', 'fecha_fin', 'monto_mensual', 'created_at']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ContratoWriteSerializer
        return ContratoReadSerializer
