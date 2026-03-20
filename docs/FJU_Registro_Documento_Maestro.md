# FJU Registro — Documento Maestro

![FJU Argentina](http://fjuargentina.com/wp-content/uploads/2020/01/Logo-Fju-Argentina.png)

> **Fuerza Joven Universal Argentina** — *Formamos Jóvenes Visionarios*

---

## Índice

1. [Contexto y Problema](#1-contexto-y-problema)
2. [Solución Propuesta](#2-solución-propuesta)
3. [Roles y Permisos](#3-roles-y-permisos)
4. [Funcionalidades](#4-funcionalidades)
5. [Schema de Base de Datos](#5-schema-de-base-de-datos)
6. [Stack Tecnológico](#6-stack-tecnológico)
7. [Arquitectura del Sistema](#7-arquitectura-del-sistema)
8. [Diseño y Marca](#8-diseño-y-marca)
9. [Reglas de Negocio](#9-reglas-de-negocio)
10. [Prompt para Lovable](#10-prompt-para-lovable)
11. [Próximos Pasos](#11-próximos-pasos)
12. [Historial de Versiones](#12-historial-de-versiones)

---

## 1. Contexto y Problema

### Sobre la organización

**FJU Argentina** (Fuerza Joven Universal) es una organización sin fines de lucro cuyo objetivo es alcanzar a jóvenes que se encuentran en situaciones de vulnerabilidad social: adicciones, delincuencia, falta de perspectivas de vida. Opera desde una sede única y cuenta con múltiples proyectos orientados al desarrollo integral de los jóvenes.

**Proyectos activos:**

| Proyecto | Descripción |
|---|---|
| Deportes | Boxeo, kick boxing, sipalki-do, taekwondo, jiu jitsu, fútbol, vóley, handball |
| Cultura | Danza, canto y actuación |
| Medios | Fotografía, video, edición, redes sociales |
| Universitarios (FJUNI) | Cursos, talleres y charlas gratuitas |
| Help | Prevención del suicidio y contención emocional |
| Unifuerzas | Organización de eventos, RCP y primeros auxilios |
| Atalayas | Voluntariado y trabajo comunitario |
| Asistentes | Apoyo administrativo y registro |

**Datos operativos actuales:**
- ~116 jóvenes activos
- 12 coordinadores
- Asistentes a cargo del registro de datos
- Líderes a cargo de las actividades

### Problema

El registro de jóvenes y la toma de asistencia se realizan de forma **manual** (cuaderno, Telegram, anotaciones sueltas). Esto genera:

- Imposibilidad de saber cuántas veces asistió un joven y a qué actividades
- Falta de visibilidad sobre jóvenes nuevos que no volvieron después de la primera visita
- Datos dispersos, inconsistentes y sin respaldo
- Carga operativa elevada para coordinadores y asistentes
- Sin métricas de retención ni crecimiento

---

## 2. Solución Propuesta

**FJU Registro** es una aplicación web mobile-first que centraliza el registro de jóvenes y la toma de asistencia, dando visibilidad total a los coordinadores sobre la actividad de la organización.

### Objetivo principal

> Que cualquier coordinador pueda saber, en menos de 30 segundos, cuántas veces vino un joven, a qué actividades, y quiénes llegaron pero nunca volvieron.

---

## 3. Roles y Permisos

| Rol | Puede hacer |
|---|---|
| **Asistente** | Registrar nuevo joven, buscar jóvenes existentes |
| **Líder** | Tomar asistencia en su actividad, ver lista de asistentes del día |
| **Coordinador** | Todo lo anterior + dashboard completo + gestión de actividades |

### Reglas de acceso (Row Level Security en Supabase)

- `asistentes` → solo INSERT en `jovenes`
- `lideres` → INSERT en `asistencias`, SELECT en `jovenes` y `actividades`
- `coordinadores` → SELECT en todas las tablas + INSERT/UPDATE en `actividades`

---

## 4. Funcionalidades

### 4.1 Registro de nuevo joven *(rol: asistente)*

- Formulario con campos: nombre, apellido, edad, dirección, WhatsApp, redes sociales
- `fecha_registro` automática (fecha del sistema)
- Buscador por nombre/apellido para evitar duplicados antes de registrar
- Mensaje de confirmación al guardar exitosamente

### 4.2 Tomar asistencia *(rol: líder)*

- Selector de actividad (lista desplegada desde Supabase, solo actividades activas)
- Date picker (por defecto: hoy)
- Buscador de joven por nombre o apellido
- Al encontrar al joven: mostrar nombre completo + edad + botón "Marcar presente"
- Lista de asistentes ya marcados en esa sesión (actividad + fecha)
- Prevención de duplicados: mismo joven + actividad + fecha = error controlado

### 4.3 Dashboard *(rol: coordinador)*

**Tarjetas de métricas (top):**
- Total de jóvenes registrados
- Nuevos este mes
- Jóvenes que asistieron solo 1 vez (nunca volvieron)
- Total de asistencias este mes

**Tabla de jóvenes:**
- Columnas: nombre, apellido, edad, fecha de registro, total de asistencias
- Click en fila → perfil del joven con datos personales + historial de asistencias (actividad + fecha)

**Gestión de actividades:**
- Listado de actividades existentes
- Crear nueva actividad (nombre, tipo, descripción)
- Editar actividad existente
- Activar / desactivar actividad

---

## 5. Schema de Base de Datos

```sql
-- Perfiles de usuario (vinculados a auth.users de Supabase)
create table perfiles (
  id uuid references auth.users primary key,
  nombre text not null,
  rol text check (rol in ('asistente', 'lider', 'coordinador')) not null,
  created_at timestamp default now()
);

-- Jóvenes registrados
create table jovenes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  apellido text not null,
  edad integer,
  direccion text,
  whatsapp text,
  redes_sociales text,
  fecha_registro date default current_date,
  created_at timestamp default now()
);

-- Actividades de la organización
create table actividades (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  tipo text,
  descripcion text,
  activa boolean default true,
  created_at timestamp default now()
);

-- Registro de asistencias
create table asistencias (
  id uuid primary key default gen_random_uuid(),
  joven_id uuid references jovenes(id) on delete cascade,
  actividad_id uuid references actividades(id) on delete cascade,
  fecha date default current_date,
  registrado_por uuid references perfiles(id),
  created_at timestamp default now(),
  unique(joven_id, actividad_id, fecha)
);
```

---

## 6. Stack Tecnológico

| Capa | Herramienta | Rol |
|---|---|---|
| Planificación | **Claude** | Arquitectura, prompts, documentación |
| Prototipo UI | **Lovable** | Generación rápida de la interfaz |
| Desarrollo | **Antigravity** | Refinamiento y producción |
| Base de datos + Auth | **Supabase** | Datos, autenticación y RLS |
| Deploy | **Vercel** | Hosting de la app |

---

## 7. Arquitectura del Sistema

```
Usuario (celular)
      │
      ▼
  Vercel (Frontend React)
      │
      ├── Supabase Auth (login por rol)
      │
      └── Supabase DB
            ├── perfiles
            ├── jovenes
            ├── actividades
            └── asistencias
```

### Flujo de autenticación

1. Usuario ingresa con email + contraseña
2. Supabase Auth valida y devuelve sesión con `user.id`
3. App consulta `perfiles` con ese `user.id` para obtener el `rol`
4. App redirige a la pantalla correspondiente según el rol

---

## 8. Diseño y Marca

### Identidad visual FJU

| Elemento | Valor |
|---|---|
| Logo | `http://fjuargentina.com/wp-content/uploads/2020/01/Logo-Fju-Argentina.png` |
| Sitio web | https://fjuargentina.com |
| Eslogan | *Formamos Jóvenes Visionarios* |

### Sistema de colores de la app

| Token | Color | Uso |
|---|---|---|
| `primary` | `#1E3A5F` (azul profundo) | Navegación, botones principales, headers |
| `accent` | `#F5A623` (amarillo cálido) | CTAs secundarios, highlights, badges |
| `background` | `#FFFFFF` | Fondo general |
| `text-primary` | `#1A1A1A` | Texto principal |
| `text-muted` | `#6B7280` | Texto secundario, placeholders |
| `success` | `#10B981` | Confirmaciones, asistencia marcada |
| `error` | `#EF4444` | Errores, duplicados |

### Directrices de UI

- **Mobile-first**: diseño optimizado para celular (líderes operan desde el teléfono)
- **Touch targets mínimos**: 48px para todos los botones interactivos
- **Navegación inferior**: íconos para cada sección principal en mobile
- **Idioma**: español neutro (sin regionalismos)
- **Tipografía**: sans-serif limpia (Inter o similar)
- **Búsqueda rápida**: el buscador de jóvenes siempre visible y en primer plano en las vistas de asistencia

---

## 9. Reglas de Negocio

1. **No duplicados en asistencia**: un joven no puede tener más de una asistencia al mismo día en la misma actividad. El sistema debe rechazar el intento y mostrar un mensaje claro.
2. **Actividades dinámicas**: las actividades no son fijas; se crean, editan y desactivan desde el panel del coordinador.
3. **Fecha automática**: tanto `fecha_registro` en jóvenes como `fecha` en asistencias deben capturarse automáticamente, con opción de editarlas manualmente en asistencias si es necesario.
4. **Joven "nuevo que no volvió"**: definido como todo joven con exactamente 1 asistencia registrada en cualquier actividad. Este dato debe visualizarse en el dashboard como métrica de retención.
5. **El coordinador puede hacer todo**: tiene acceso total a datos, reportes y configuración.
6. **Las actividades desactivadas no aparecen** en el selector de asistencia del líder.

---

## 10. Prompt para Lovable

```
Build a web app called "FJU Registro" for a nonprofit youth organization.
The app is fully in Spanish (neutral, not regional).

The app has 3 roles: asistente, lider, coordinador.
Use Supabase for auth and database.

---

SCREENS:

1. LOGIN
- Email + password
- After login, redirect based on role

---

2. REGISTRO DE JOVEN (role: asistente)
- Form with: nombre, apellido, edad, dirección, WhatsApp, redes sociales
- fecha_registro is automatic (today)
- Success message after saving
- Search bar to find existing youth by name (to avoid duplicates)

---

3. TOMAR ASISTENCIA (role: lider)
- Select an "actividad" from a dropdown (fetched from Supabase, only active ones)
- Date picker (defaults to today)
- Search bar to find a joven by name or apellido
- When found, show their full name + age + a button "Marcar presente"
- Show a list of all marked attendees for that session below
- Prevent duplicate attendance (same joven + actividad + fecha)

---

4. DASHBOARD (role: coordinador)
Top metrics cards:
- Total jóvenes registrados
- Nuevos este mes
- Jóvenes que asistieron solo 1 vez (never returned)
- Total asistencias este mes

Below:
- Table of all jóvenes: nombre, apellido, edad, fecha de registro, total asistencias
- Clicking a row opens a profile with personal data + full attendance history (actividad + fecha)

Side section:
- Gestión de actividades: list with create, edit name/tipo/descripcion, toggle active/inactive

---

5. DESIGN
- Mobile-first
- Primary color: deep blue (#1E3A5F)
- Accent: warm yellow (#F5A623)
- White background
- Large touch targets (min 48px)
- Simple bottom navigation for mobile: icons for each section
- Clean, modern UI
- Spanish (neutral)
```

---

## 11. Próximos Pasos

| # | Tarea | Responsable | Estado |
|---|---|---|---|
| 1 | Crear proyecto en Supabase y correr el schema SQL | Brandon | Pendiente |
| 2 | Crear proyecto en Lovable y pegar el prompt | Brandon | Pendiente |
| 3 | Revisar el resultado de Lovable | Brandon + Claude | Pendiente |
| 4 | Conectar Supabase al proyecto Lovable | Brandon | Pendiente |
| 5 | Pruebas de flujo completo (registro + asistencia + dashboard) | Brandon | Pendiente |
| 6 | Pasar a Antigravity para ajustes de producción | Antigravity | Pendiente |
| 7 | Deploy en Vercel | Brandon | Pendiente |
| 8 | Capacitación a asistentes y líderes | Brandon | Pendiente |

---

## 12. Historial de Versiones

| Versión | Fecha | Cambios |
|---|---|---|
| v0.1 | 2026-03-20 | Documento inicial — definición de problema, solución, schema y prompt |

---

*Documento generado con Claude · FJU Argentina © 2026*
