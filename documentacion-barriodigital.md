# BarrioDigital — Documentación Técnica del Sistema

**Versión:** 1.0  
**Fecha:** Octubre 2026  
**Asignatura:** DSY1107 — Desarrollo Cloud Native I  
**Autores:** Camilo Queupil + Compañero

---

## 1. Descripción General

BarrioDigital es una plataforma de gestión de solicitudes vecinales construida con arquitectura de microservicios. Permite a los vecinos de un barrio crear trámites y a los funcionarios gestionarlos, con autenticación centralizada mediante Azure AD y despliegue en AWS.

---

## 2. Arquitectura

```
┌──────────────┐     ┌───────────────────┐     ┌──────────────┐     ┌──────────────┐
│   Angular    │────▶│   API Gateway     │────▶│     BFF      │────▶│ ms-requests  │
│   (MSAL)     │     │   (AWS)           │     │  (port 8080) │     │ (port 8081)  │
└──────────────┘     └───────────────────┘     └──────────────┘     └──────────────┘
       │                                              │                     │
       ▼                                              ▼                     ▼
┌──────────────┐                              ┌──────────────┐     ┌──────────────┐
│   Azure AD   │                              │  Validación  │     │    MySQL     │
│  (OAuth2)    │                              │  JWT + RBAC  │     │   (JPA)      │
└──────────────┘                              └──────────────┘     └──────────────┘
```

**Flujo de una petición:**
1. El usuario se autentica en Angular vía MSAL contra Azure AD
2. Angular obtiene un JWT (access token) y lo adjunta en el header `Authorization: Bearer <token>`
3. La petición pasa por AWS API Gateway hacia el BFF
4. El BFF valida el JWT (issuer, audience, roles) y aplica RBAC con `@PreAuthorize`
5. El BFF reenvía la petición vía RestClient al ms-requests
6. ms-requests valida el JWT nuevamente (defense in depth) y ejecuta la lógica de negocio
7. La respuesta vuelve por el mismo camino

---

## 3. Componentes

### 3.1 Frontend — `barrioDigital-front-angular`

| Aspecto | Detalle |
|---------|---------|
| Framework | Angular con MSAL (@azure/msal-angular) |
| Autenticación | Authorization Code Flow + PKCE |
| Tipo app Azure AD | SPA (Single Page Application) |
| Servidor | nginx en EC2 |

### 3.2 BFF — `ms-barriodigital-bff`

| Aspecto | Detalle |
|---------|---------|
| Framework | Spring Boot 4.1.1 |
| Puerto | 8080 |
| Seguridad | Spring Security + OAuth2 Resource Server |
| Rol | Proxy autenticado entre frontend y ms-requests |
| Cliente HTTP | RestClient (Spring 6+) |

**Dependencias principales:**
- `spring-boot-starter-security`
- `spring-boot-starter-security-oauth2-resource-server`
- `spring-boot-starter-webmvc`
- `spring-boot-starter-actuator`

**Endpoints expuestos:**

| Método | Ruta | Roles permitidos | Descripción |
|--------|------|-------------------|-------------|
| POST | `/api/bff/requests` | Vecino, Funcionario | Crear solicitud |
| GET | `/api/bff/requests` | Funcionario, Admin | Listar solicitudes |
| GET | `/api/bff/requests/{id}` | Vecino, Funcionario, Admin, Auditor | Obtener solicitud por ID |
| PUT | `/api/bff/requests/{id}/status` | Funcionario, Admin | Cambiar estado |

**Configuración clave (`application.properties`):**
```properties
server.port=8080
spring.security.oauth2.resourceserver.jwt.issuer-uri=https://login.microsoftonline.com/${azure.tenant-id}/v2.0
services.requests.base-url=${REQUESTS_SERVICE_URL:http://127.0.0.1:8081}
app.cors.allowed-origins=${CORS_ALLOWED_ORIGINS:http://localhost:4200}
```

### 3.3 Microservicio de Solicitudes — `ms-barriodigital-requests`

| Aspecto | Detalle |
|---------|---------|
| Framework | Spring Boot 4.1.1 |
| Puerto | 8081 |
| Base de datos | MySQL (barriodigital_requests) |
| ORM | Spring Data JPA + Hibernate |
| Seguridad | Spring Security + OAuth2 Resource Server |

**Dependencias principales:**
- `spring-boot-starter-data-jpa`
- `spring-boot-starter-web`
- `spring-boot-starter-security`
- `spring-boot-starter-oauth2-resource-server`
- `spring-boot-starter-validation`
- `mysql-connector-j`
- `lombok`

**Endpoints expuestos:**

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/requests` | Crear solicitud (estado inicial: INGRESADO) |
| GET | `/api/requests` | Listar todas (filtro opcional por `?status=`) |
| GET | `/api/requests/{id}` | Obtener por ID |
| PUT | `/api/requests/{id}/status` | Actualizar estado |

**Configuración clave (`application.properties`):**
```properties
server.port=8081
spring.datasource.url=jdbc:mysql://${DB_HOST:localhost}:3306/${DB_NAME:barriodigital}
spring.jpa.hibernate.ddl-auto=update
```

---

## 4. Modelo de Datos

### Tabla `solicitudes`

| Campo | Tipo | Restricción | Descripción |
|-------|------|-------------|-------------|
| id | BIGINT | PK, auto-increment | Identificador único |
| tipo_tramite | VARCHAR(100) | NOT NULL | Tipo de trámite solicitado |
| vecino_email | VARCHAR(100) | NOT NULL | Email del vecino solicitante |
| estado | VARCHAR(20) | NOT NULL | Estado actual (enum) |
| fecha_creacion | DATETIME | auto, no update | Fecha de creación |
| fecha_actualizacion | DATETIME | auto | Última actualización |

### Estados de Solicitud (`EstadoSolicitud`)

```
INGRESADO → ADMITIDO → EN_GESTION → EN_TERRENO → RESUELTO
                                                 → RECHAZADO
```

**Regla de negocio:** No se puede pasar a `EN_TERRENO` sin estar previamente en `ADMITIDO`.

### DTOs

- **`SolicitudDTO`**: id, tipoTramite, vecinoEmail, estado, fechaCreacion, fechaActualizacion
- **`EstadoUpdateDTO`**: status (EstadoSolicitud, obligatorio)

---

## 5. Seguridad

### 5.1 Azure AD (Identity Provider)

| Parámetro | Valor |
|-----------|-------|
| Tenant ID | `92b9ffd8-4da1-4956-b85b-62654b654d25` |
| Client ID | `8b0cc19f-2671-49c7-beff-816087690691` |
| Scope | `api://8b0cc19f-2671-49c7-beff-816087690691/access_as_user` |
| Tipo plataforma | SPA |
| Flujo | Authorization Code + PKCE |

### 5.2 Roles RBAC

| Rol | Permisos |
|-----|----------|
| Vecino | Crear solicitud, ver solicitud propia |
| Funcionario | Crear solicitud, ver/listar solicitudes, cambiar estado |
| Admin | Ver/listar solicitudes, cambiar estado |
| Auditor | Ver solicitudes (solo lectura) |

### 5.3 Validación JWT — Defense in Depth (3 capas)

1. **API Gateway (AWS)**: Valida que el token exista y no esté expirado
2. **BFF**: Valida issuer, audience y roles (`@PreAuthorize`)
3. **ms-requests**: Valida issuer y audience nuevamente (segunda barrera)

Campos validados del JWT: `iss` (emisor), `aud` (audiencia), `exp` (expiración), `roles` (RBAC).

---

## 6. Infraestructura

### 6.1 AWS

| Recurso | Detalle |
|---------|---------|
| EC2 #1 (Camilo) | Elastic IP: `100.61.159.226` — Frontend (nginx) + BFF |
| EC2 #2 (Compañero) | Elastic IP: `32.196.155.175` — ms-requests + MySQL |
| API Gateway | `https://o3p4thx9x8.execute-api.us-east-1.amazonaws.com` |
| Nota | Cuentas AWS Academy separadas → solo IPs públicas (VPCs aislados) |

### 6.2 Servicios systemd

| Servicio | EC2 | Comando útil |
|----------|-----|--------------|
| `barriodigital-bff.service` | 100.61.159.226 | `sudo systemctl restart barriodigital-bff` |
| `barriodigital-requests.service` | 32.196.155.175 | `sudo systemctl restart barriodigital-requests` |

### 6.3 Base de Datos

| Parámetro | Valor |
|-----------|-------|
| Host | `32.196.155.175` (EC2 del compañero) |
| Puerto | 3306 |
| Base de datos | `barriodigital_requests` |
| Usuario | `barriodigital` |
| Contraseña | `<pedir al equipo, no se versiona>` |

### 6.4 Despliegue (proceso SSH)

```bash
# 1. Compilar localmente
./mvnw clean package -DskipTests

# 2. Subir JAR por SCP
scp -i clave.pem target/ms-barriodigital-bff-0.0.1-SNAPSHOT.jar ec2-user@100.61.159.226:~/

# 3. Conectar por SSH y reiniciar servicio
ssh -i clave.pem ec2-user@100.61.159.226
sudo systemctl restart barriodigital-bff
sudo journalctl -u barriodigital-bff -f  # ver logs
```

---

## 7. Stack Tecnológico

| Capa | Tecnología | Versión |
|------|------------|---------|
| Frontend | Angular + MSAL | — |
| BFF | Spring Boot | 4.1.1 |
| Microservicio | Spring Boot | 4.1.1 |
| Seguridad | Spring Security + OAuth2 Resource Server | 7.1.1 |
| Base de datos | MySQL | — |
| ORM | Hibernate (JPA) | — |
| Identity Provider | Azure AD (Entra ID) | — |
| Cloud | AWS (EC2, API Gateway) | — |
| Proxy reverso | nginx | — |
| Java | JDK 17 | — |
| Build | Maven | — |

---

## 8. Variables de Entorno

### BFF (`100.61.159.226`)

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `AZURE_TENANT_ID` | Tenant de Azure AD | `92b9ffd8-...` |
| `AZURE_API_CLIENT_ID` | Client ID de la app | `8b0cc19f-...` |
| `REQUESTS_SERVICE_URL` | URL del ms-requests | `http://32.196.155.175:8081` |
| `CORS_ALLOWED_ORIGINS` | Origen permitido CORS | `http://100.61.159.226` |

### ms-requests (`32.196.155.175`)

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `AZURE_TENANT_ID` | Tenant de Azure AD | `92b9ffd8-...` |
| `AZURE_API_CLIENT_ID` | Client ID de la app | `8b0cc19f-...` |
| `DB_HOST` | Host de MySQL | `localhost` |
| `DB_NAME` | Nombre de la BD | `barriodigital_requests` |
| `DB_USERNAME` | Usuario BD | `barriodigital` |
| `DB_PASSWORD` | Contraseña BD | `********` |
