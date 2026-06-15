from django.db import migrations, models
from datetime import date


def fill_null_fecha_fin(apps, schema_editor):
    Contrato = apps.get_model('contratos', 'Contrato')
    fallback = date(2099, 12, 31)
    Contrato.objects.filter(fecha_fin__isnull=True).update(fecha_fin=fallback)


class Migration(migrations.Migration):

    dependencies = [
        ('contratos', '0002_alter_contrato_deposito_alter_contrato_monto_mensual'),
    ]

    operations = [
        migrations.RunPython(fill_null_fecha_fin, migrations.RunPython.noop),
        migrations.AlterField(
            model_name='contrato',
            name='fecha_fin',
            field=models.DateField(),
        ),
    ]
