Documentación Técnica — Sistema Gestor de Habitaciones en Alquiler
Descripción General

El proyecto consiste en el desarrollo de un sistema web para la administración de habitaciones en alquiler dentro de un edificio.

El sistema permitirá:

Gestionar habitaciones
Administrar inquilinos
Controlar contratos
Registrar pagos
Visualizar estados y ocupación
Generar reportes administrativos

La aplicación estará orientada a facilitar la operación diaria del administrador del edificio mediante una interfaz moderna y procesos rápidos.

Objetivos del Proyecto
Objetivo Principal

Centralizar y automatizar la gestión de alquileres, pagos y ocupación de habitaciones en una plataforma web.

Objetivos Secundarios
Reducir control manual en planillas
Mejorar seguimiento de pagos
Mantener historial de ocupación
Visualizar estado operativo del edificio
Facilitar escalabilidad futura
Stack Tecnológico
Backend
Python
Django
Django REST Framework
Frontend
React
Vite
TailwindCSS
Base de Datos
PostgreSQL
Arquitectura General
Frontend (React + Tailwind)
        ↓
API REST (Django REST Framework)
        ↓
PostgreSQL
Arquitectura del Backend
Estructura recomendada
backend/
│
├── apps/
│   ├── habitaciones/
│   ├── inquilinos/
│   ├── contratos/
│   ├── pagos/
│   ├── usuarios/
│
├── config/
│
├── requirements/
│
└── manage.py
Arquitectura del Frontend
frontend/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── layouts/
│   ├── services/
│   ├── hooks/
│   ├── store/
│   ├── routes/
│   └── utils/
Módulos del Sistema
1. Gestión de Habitaciones
Descripción

Permite administrar todas las habitaciones disponibles dentro del edificio.

Entidad: Habitación
Habitacion
- id
- numero
- piso
- precio
- estado
- descripcion
- capacidad
- tiene_baño_privado
- created_at
- updated_at
Estados posibles
- Disponible
- Ocupada
- Reservada
- Mantenimiento
Funcionalidades
Crear habitación
Editar habitación
Eliminar habitación
Visualizar disponibilidad
Filtrar por estado
Buscar por número
2. Gestión de Inquilinos
Descripción

Administra la información de las personas que alquilan habitaciones.

Entidad: Inquilino
Inquilino
- id
- nombre
- apellido
- telefono
- email
- documento
- fecha_ingreso
- contacto_emergencia
- created_at
- updated_at
Funcionalidades
Registro de inquilinos
Edición de datos
Historial de contratos
Visualización de ocupación actual
3. Gestión de Contratos
Descripción

Representa el vínculo entre un inquilino y una habitación.

Entidad: Contrato
Contrato
- id
- habitacion_id
- inquilino_id
- fecha_inicio
- fecha_fin
- monto_mensual
- deposito
- estado
- observacion
- created_at
- updated_at
Estados del contrato
- Activo
- Finalizado
- Cancelado
- Moroso
Funcionalidades
Crear contrato
Finalizar contrato
Renovar contrato
Validar disponibilidad
Historial contractual
4. Gestión de Pagos
Descripción

Permite registrar y controlar pagos de alquiler.

Entidad: Pago
Pago
- id
- contrato_id
- monto
- fecha_pago
- metodo_pago
- estado
- observacion
- created_at
- updated_at
Estados del pago
- Pendiente
- Pagado
- Parcial
- Vencido
Métodos de pago
- Efectivo
- Transferencia
- Tarjeta
- QR
Funcionalidades
Registrar pagos
Historial financiero
Control de morosidad
Visualización de vencimientos
5. Sistema de Usuarios y Roles
Roles iniciales
- Administrador
- Recepcionista
- Supervisor
Funcionalidades
Login
JWT Authentication
Permisos por módulo
Restricción de acciones sensibles
Relaciones de Base de Datos
Edificio
   ↓
Habitaciones
   ↓
Contratos
   ↓
Inquilinos
   ↓
Pagos
Flujo Operativo Principal
Flujo de alquiler
1. Registrar habitación
2. Registrar inquilino
3. Crear contrato
4. Registrar pagos
5. Monitorear estado
6. Finalizar contrato
Dashboard Administrativo
Indicadores principales
Habitaciones disponibles
Habitaciones ocupadas
Pagos pendientes
Ingresos mensuales
Contratos activos
Índice de ocupación
API REST
Estructura recomendada
/api/habitaciones/
/api/inquilinos/
/api/contratos/
/api/pagos/
/api/auth/
Endpoints principales
Habitaciones
GET /api/habitaciones/
POST /api/habitaciones/
PUT /api/habitaciones/{id}/
DELETE /api/habitaciones/{id}/
Inquilinos
GET /api/inquilinos/
POST /api/inquilinos/
PUT /api/inquilinos/{id}/
DELETE /api/inquilinos/{id}/
Contratos
GET /api/contratos/
POST /api/contratos/
PUT /api/contratos/{id}/
DELETE /api/contratos/{id}/
Pagos
GET /api/pagos/
POST /api/pagos/
PUT /api/pagos/{id}/
DELETE /api/pagos/{id}/
Diseño UI/UX
Objetivos de interfaz
Navegación rápida
Información clara
Acciones simples
Visualización inmediata de estados
Colores sugeridos
Verde     → Disponible
Rojo      → Ocupada
Amarillo  → Mantenimiento
Azul      → Reservada
Funcionalidades Futuras
Fase 2
Reportes PDF
Dashboard avanzado
Notificaciones automáticas
Historial completo
Fase 3
Multi-edificio
WhatsApp API
Firma digital
Facturación electrónica
Estadísticas avanzadas
Recomendaciones Técnicas
Backend
Librerías recomendadas
djangorestframework
django-cors-headers
psycopg2
simplejwt
django-filter
Frontend
Librerías recomendadas
axios
react-router-dom
react-hook-form
zod
tanstack-query
zustand
Estrategia de Desarrollo
MVP Inicial
Prioridad 1
Autenticación
CRUD habitaciones
CRUD inquilinos
Prioridad 2
Contratos
Pagos
Estados automáticos
Prioridad 3
Dashboard
Reportes
Estadísticas
Buenas Prácticas
Backend
Arquitectura modular
Serializers separados
Services layer
Validaciones centralizadas
Soft delete
Frontend
Componentes reutilizables
Formularios desacoplados
Estado global mínimo
Hooks personalizados
Consideraciones de Escalabilidad

El sistema debe prepararse desde el inicio para:

múltiples edificios
mayor cantidad de habitaciones
crecimiento de usuarios
automatizaciones futuras
integración con APIs externas
Estado Inicial del Proyecto
Versión actual
v0.1 - Planificación y diseño inicial
Próximo Paso Recomendado
Orden recomendado de implementación
1. Configuración backend
2. Configuración frontend
3. Autenticación
4. CRUD habitaciones
5. CRUD inquilinos
6. CRUD contratos
7. CRUD pagos
8. Dashboard