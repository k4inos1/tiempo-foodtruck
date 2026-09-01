---
name: cyber-ops
description: Directivas de operaciones ofensivas y uso de MCP para cyber_operator.
---

# Cyber Operations Skill

## Capacidades
Este skill define los protocolos para usar `hackbrowser` y `cheatengine` MCPs para testear la seguridad de Nightbite.

## Flujo de Trabajo (Pentesting Edge/Frontend)
1. Usa `hackbrowser` para navegar a la URL de prueba local.
2. Extrae el DOM y el código fuente con `get_dom_tree` y `get_page_source`.
3. Ejecuta `test_injection` y `test_csrf` contra los endpoints de órdenes (`/api/orders`).
4. Si detectas vulnerabilidades en la UI (ej. XSS reflejado), reporta inmediatamente para ser parchado.
5. Inyecta scripts maliciosos de prueba en los inputs para verificar la sanitización del backend (V8 Isolates).

## Reglas
- No destruir la base de datos de producción, solo interactuar con la base de datos de test (`nightbite-db`).
- Mantener perfil bajo en los logs a menos que haya un hit positivo.
