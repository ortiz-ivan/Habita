from django.db import models
from django.db.models import Q

from apps.common.models import SoftDeleteModel


class Inquilino(SoftDeleteModel):
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    telefono = models.CharField(max_length=20)
    email = models.EmailField()
    documento = models.CharField(max_length=20)
    fecha_ingreso = models.DateField()
    contacto_emergencia = models.CharField(max_length=150)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'inquilino'
        verbose_name_plural = 'inquilinos'
        ordering = ['apellido', 'nombre']
        constraints = [
            models.UniqueConstraint(
                fields=['email'],
                condition=Q(deleted_at__isnull=True),
                name='unique_inquilino_email_active',
            ),
            models.UniqueConstraint(
                fields=['documento'],
                condition=Q(deleted_at__isnull=True),
                name='unique_inquilino_documento_active',
            ),
        ]

    def __str__(self) -> str:
        return f'{self.apellido}, {self.nombre}'
