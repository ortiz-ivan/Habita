from django.db import models
from apps.contratos.models import Contrato


class Pago(models.Model):
    class Estado(models.TextChoices):
        PENDIENTE = 'pendiente', 'Pendiente'
        PAGADO = 'pagado', 'Pagado'
        PARCIAL = 'parcial', 'Parcial'
        VENCIDO = 'vencido', 'Vencido'

    class MetodoPago(models.TextChoices):
        EFECTIVO = 'efectivo', 'Efectivo'
        TRANSFERENCIA = 'transferencia', 'Transferencia'
        TARJETA = 'tarjeta', 'Tarjeta'
        QR = 'qr', 'QR'

    class Tipo(models.TextChoices):
        ALQUILER = 'alquiler', 'Alquiler'
        GARANTIA = 'garantia', 'Garantía'

    contrato = models.ForeignKey(Contrato, on_delete=models.PROTECT, related_name='pagos')
    tipo     = models.CharField(max_length=10, choices=Tipo.choices, default=Tipo.ALQUILER)
    monto    = models.PositiveIntegerField()
    fecha_pago = models.DateField()
    metodo_pago = models.CharField(max_length=15, choices=MetodoPago.choices)
    estado = models.CharField(max_length=12, choices=Estado.choices, default=Estado.PENDIENTE)
    observacion = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'pago'
        verbose_name_plural = 'pagos'
        ordering = ['-fecha_pago']

    def __str__(self):
        return f'Pago #{self.pk} — {self.contrato} ({self.estado})'
