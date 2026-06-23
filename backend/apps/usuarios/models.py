from django.contrib.auth.models import AbstractUser
from django.db import models


class Usuario(AbstractUser):
    class Rol(models.TextChoices):
        ADMINISTRADOR = 'administrador', 'Administrador'
        RECEPCIONISTA = 'recepcionista', 'Recepcionista'
        SUPERVISOR = 'supervisor', 'Supervisor'

    rol = models.CharField(max_length=20, choices=Rol.choices, default=Rol.RECEPCIONISTA)

    class Meta:
        verbose_name = 'usuario'
        verbose_name_plural = 'usuarios'

    def __str__(self) -> str:
        return f'{self.get_full_name()} ({self.rol})'
