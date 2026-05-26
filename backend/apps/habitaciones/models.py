from django.db import models


class Habitacion(models.Model):
    class Estado(models.TextChoices):
        DISPONIBLE = 'disponible', 'Disponible'
        OCUPADA = 'ocupada', 'Ocupada'
        RESERVADA = 'reservada', 'Reservada'
        MANTENIMIENTO = 'mantenimiento', 'Mantenimiento'

    numero = models.CharField(max_length=10, unique=True)
    piso = models.PositiveIntegerField()
    precio = models.PositiveIntegerField()
    estado = models.CharField(max_length=15, choices=Estado.choices, default=Estado.DISPONIBLE)
    descripcion = models.TextField(blank=True)
    capacidad = models.PositiveIntegerField(default=1)
    tiene_banio_privado = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'habitación'
        verbose_name_plural = 'habitaciones'
        ordering = ['piso', 'numero']

    def __str__(self):
        return f'Hab. {self.numero} — Piso {self.piso}'
