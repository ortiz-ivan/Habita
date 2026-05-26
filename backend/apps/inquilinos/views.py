from rest_framework.viewsets import ModelViewSet
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from .models import Inquilino
from .serializers import InquilinoSerializer


class InquilinoViewSet(ModelViewSet):
    queryset = Inquilino.objects.all()
    serializer_class = InquilinoSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['fecha_ingreso']
    search_fields = ['nombre', 'apellido', 'documento', 'email']
    ordering_fields = ['apellido', 'nombre', 'fecha_ingreso']
    ordering = ['apellido', 'nombre']
