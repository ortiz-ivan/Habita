import django_filters
from .models import Pago


class PagoFilter(django_filters.FilterSet):
    fecha_desde = django_filters.DateFilter(field_name='fecha_pago', lookup_expr='gte')
    fecha_hasta = django_filters.DateFilter(field_name='fecha_pago', lookup_expr='lte')

    class Meta:
        model = Pago
        fields = ['estado', 'metodo_pago', 'contrato', 'fecha_desde', 'fecha_hasta']
