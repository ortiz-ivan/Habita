from rest_framework import serializers
from .models import Contrato
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
    habitacion = HabitacionBriefSerializer(read_only=True)
    inquilino = InquilinoBriefSerializer(read_only=True)

    class Meta:
        model = Contrato
        fields = '__all__'


class ContratoWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contrato
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']
