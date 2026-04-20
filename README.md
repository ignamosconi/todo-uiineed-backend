# Backend - Todo List API (NestJS)

## Descripción del proyecto

Este proyecto es el backend de una aplicación de listas tipo **“to-do”**.

Su objetivo es permitir que los usuarios creen listas de tareas que puedan ser compartidas mediante un **link único**.  
Cualquier persona con ese link puede acceder a la lista desde cualquier dispositivo, sin necesidad de loguearse.

El frontend que consume esta API es el siguiente:  
<br/>
→ https://github.com/ignamosconi/todo-uiineed-frontend/

---

## Tecnologías utilizadas

- NestJS
- TypeScript
- Node.js
- PostgreSQL
- TypeORM

---

## Instalación del proyecto

Clonar el repositorio:
```bash
git clone https://github.com/ignamosconi/todo-uiineed-backend.git
```

Instalar dependencias:
```bash
npm install
```

---

## Variables de entorno
Copiar el archivo .env.example de este repositorio y llenarlo con los datos correspondientes.

---

## Ejecutar el proyecto
```bash
npm run start:dev
```

El servidor se levantará en:
```bash
http://localhost:3000
