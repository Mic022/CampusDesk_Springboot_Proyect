# Pasos iniciales (los hace una sola persona, el día 1)

> Este proyecto ya une lo que generó Spring Initializr con la estructura del equipo. Cuando esté en GitHub, este archivo se puede borrar.

## Qué ya está hecho

- Proyecto Spring Boot 4.1.1 con **Gradle** y Java 21, en la carpeta `backend/`.
- Dependencias: Spring Web, Spring Data JPA, Spring Security, Validation, PostgreSQL Driver, Lombok, DevTools, SpringDoc OpenAPI 3.1.0 y JJWT 0.13.0 (en `backend/build.gradle`).
- Paquete base `com.technova.campusdesk` con la clase principal `CampusDeskApplication` y un paquete por responsabilidad. Cada paquete trae un `package-info.java` que dice quién es el dueño y qué clases van ahí.
- `application.yml` que lee los datos sensibles desde variables de entorno o desde `backend/.env`.
- Carpetas `frontend/`, `database/` y `docs/`, el README y la propuesta de contrato de la API (`docs/api-contract.md`).
- Se quitó el soporte de Docker Compose que traía el zip de Initializr: sin servicios configurados no deja arrancar la aplicación, y el equipo usa PostgreSQL instalado en cada computador.

## 1. Requisitos en cada computador

- JDK 21 (los cuatro con la misma versión)
- PostgreSQL
- Git
- Un editor con Live Server (VS Code) para el frontend

No hace falta instalar Gradle: el proyecto trae `gradlew`, que lo descarga solo la primera vez.

## 2. Probar que arranca

1. Crear la base en PostgreSQL: `CREATE DATABASE campusdesk;`
2. Copiar `backend/.env.example` como `backend/.env` y poner el usuario y la contraseña de tu PostgreSQL.
3. Desde la carpeta `backend/`:
   - Windows: `gradlew.bat bootRun`
   - Mac o Linux: `./gradlew bootRun`
4. La primera vez tarda porque descarga las librerías. Debe terminar con la aplicación escuchando en el puerto 8080.

Todavía todo pide contraseña: es normal hasta que Persona 1 haga `SecurityConfig` (paso 4 de su lista).

Si lo abres en IntelliJ, abre la carpeta `backend/` como proyecto, para que encuentre el `build.gradle` y el archivo `.env`.

## 3. Subir a GitHub

Crear un repositorio **privado** vacío en GitHub (sin README) y, desde la carpeta `campusdesk/`:

```bash
git init -b main
git add .
git status        # revisar que NO aparezca backend/.env
git commit -m "chore: initial project structure"
git remote add origin https://github.com/USUARIO/campusdesk.git
git push -u origin main
git checkout -b develop
git push -u origin develop
```

En GitHub: **Settings → Collaborators** y agregar a los otros tres.

## 4. Cada integrante

```bash
git clone https://github.com/USUARIO/campusdesk.git
cd campusdesk
git checkout develop
git checkout -b feature/p1-security      # p2-tickets · p3-frontend · p4-data
```

Cada quien crea su propio `backend/.env` a partir de `.env.example` y su base `campusdesk` local.
