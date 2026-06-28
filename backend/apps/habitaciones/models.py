from django.db import models
from django.db.models import Q

from apps.common.models import SoftDeleteModel


class TipoHabitacion(SoftDeleteModel):
    nombre              = models.CharField(max_length=100)
    precio              = models.PositiveIntegerField()
    capacidad           = models.PositiveIntegerField(default=1)
    tiene_banio_privado = models.BooleanField(default=False)
    descripcion         = models.TextField(blank=True)
    created_at          = models.DateTimeField(auto_now_add=True)
    updated_at          = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name        = 'tipo de habitación'
        verbose_name_plural = 'tipos de habitación'
        ordering            = ['nombre']
        constraints = [
            models.UniqueConstraint(
                fields=['nombre'],
                condition=Q(deleted_at__isnull=True),
                name='unique_tipohabitacion_nombre_active',
            ),
        ]

    def __str__(self) -> str:
        return self.nombre


class Habitacion(SoftDeleteModel):
    class Estado(models.TextChoices):
        DISPONIBLE    = 'disponible',    'Disponible'
        OCUPADA       = 'ocupada',       'Ocupada'
        RESERVADA     = 'reservada',     'Reservada'
        MANTENIMIENTO = 'mantenimiento', 'Mantenimiento'

    tipo                = models.ForeignKey(
        TipoHabitacion,
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='habitaciones',
    )
    numero              = models.CharField(max_length=10)
    piso                = models.PositiveIntegerField()
    precio              = models.PositiveIntegerField()
    estado              = models.CharField(max_length=15, choices=Estado.choices, default=Estado.DISPONIBLE)
    descripcion         = models.TextField(blank=True)
    capacidad           = models.PositiveIntegerField(default=1)
    tiene_banio_privado = models.BooleanField(default=False)
    created_at          = models.DateTimeField(auto_now_add=True)
    updated_at          = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name        = 'habitación'
        verbose_name_plural = 'habitaciones'
        ordering            = ['piso', 'numero']
        constraints = [
            models.UniqueConstraint(
                fields=['numero'],
                condition=Q(deleted_at__isnull=True),
                name='unique_habitacion_numero_active',
            ),
        ]

    def __str__(self) -> str:
        return f'Hab. {self.numero} — Piso {self.piso}'
