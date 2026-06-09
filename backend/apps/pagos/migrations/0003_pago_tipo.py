from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('pagos', '0002_alter_pago_monto'),
    ]

    operations = [
        migrations.AddField(
            model_name='pago',
            name='tipo',
            field=models.CharField(
                choices=[('alquiler', 'Alquiler'), ('garantia', 'Garantía')],
                default='alquiler',
                max_length=10,
            ),
        ),
    ]
