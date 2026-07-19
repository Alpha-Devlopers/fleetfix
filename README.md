# FleetFix Backend — Predictive Diagnostic & Telematics Planner

Spring Boot 3 / Java 21 REST backend for the FleetFix college project.

## Scope of this repository

This repository contains **only** the Spring Boot backend. It does not include:
- The Angular frontend (built by another team member)
- AI modules such as LangChain4j, Nous Hermes, or OpenClaw (built by another team member)
- AWS integration (IoT Core, RDS, S3, deployment) (handled by another team member)

The Diagnostics module in this backend only receives, validates, stores, and
returns Diagnostic Trouble Codes (DTCs) supplied manually by the frontend —
no AI/ML inference happens here.

## Tech stack

- Java 21, Spring Boot 3.3
- Spring Web, Spring Data JPA, Spring Security (JWT via jjwt)
- MySQL 8
- Maven, Lombok
- springdoc-openapi (Swagger UI)

## Getting started

1. Create a MySQL database (or let `createDatabaseIfNotExist=true` handle it) and set credentials:
   ```
   export DB_USERNAME=root
   export DB_PASSWORD=yourpassword
   ```
2. Build and run:
   ```
   mvn clean spring-boot:run
   ```
3. API base URL: `http://localhost:8080`
4. Swagger UI: `http://localhost:8080/swagger-ui.html`

## Authentication

- `POST /api/auth/register` — register a user with role `ADMIN`, `DISPATCHER`, or `MECHANIC`
- `POST /api/auth/login` — returns a JWT (`Authorization: Bearer <token>` on subsequent calls)

## Module → endpoint map

| Module | Base path |
|---|---|
| Auth | `/api/auth` |
| Vehicles | `/api/vehicles` |
| Drivers | `/api/drivers` |
| Tracking | `/api/tracking` |
| Diagnostics | `/api/diagnostics` |
| Repair Orders | `/api/repair-orders` |
| Inventory | `/api/inventory` |
| Dashboard | `/api/dashboard` |
| Reports | `/api/reports` |

See `docs/sample-requests.http` for example requests/responses per endpoint.

## Notes for the team

- `ddl-auto: update` is used so Hibernate creates/updates tables automatically
  for the demo; switch to Flyway/Liquibase if you need real migrations later.
- CORS is currently open (`*`) to integrate freely with the Angular dev server;
  tighten `SecurityConfig.corsConfigurationSource()` before any real deployment.
- Role-based authorization is enforced with `@PreAuthorize` on write endpoints;
  adjust the allowed roles per endpoint as your team's requirements evolve.
