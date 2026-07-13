import django_filters
from .models import Pago


class PagoFilter(django_filters.FilterSet):
    # Filtra por fecha_vencimiento (el "período" al que corresponde el pago),
    # no por fecha_pago: para pagos aún no cobrados fecha_pago es solo un
    # placeholder (suele coincidir con fecha_vencimiento, a veces a futuro),
    # así que filtrar por fecha_pago excluía pendientes/por_vencer/vencidos
    # fuera del período por defecto aunque sí existieran. Ver monto_adeudado
    # en PagoViewSet.resumen(), que ya usa fecha_vencimiento por esta razón.
    fecha_desde = django_filters.DateFilter(field_name='fecha_vencimiento', lookup_expr='gte')
    fecha_hasta = django_filters.DateFilter(field_name='fecha_vencimiento', lookup_expr='lte')

    class Meta:
        model = Pago
        fields: list[str] = ['estado', 'tipo', 'metodo_pago', 'contrato', 'fecha_desde', 'fecha_hasta']
