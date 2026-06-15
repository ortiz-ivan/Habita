import datetime
from django.db.models import Sum
from django.utils import timezone
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from .models import Pago
from .serializers import PagoReadSerializer, PagoWriteSerializer
from .filters import PagoFilter


class PagoViewSet(ModelViewSet):
    queryset = Pago.objects.select_related(
        'contrato', 'contrato__habitacion', 'contrato__inquilino'
    ).all()
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = PagoFilter
    search_fields = ['contrato__inquilino__nombre', 'contrato__inquilino__apellido']
    ordering_fields = ['fecha_pago', 'monto', 'created_at']
    ordering = ['-fecha_pago']

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return PagoWriteSerializer
        return PagoReadSerializer

    @action(detail=False, methods=['get'])
    def resumen(self, request):
        hoy = timezone.now().date()
        inicio_mes = hoy.replace(day=1)
        fin_mes_anterior = inicio_mes - datetime.timedelta(days=1)
        inicio_mes_anterior = fin_mes_anterior.replace(day=1)

        ingresos_mes = Pago.objects.filter(
            estado='pagado',
            fecha_pago__gte=inicio_mes,
            fecha_pago__lte=hoy,
        ).aggregate(t=Sum('monto'))['t'] or 0

        ingresos_mes_anterior = Pago.objects.filter(
            estado='pagado',
            fecha_pago__gte=inicio_mes_anterior,
            fecha_pago__lte=fin_mes_anterior,
        ).aggregate(t=Sum('monto'))['t'] or 0

        qs_adeudado = Pago.objects.filter(estado__in=['pendiente', 'vencido'])
        fecha_desde = request.query_params.get('fecha_desde')
        fecha_hasta = request.query_params.get('fecha_hasta')
        if fecha_desde:
            qs_adeudado = qs_adeudado.filter(fecha_pago__gte=fecha_desde)
        if fecha_hasta:
            qs_adeudado = qs_adeudado.filter(fecha_pago__lte=fecha_hasta)
        monto_adeudado = qs_adeudado.aggregate(t=Sum('monto'))['t'] or 0

        return Response({
            'ingresos_mes':          ingresos_mes,
            'ingresos_mes_anterior': ingresos_mes_anterior,
            'monto_adeudado':        monto_adeudado,
        })
