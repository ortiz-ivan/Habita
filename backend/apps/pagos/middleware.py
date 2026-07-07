from typing import Any, Callable

from django.http import HttpRequest, HttpResponse

from .services import sincronizar_estados_vencimiento


class SincronizarEstadosPagoMiddleware:
    """Recalcula pendiente/por_vencer/vencido en cada request.

    No hay Celery ni cron en este proyecto, así que el recálculo se hace
    de forma perezosa aquí en vez de depender de un job programado.
    Son un par de UPDATE indexados por estado/fecha_pago — despreciable
    a la escala de este sistema.
    """

    def __init__(self, get_response: Callable[[HttpRequest], HttpResponse]) -> None:
        self.get_response = get_response

    def __call__(self, request: HttpRequest) -> Any:
        sincronizar_estados_vencimiento()
        return self.get_response(request)
