from typing import Any

from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from .models import Inquilino


class InquilinoSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        validators=[UniqueValidator(queryset=Inquilino.objects.all())]
    )
    documento = serializers.CharField(
        max_length=20,
        validators=[UniqueValidator(queryset=Inquilino.objects.all())],
    )
    contrato_activo = serializers.SerializerMethodField()

    class Meta:
        model = Inquilino
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'deleted_at']

    def get_contrato_activo(self, obj: Inquilino) -> dict[str, Any] | None:
        contratos = getattr(obj, 'contratos_activos', None)
        if contratos is None:
            contratos = list(
                obj.contratos.filter(estado__in=['activo', 'moroso'])
                             .select_related('habitacion')
                             .prefetch_related('pagos')
                             .order_by('-created_at')
            )
        if not contratos:
            return None
        contrato = contratos[0]
        pagos_garantia = [p for p in contrato.pagos.all() if p.tipo == 'garantia']
        total_g  = len(pagos_garantia)
        pagadas_g = sum(1 for p in pagos_garantia if p.estado == 'pagado')
        return {
            'id':            contrato.id,
            'habitacion':    contrato.habitacion.numero,
            'monto_mensual': contrato.monto_mensual,
            'fecha_inicio':  contrato.fecha_inicio,
            'fecha_fin':     contrato.fecha_fin,
            'estado':        contrato.estado,
            'garantia_info': {'total': total_g, 'pagadas': pagadas_g, 'cancelada': pagadas_g == total_g} if total_g else None,
        }
