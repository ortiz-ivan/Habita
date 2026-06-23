from datetime import date, timedelta
from typing import Any

from rest_framework import serializers
from .models import Pago
from apps.contratos.models import Contrato


def get_ciclo_pago(fecha_pago: date, dia_inicio: int) -> tuple[date, date]:
    """Devuelve (inicio, fin) del ciclo de pago que contiene fecha_pago."""
    dia = min(max(dia_inicio, 1), 28)
    y, m, d = fecha_pago.year, fecha_pago.month, fecha_pago.day

    if d >= dia:
        inicio = date(y, m, dia)
        next_y, next_m = (y + 1, 1) if m == 12 else (y, m + 1)
    else:
        prev_y, prev_m = (y - 1, 12) if m == 1 else (y, m - 1)
        inicio = date(prev_y, prev_m, dia)
        next_y, next_m = y, m

    fin = date(next_y, next_m, 1) - timedelta(days=1) if dia == 1 else date(next_y, next_m, dia - 1)
    return inicio, fin


class ContratoBriefSerializer(serializers.ModelSerializer):
    inquilino_nombre = serializers.CharField(source='inquilino.__str__', read_only=True)
    habitacion_numero = serializers.CharField(source='habitacion.numero', read_only=True)

    class Meta:
        model = Contrato
        fields = ['id', 'inquilino_nombre', 'habitacion_numero', 'estado', 'monto_mensual']


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

    def validate(self, data: dict[str, Any]) -> dict[str, Any]:
        contrato   = data.get('contrato',   getattr(self.instance, 'contrato',   None))
        tipo       = data.get('tipo',       getattr(self.instance, 'tipo',       Pago.Tipo.ALQUILER))
        fecha_pago = data.get('fecha_pago', getattr(self.instance, 'fecha_pago', None))

        if tipo == Pago.Tipo.ALQUILER and contrato and fecha_pago:
            inicio, fin = get_ciclo_pago(fecha_pago, contrato.fecha_inicio.day)
            qs = Pago.objects.filter(
                contrato=contrato,
                tipo=Pago.Tipo.ALQUILER,
                fecha_pago__gte=inicio,
                fecha_pago__lte=fin,
            )
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError({
                    'fecha_pago': (
                        f'Ya hay un pago de alquiler registrado para este ciclo '
                        f'({inicio.strftime("%d/%m/%Y")} – {fin.strftime("%d/%m/%Y")}).'
                    )
                })
        return data
