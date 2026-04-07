# ITS Chía-Girardot · Gemelo Digital v1.0.0

## Descripción
Esta plataforma es el Centro de Mando (Cockpit) del Gemelo Digital para la concesión Chía-Girardot. Utiliza una arquitectura de visualización de alta fidelidad para representar la telemetría ITS en tiempo real.

## Características Principales
- **Gemelo Digital 3D/Holográfico**: Modelado isométrico y estructural de infraestructuras críticas (puentes, túneles, peajes).
- **Pipeline de 4 Etapas**: Visualización del flujo de datos desde Campo ➜ CCO ➜ BIM ➜ Gemelo.
- **Auditoría EOV**: Sistema de validación de escenarios operativos de validación (EOV).
- **Hardened Security**: Mitigación sistemática de riesgos XSS mediante sanitización de DOM.

## Requisitos
- Navegador moderno (Chrome, Edge, Safari, Firefox).
- Conectividad a Internet para carga de tipografías y Three.js (vía CDN).

## Estructura del Proyecto
- `index.html`: Punto de entrada principal.
- `app.js`: Lógica de negocio y renderizado del Cockpit.
- `styles.css`: Sistema de diseño "Emerald Cyber" (V47.0).
- `three-engine.js`: Motor de simulación 3D basado en Three.js.
- `dom-service.js`: Servicio de manipulación segura del DOM.

## Autor
**InnovaDataCo** · Ingeniería de Software de Alta Disponibilidad.
