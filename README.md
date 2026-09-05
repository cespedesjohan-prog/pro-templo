# PRO TEMPLO

Sistema de gestión financiera y administrativa para congregaciones o templos, diseñado para controlar miembros, aportes, préstamos, tesorería, proyectos y reportes de forma centralizada.

## Descripción

PRO TEMPLO es una aplicación web construida con React + Vite y conectada a Supabase para gestionar la operación financiera de una iglesia o comunidad. Permite llevar el control de:

- Miembros y su información básica
- Aportes de la congregación
- Préstamos y pagos asociados
- Tesorería y flujo de caja
- Proyectos o metas de recaudación
- Reportes financieros y operativos
- Configuración general del sistema

La aplicación está pensada para facilitar la administración diaria y la toma de decisiones con información más ordenada y accesible.

## Stack tecnológico

- React 19
- Vite
- JavaScript
- Supabase
- Capacitor para Android
- Tailwind CSS
- Recharts para gráficos
- React Router DOM

## Funcionalidades principales

### Administración de miembros
- Registro de miembros
- Consulta y edición de información
- Control por iglesia o área

### Aportes
- Registro de aportes por persona o colectivo
- Seguimiento de montos y fechas
- Reportes asociados

### Préstamos
- Registro de préstamos
- Control de pagos
- Seguimiento del saldo pendiente

### Tesorería
- Gestión de movimientos financieros
- Visualización del estado de caja
- Registro y consulta de eventos financieros

### Proyectos
- Registro de proyectos o metas de recaudación
- Seguimiento de avance
- Indicadores visuales del progreso

### Reportes y dashboard
- Resumen ejecutivo de la operación
- Gráficos de aportes y metodologías de pago
- Indicadores clave de la iglesia o comunidad

## Requisitos previos

Antes de ejecutar el proyecto necesitas tener instalado:

- Node.js 18 o superior
- npm o pnpm
- Una cuenta de Supabase con un proyecto configurado
- Opcional: Android Studio para compilar la versión móvil con Capacitor

## Variables de entorno

Crea un archivo `.env` en la raíz del proyecto con estas variables:

```bash
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_KEY=tu_api_key_de_supabase
```

> Asegúrate de que estas variables correspondan a tu proyecto en Supabase.

## Instalación

```bash
npm install
```

## Ejecución en desarrollo

```bash
npm run dev
```

La aplicación quedará disponible en el puerto por defecto de Vite, normalmente:

```bash
http://localhost:5173
```

## Construcción para producción

```bash
npm run build
```

Este comando genera la versión optimizada para despliegue.

## Vista previa de producción

```bash
npm run preview
```

## Estructura del proyecto

```bash
src/
  components/
  context/
  hooks/
  layouts/
  lib/
  pages/
  services/
  styles/
  assets/
App.jsx
main.jsx
android/
public/
```

## Capacitor / Android

El proyecto incluye soporte para Android con Capacitor.

Para preparar el proyecto Android:

```bash
npx cap add android
```

Para sincronizar cambios:

```bash
npx cap sync android
```

Para abrir en Android Studio:

```bash
npx cap open android
```

## Buenas prácticas recomendadas

- Mantener las credenciales y claves en variables de entorno.
- Usar roles y permisos por tipo de usuario.
- Validar montos, fechas y estados antes de guardar transacciones.
- Revisar reportes periódicamente para asegurar consistencia financiera.
- Hacer respaldo regular de la base de datos y configuración del sistema.

## Estado actual

El proyecto cuenta con una base funcional para gestión religiosa y financiera, y la última compilación del proyecto fue verificada correctamente con:

```bash
npm run build
```

con resultado exitoso.

## Roadmap sugerido

1. Fortalecer permisos y seguridad por roles
2. Validar reglas financieras más estrictas
3. Mejorar reportes y exportación
4. Documentar flujos reales de trabajo para iglesia/tesorería
5. Preparar despliegue web y móvil en producción

## Licencia

Este proyecto se entrega como desarrollo interno del sistema y su uso debe ajustarse a la política y requisitos del entorno donde se implemente.

## Autor / mantenimiento

Proyecto en desarrollo orientado a administración financiera e iglesia.
