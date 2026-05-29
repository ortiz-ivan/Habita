# Este archivo está OBSOLETO.
# La configuración fue migrada al paquete config/settings/:
#
#   config/settings/base.py        ← configuración compartida
#   config/settings/local.py       ← desarrollo local (DEBUG=True)
#   config/settings/production.py  ← producción (HTTPS, seguridad)
#
# Python usará el paquete settings/ (directorio) sobre este archivo.
# Para invocar explícitamente un entorno:
#
#   DJANGO_SETTINGS_MODULE=config.settings.local    python manage.py runserver
#   DJANGO_SETTINGS_MODULE=config.settings.production gunicorn config.wsgi
