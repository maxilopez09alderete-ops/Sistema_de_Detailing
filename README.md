# 🚗 Aplicación Web de Gestión de Turnos para Detailing Automotor

Esta es una plataforma web moderna, premium y responsiva diseñada para la reserva online de turnos de estética automotor (detailing) y administración integral de agendas, clientes, servicios, cobros y promociones.

La aplicación consta de una arquitectura desacoplada:
1. **Frontend**: Desarrollado con Next.js (App Router), Tailwind CSS y Lucide Icons, con estética deportiva oscura inspirada en marcas de lujo como Tesla, BMW y Porsche.
2. **Backend**: Desarrollado con Node.js, Express y Prisma ORM, configurado por defecto con SQLite para desarrollo local ágil, y fácilmente portable a PostgreSQL en producción.

---

## 📂 Estructura del Proyecto

```text
├── backend/                  # Servidor Express API
│   ├── prisma/
│   │   ├── schema.prisma     # Definición de Base de Datos relacional
│   │   └── seed.js           # Datos iniciales (servicios, admin, reservas mock)
│   ├── src/
│   │   ├── controllers/      # Lógica de negocio (turnos, clientes, pagos)
│   │   ├── middleware/       # Autenticación de administrador JWT
│   │   ├── routes/           # Rutas expuestas
│   │   └── server.js         # Inicio de Express
│   ├── package.json
│   └── .env.example
│
├── frontend/                 # Aplicación Web Next.js (React)
│   ├── src/
│   │   ├── app/              # Enrutador App Router y Vistas
│   │   │   ├── page.tsx      # Landing page pública de clientes
│   │   │   ├── layout.tsx    # Shell global del sistema con SEO
│   │   │   ├── reservar/     # Asistente de reservas (Booking Wizard)
│   │   │   └── admin/        # Dashboard de Administración (Agenda, Clientes, etc.)
│   │   └── lib/
│   │       └── api.ts        # Cliente de integración API y base mock (LocalStorage)
│   ├── package.json
│   └── tailwind.config.js
│
└── README.md                 # Instrucciones de configuración
```

---

## 🛠️ Requisitos Previos

Asegúrate de tener instalado en tu computadora:
- **Node.js** (Versión 18 o superior)
- **NPM** (Incluido automáticamente con Node.js)

---

## 🚀 Guía de Ejecución Local (Paso a Paso)

### 1. Configuración del Backend

Abre una terminal, navega a la carpeta `/backend` e instala las dependencias:

```bash
cd backend
npm install
```

#### Configurar variables de entorno:
Crea un archivo `.env` en la raíz de la carpeta `/backend` y añade:

```env
PORT=5000
JWT_SECRET=tu_clave_secreta_para_admin_detailing_2026
FRONTEND_URL=http://localhost:3000
DATABASE_URL="file:./dev.db"
```

#### Inicializar la Base de Datos (SQLite) con Prisma:
Ejecuta las migraciones automáticas para crear las tablas en la base de datos local SQLite:

```bash
npx prisma migrate dev --name init
```

#### Cargar datos de prueba (Seeding):
Puebla la base de datos con los servicios iniciales (*Lavado Básico*, *Lavado Premium*, *Detailing Completo*), configuraciones de horarios, cupones promocionales, opiniones de clientes y turnos mock de demostración para el calendario:

```bash
npm run db:seed
```

#### Iniciar el servidor de desarrollo:
```bash
npm run dev
```
El servidor backend estará escuchando solicitudes REST en: `http://localhost:5000`

---

### 2. Configuración del Frontend (Cliente Next.js)

Abre otra terminal diferente, navega a la carpeta `/frontend` e instala las dependencias:

```bash
cd frontend
npm install
```

#### Iniciar el servidor de Next.js:
```bash
npm run dev
```

La aplicación web se ejecutará en: `http://localhost:3000`

- **Landing Page Pública**: Abre en tu navegador `http://localhost:3000`
- **Asistente de Reservas**: Haz clic en "Reservar Turno" o ve a `http://localhost:3000/reservar`
- **Panel de Administración**: Abre `http://localhost:3000/admin` e ingresa con las siguientes credenciales por defecto:
  - **Usuario**: `admin`
  - **Contraseña**: `admin123`

*Nota: Si el backend está apagado, el frontend cuenta con un sistema de failover inteligente que almacena y actualiza los turnos y estadísticas directamente en el `localStorage` del navegador para que la experiencia visual e interactiva siga funcionando de inmediato.*

---

## 💾 Migración de SQLite a PostgreSQL en Producción

Prisma hace que cambiar de base de datos sea sumamente sencillo:

1. Modifica la sección `datasource db` dentro de `backend/prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. En tu archivo `.env` de producción del backend, cambia la variable `DATABASE_URL` con los accesos provistos por tu servidor PostgreSQL:
   ```env
   DATABASE_URL="postgresql://usuario:contraseña@host:puerto/nombre_db?schema=public"
   ```
3. Ejecuta la regeneración del cliente de Prisma y las migraciones:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

---

## ☁️ Despliegue en Producción

### Desplegar el Backend (Express API)
Puedes usar servicios como **Render**, **Railway**, **Heroku** o tu propio **VPS**:
1. Conecta tu repositorio de GitHub.
2. Define el comando de compilación: `npm install && npx prisma generate`
3. Define el comando de arranque: `npm start`
4. Carga las variables de entorno (`JWT_SECRET`, `DATABASE_URL`, `FRONTEND_URL`).

### Desplegar el Frontend (Next.js)
El frontend está optimizado para funcionar directamente en **Vercel** o **Netlify**:
1. Importa tu proyecto Next.js en Vercel.
2. Vercel detectará la configuración automáticamente.
3. Haz clic en "Deploy".
# Sistema_de_Detailing
