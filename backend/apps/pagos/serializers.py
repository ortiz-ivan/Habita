from rest_framework import serializers
from .models import Pago
from apps.contratos.models import Contrato


class ContratoBriefSerializer(serializers.ModelSerializer):
    inquilino_nombre = serializers.CharField(source='inquilino.__str__', read_only=True)
    habitacion_numero = serializers.CharField(source='habitacion.numero', read_only=True)

    class Meta:
        model = Contrato
        fields = ['id', 'inquilino_nombre', 'habitacion_numero', 'estado']


class PagoReadSerializer(serializers.ModelSerializer):
    contrato = ContratoBriefSerializer(read_only=True)

    class Meta:
        model = Pago
        fields = '__all__'


class PagoWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pago
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']
