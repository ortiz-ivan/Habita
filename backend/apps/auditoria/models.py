from django.conf import settings
from django.db import models


class AuditLog(models.Model):
    class Accion(models.TextChoices):
        CREAR    = 'crear',    'Crear'
        EDITAR   = 'editar',   'Editar'
        ELIMINAR = 'eliminar', 'Eliminar'
        LOGIN    = 'login',    'Inicio de sesión'
        LOGOUT   = 'logout',   'Cierre de sesión'

    usuario     = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='audit_logs',
    )
    accion      = models.CharField(max_length=10, choices=Accion.choices)
    recurso     = models.CharField(max_length=50)
    recurso_id  = models.PositiveIntegerField(null=True, blank=True)
    descripcion = models.TextField(blank=True)
    ip          = models.GenericIPAddressField(null=True, blank=True)
    timestamp   = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name        = 'registro de auditoría'
        verbose_name_plural = 'registros de auditoría'
        ordering            = ['-timestamp']

    def __str__(self) -> str:
        usuario = self.usuario or 'Anónimo'
        return f'[{self.timestamp:%Y-%m-%d %H:%M}] {usuario} — {self.accion} {self.recurso}'
