from rest_framework.viewsets import ModelViewSet
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from .models import Pago
from .serializers import PagoReadSerializer, PagoWriteSerializer


class PagoViewSet(ModelViewSet):
    queryset = Pago.objects.select_related(
        'contrato', 'contrato__habitacion', 'contrato__inquilino'
    ).all()
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['estado', 'metodo_pago', 'contrato']
    search_fields = ['contrato__inquilino__nombre', 'contrato__inquilino__apellido']
    ordering_fields = ['fecha_pago', 'monto', 'created_at']
    ordering = ['-fecha_pago']

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return PagoWriteSerializer
        return PagoReadSerializer
