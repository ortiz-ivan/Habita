from .models import AuditLog


def get_ip(request):
    forwarded = request.META.get('HTTP_X_FORWARDED_FOR')
    return forwarded.split(',')[0].strip() if forwarded else request.META.get('REMOTE_ADDR')


class AuditMixin:
    """
    Mixin para ModelViewSet que registra crear/editar/eliminar automáticamente.
    Definir audit_recurso = 'nombre' en el ViewSet.
    Para ViewSets con perform_* personalizados, llamar self._log() manualmente.
    """
    audit_recurso = ''

    def _log(self, accion, recurso_id=None, descripcion=''):
        AuditLog.objects.create(
            usuario=self.request.user if self.request.user.is_authenticated else None,
            accion=accion,
            recurso=self.audit_recurso,
            recurso_id=recurso_id,
            descripcion=descripcion,
            ip=get_ip(self.request),
        )

    def perform_create(self, serializer):
        super().perform_create(serializer)
        self._log(AuditLog.Accion.CREAR, serializer.instance.pk, str(serializer.instance))

    def perform_update(self, serializer):
        super().perform_update(serializer)
        self._log(AuditLog.Accion.EDITAR, serializer.instance.pk, str(serializer.instance))

    def perform_destroy(self, instance):
        pk, desc = instance.pk, str(instance)
        super().perform_destroy(instance)
        self._log(AuditLog.Accion.ELIMINAR, pk, desc)
