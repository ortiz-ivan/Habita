from django.db import IntegrityError
from django.db.models import Count, Prefetch, QuerySet
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status as drf_status
from rest_framework.decorators import action
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from apps.auditoria.mixins import AuditMixin
from apps.contratos.models import Contrato
from .models import Habitacion, TipoHabitacion
from .serializers import HabitacionSerializer, TipoHabitacionSerializer


class TipoHabitacionViewSet(AuditMixin, ModelViewSet):
    audit_recurso    = 'tipo_habitacion'
    queryset: QuerySet[TipoHabitacion] = TipoHabitacion.objects.annotate(habitaciones_count=Count('habitaciones'))
    serializer_class = TipoHabitacionSerializer
    ordering         = ['nombre']

    @action(detail=True, methods=['post'], url_path='apply_to_all')
    def apply_to_all(self, request: Request, pk: str | None = None) -> Response:
        tipo  = self.get_object()
        count = tipo.habitaciones.update(
            precio=tipo.precio,
            capacidad=tipo.capacidad,
            tiene_banio_privado=tipo.tiene_banio_privado,
            descripcion=tipo.descripcion,
        )
        return Response({'updated': count})


class HabitacionViewSet(AuditMixin, ModelViewSet):
    audit_recurso = 'habitacion'
    queryset: QuerySet[Habitacion] = Habitacion.objects.prefetch_related(
        Prefetch(
            'contratos',
            queryset=Contrato.objects.filter(
                estado__in=['activo', 'moroso']
            ).select_related('inquilino'),
            to_attr='contratos_activos',
        )
    )
    serializer_class = HabitacionSerializer
    filter_backends  = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['estado', 'piso', 'tiene_banio_privado']
    search_fields    = ['numero', 'descripcion']
    ordering_fields  = ['piso', 'numero', 'precio']
    ordering         = ['piso', 'numero']

    @action(detail=False, methods=['post'], url_path='bulk_create')
    def bulk_create(self, request: Request) -> Response:
        tipo_id    = request.data.get('tipo_id')
        rooms      = request.data.get('habitaciones', [])

        if not tipo_id:
            return Response({'error': 'tipo_id es requerido'}, status=drf_status.HTTP_400_BAD_REQUEST)
        if not rooms:
            return Response({'error': 'Se requiere al menos una habitación'}, status=drf_status.HTTP_400_BAD_REQUEST)

        try:
            tipo = TipoHabitacion.objects.get(pk=tipo_id)
        except TipoHabitacion.DoesNotExist:
            return Response({'error': 'Tipo no encontrado'}, status=drf_status.HTTP_404_NOT_FOUND)

        created = []
        errors  = []

        for room in rooms:
            try:
                Habitacion.objects.create(
                    tipo=tipo,
                    numero=str(room['numero']),
                    piso=int(room['piso']),
                    precio=tipo.precio,
                    capacidad=tipo.capacidad,
                    tiene_banio_privado=tipo.tiene_banio_privado,
                    descripcion=tipo.descripcion,
                )
                created.append(room['numero'])
            except IntegrityError:
                errors.append({'numero': room.get('numero'), 'error': 'Número ya existe'})
            except Exception as e:
                errors.append({'numero': room.get('numero'), 'error': str(e)})

        status = drf_status.HTTP_201_CREATED if created else drf_status.HTTP_400_BAD_REQUEST
        return Response({'created': len(created), 'errors': errors}, status=status)
