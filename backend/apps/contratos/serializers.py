from typing import Any

from rest_framework import serializers
from .models import Contrato
from .services import ESTADOS_ACTIVOS
from apps.habitaciones.models import Habitacion
from apps.inquilinos.models import Inquilino


class HabitacionBriefSerializer(serializers.ModelSerializer):
    class Meta:
        model = Habitacion
        fields = ['id', 'numero', 'piso', 'precio']


class InquilinoBriefSerializer(serializers.ModelSerializer):
    class Meta:
        model = Inquilino
        fields = ['id', 'nombre', 'apellido', 'documento']


class ContratoReadSerializer(serializers.ModelSerializer):
    habitacion    = HabitacionBriefSerializer(read_only=True)
    inquilino     = InquilinoBriefSerializer(read_only=True)
    garantia_info = serializers.SerializerMethodField()

    class Meta:
        model = Contrato
        fields = '__all__'

    def get_garantia_info(self, obj: Contrato) -> dict[str, Any] | None:
        pagos = [p for p in obj.pagos.all() if p.tipo == 'garantia']
        total = len(pagos)
        if total == 0:
            return None
        pagadas = sum(1 for p in pagos if p.estado == 'pagado')
        return {'total': total, 'pagadas': pagadas, 'cancelada': pagadas == total}


class ContratoWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contrato
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']

    def validate(self, data: dict[str, Any]) -> dict[str, Any]:
        habitacion = data.get('habitacion', getattr(self.instance, 'habitacion', None))
        inquilino  = data.get('inquilino',  getattr(self.instance, 'inquilino',  None))
        estado     = data.get('estado',     getattr(self.instance, 'estado', 'activo'))

        if estado in ESTADOS_ACTIVOS:
            if habitacion:
                qs = Contrato.objects.filter(habitacion=habitacion, estado__in=ESTADOS_ACTIVOS)
                if self.instance:
                    qs = qs.exclude(pk=self.instance.pk)
                conflicto = qs.first()
                if conflicto:
                    raise serializers.ValidationError(
                        {'habitacion': f'Esta habitación ya tiene un contrato activo (ID #{conflicto.pk} con {conflicto.inquilino}). Finalizá ese contrato primero.'}
                    )

            if inquilino:
                qs = Contrato.objects.filter(inquilino=inquilino, estado__in=ESTADOS_ACTIVOS)
                if self.instance:
                    qs = qs.exclude(pk=self.instance.pk)
                conflicto = qs.first()
                if conflicto:
                    raise serializers.ValidationError(
                        {'inquilino': f'Este inquilino ya tiene un contrato activo (ID #{conflicto.pk}). Finalizá ese contrato primero.'}
                    )

        return data
