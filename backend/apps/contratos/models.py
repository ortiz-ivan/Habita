from django.db import models
from django.db.models import Q
from apps.habitaciones.models import Habitacion
from apps.inquilinos.models import Inquilino


class Contrato(models.Model):
    class Estado(models.TextChoices):
        ACTIVO = 'activo', 'Activo'
        FINALIZADO = 'finalizado', 'Finalizado'
        CANCELADO = 'cancelado', 'Cancelado'
        MOROSO = 'moroso', 'Moroso'

    habitacion = models.ForeignKey(Habitacion, on_delete=models.PROTECT, related_name='contratos')
    inquilino = models.ForeignKey(Inquilino, on_delete=models.PROTECT, related_name='contratos')
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()
    monto_mensual = models.PositiveIntegerField()
    deposito = models.PositiveIntegerField()
    estado = models.CharField(max_length=12, choices=Estado.choices, default=Estado.ACTIVO)
    observacion = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'contrato'
        verbose_name_plural = 'contratos'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['estado']),
        ]
        constraints = [
            # Debe coincidir con services.ESTADOS_ACTIVOS — refuerza a nivel de DB
            # la regla que ContratoWriteSerializer.validate() ya valida en la app,
            # para evitar la condición de carrera entre el check y el create.
            models.UniqueConstraint(
                fields=['habitacion'],
                condition=Q(estado__in=['activo', 'moroso']),
                name='unique_contrato_habitacion_activo',
            ),
            models.UniqueConstraint(
                fields=['inquilino'],
                condition=Q(estado__in=['activo', 'moroso']),
                name='unique_contrato_inquilino_activo',
            ),
        ]

    def __str__(self) -> str:
        return f'Contrato #{self.pk} — {self.inquilino} / Hab. {self.habitacion.numero}'
