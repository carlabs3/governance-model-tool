# Governance Model Tool

Herramienta visual para crear y colaborar en modelos de gobernanza mediante un canvas por secciones, con acceso por código de proyecto y guardado en Supabase.

## Stack

- **React** + **Vite** + **TypeScript**
- **Supabase** (Postgres, RLS, funciones RPC)
- **shadcn/ui** + **Tailwind CSS**

## Requisitos

- Node.js 18+ y npm

## Instalación

```sh
npm install
```

## Variables de entorno

Crea un archivo `.env` en la raíz con las siguientes variables (usa `.env.example` como plantilla). Los valores los obtienes en tu proyecto de Supabase → Project Settings → API:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_SUPABASE_PROJECT_ID=
```

> `.env` está en `.gitignore` y no debe subirse al repositorio.

## Desarrollo local

```sh
npm run dev
```

La app queda disponible en `http://localhost:8080`.

## Build de producción

```sh
npm run build
```

Los archivos estáticos se generan en `dist/`. Para previsualizar el build:

```sh
npm run preview
```

## Tests

```sh
npm run test
```
