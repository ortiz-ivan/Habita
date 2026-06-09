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

    def get_garantia_info(self, obj):
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

    def validate(self, data):
        habitacion = data.get('habitacion', getattr(self.instance, 'habitacion', None))
        estado = data.get('estado', getattr(self.instance, 'estado', 'activo'))

        if habitacion and estado in ESTADOS_ACTIVOS:
            qs = Contrato.objects.filter(
                habitacion=habitacion,
                estado__in=ESTADOS_ACTIVOS,
            )
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError(
                    {'habitacion': 'Esta habitación ya tiene un contrato activo.'}
                )

        return data
