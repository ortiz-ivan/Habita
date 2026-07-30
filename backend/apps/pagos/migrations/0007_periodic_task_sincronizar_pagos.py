from django.db import migrations

NOMBRE_TAREA = 'Sincronizar estados de pago'


def crear_tarea_periodica(apps, schema_editor):
    IntervalSchedule = apps.get_model('django_celery_beat', 'IntervalSchedule')
    PeriodicTask = apps.get_model('django_celery_beat', 'PeriodicTask')

    schedule, _ = IntervalSchedule.objects.get_or_create(every=15, period='minutes')
    PeriodicTask.objects.get_or_create(
        name=NOMBRE_TAREA,
        defaults={
            'task': 'apps.pagos.tasks.sincronizar_pagos_task',
            'interval': schedule,
        },
    )


def eliminar_tarea_periodica(apps, schema_editor):
    PeriodicTask = apps.get_model('django_celery_beat', 'PeriodicTask')
    PeriodicTask.objects.filter(name=NOMBRE_TAREA).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('pagos', '0006_pago_pagos_pago_estado_0f9a87_idx_and_more'),
        ('django_celery_beat', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(crear_tarea_periodica, eliminar_tarea_periodica),
    ]
