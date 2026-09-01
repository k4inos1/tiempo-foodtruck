# 🥪 Tiempo Foodtruck — Plataforma Gastronómica Edge

> Sistema de comercio gastronómico de alta velocidad para **Tiempo Foodtruck** (Concepción, Chile).  
> Diseñado bajo arquitectura **Edge-First** sobre **Cloudflare Workers**, **Cloudflare D1 (SQLite)**, **React + Tailwind** y un **Admin Engine en Python**.

---

## 🚀 Arquitectura del Sistema

```
nightbite/
├── backend/                  # API Cloudflare Worker (V8 Isolate)
│   ├── src/index.js          # Router REST + Server-Sent Events (SSE) en vivo
│   ├── schema_v5_images.sql  # Migración D1 con catálogo oficial y fotos HD
│   ├── admin_server.py       # Servidor Web Admin nativo en Python (Port 8888)
│   ├── db_manager.py         # Motor de gestión segura y auditoría SQLite
│   └── wrangler.toml         # Configuración Cloudflare Edge
│
├── frontend/                 # Aplicación Web React + Tailwind CSS
│   ├── src/pages/ClientView.jsx  # Menú interactivo, agregados y checkout
│   ├── src/pages/AdminView.jsx   # Tablero Kanban en vivo y terminal POS
│   └── public/
│       └── Carta_Tiempo.pdf  # Carta oficial descargable A4
│
├── admin_server.py           # Dashboard administrativo en Python
├── db_manager.py             # CLI de modelos tipados y auditoría D1
└── .gitignore                # Reglas de protección estricta contra fuga de secretos
```

---

## 🛠️ Tecnologías y Stack

* **Backend:** Cloudflare Workers (JavaScript ES Modules, V8 Isolates).
* **Base de Datos:** Cloudflare D1 (Motor relacional SQLite distribuido).
* **Frontend:** React, Tailwind CSS, Framer Motion (Física de resortes orgánicos).
* **Admin Engine:** Python 3 (Sin dependencias externas, 100% nativo).
* **Seguridad:** Consultas parametrizadas anti-SQLi, cabeceras de sanitización y control de secretos.

---

## 📦 Despliegue en Producción (Cloudflare)

### 1. Desplegar la Base de Datos D1
```bash
cd backend
npx.cmd wrangler d1 create nightbite-db
# Actualizar el database_id en backend/wrangler.toml
npx.cmd wrangler d1 execute nightbite-db --remote --file=./schema_v5_images.sql
```

### 2. Desplegar el Backend Worker (API)
```bash
cd backend
npx.cmd wrangler deploy
```

### 3. Desplegar el Frontend (Cloudflare Pages)
```bash
cd frontend
npm run build
npx.cmd wrangler pages deploy dist --project-name=tiempoparadegustar
```

---

## 🐍 Gestión por Consola Python (DB Guardian)

```bash
# Ver menú oficial y precios
python db_manager.py --list-menu

# Auditoría de integridad criptográfica
python db_manager.py --audit

# Iniciar Dashboard Web Administrativo
python admin_server.py
# Disponible en http://127.0.0.1:8888
```

---

## 📍 Ubicación
**Tiempo Foodtruck** — Sector Concepción, Región del Biobío, Chile.  
*Para un antojo perfecto.*
