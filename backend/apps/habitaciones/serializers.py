from typing import Any

from rest_framework import serializers
from .models import Habitacion, TipoHabitacion


class TipoHabitacionSerializer(serializers.ModelSerializer):
    habitaciones_count = serializers.IntegerField(read_only=True)

    class Meta:
        model  = TipoHabitacion
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class HabitacionSerializer(serializers.ModelSerializer):
    contrato_activo = serializers.SerializerMethodField()
    tipo_nombre     = serializers.CharField(source='tipo.nombre', read_only=True)

    class Meta:
        model  = Habitacion
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']

    def get_contrato_activo(self, obj: Habitacion) -> dict[str, Any] | None:
        contratos = getattr(obj, 'contratos_activos', None)
        if contratos is None:
            contratos = list(
                obj.contratos.filter(estado__in=['activo', 'moroso'])
                             .select_related('inquilino')
            )
        if not contratos:
            return None
        contrato = contratos[0]
        pagos_pendientes = contrato.pagos.filter(estado__in=['pendiente', 'vencido']).count()
        return {
            'id':               contrato.id,
            'inquilino_nombre': f"{contrato.inquilino.apellido}, {contrato.inquilino.nombre}",
            'fecha_fin':        contrato.fecha_fin.isoformat() if contrato.fecha_fin else None,
            'estado':           contrato.estado,
            'pagos_pendientes': pagos_pendientes,
        }
