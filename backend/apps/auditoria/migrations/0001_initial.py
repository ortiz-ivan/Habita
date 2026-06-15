import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='AuditLog',
            fields=[
                ('id',          models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('accion',      models.CharField(choices=[('crear', 'Crear'), ('editar', 'Editar'), ('eliminar', 'Eliminar'), ('login', 'Inicio de sesión')], max_length=10)),
                ('recurso',     models.CharField(max_length=50)),
                ('recurso_id',  models.PositiveIntegerField(blank=True, null=True)),
                ('descripcion', models.TextField(blank=True)),
                ('ip',          models.GenericIPAddressField(blank=True, null=True)),
                ('timestamp',   models.DateTimeField(auto_now_add=True)),
                ('usuario',     models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='audit_logs', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name':        'registro de auditoría',
                'verbose_name_plural': 'registros de auditoría',
                'ordering':            ['-timestamp'],
            },
        ),
    ]
