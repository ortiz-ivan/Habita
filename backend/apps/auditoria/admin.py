from django.contrib import admin
from .models import AuditLog


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display   = ['timestamp', 'usuario', 'accion', 'recurso', 'recurso_id', 'descripcion', 'ip']
    list_filter    = ['accion', 'recurso']
    search_fields  = ['usuario__username', 'descripcion', 'ip']
    readonly_fields = ['usuario', 'accion', 'recurso', 'recurso_id', 'descripcion', 'ip', 'timestamp']
    ordering       = ['-timestamp']
    date_hierarchy = 'timestamp'

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
