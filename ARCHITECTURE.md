# Arquitectura Técnica: Gemelo Digital ITS

## Concepto Maestro
El Gemelo Digital de Chía-Girardot se basa en la **Matriz de Transmisión de Valor (V47.0)**, un flujo secuencial que transforma datos de campo en inteligencia operativa visual.

## Capas de la Matriz (The Quadrant)

### 1. Componentes en Campo (Field)
Captura de datos mediante sensores físicos distribuidos en la vía:
- **CCTV**: Detección de incidentes por video-analítica.
- **VIM (DMS/VDS)**: Telemetría de tráfico y flujo vehicular.
- **SOS**: Postes de comunicación de emergencia.
- **WIM**: Pesaje dinámico en movimiento.

### 2. CCO (Integración)
El Centro de Control Operativo actúa como el **Núcleo de Sincronización**. Aquí se consolidan los datos, se aplican reglas de negocio y se generan las alertas que alimentan el Gemelo.

### 3. BIM (Representación Técnica)
El *Building Information Modeling* provee la base geométrica y técnica de la infraestructura. En nuestra arquitectura, la capa BIM asegura que el Gemelo Digital sea una representación fiel de la ingeniería civil (puentes, túneles, pavimentos).

### 4. Gemelo Digital (Visualización Operativa)
La capa final de visualización de alta fidelidad. Utiliza técnicas de **Holographic Rendering** para permitir que el operador interactúe con el gemelo de la vía, previendo incidentes y optimizando el tráfico.

## Tecnologías Utilizadas
- **Frontend**: HTML5 Semántico, CSS3 (Keyframes, Shaders, Backdrop-filters).
- **Core Engine**: JavaScript Vanilla (No-Framework architecture for low latency).
- **3D Sim**: Three.js para la representación dinámica de escenarios.
- **Persistence**: IndexedDB (vía `fake-indexeddb`) para gestión de datos fuera de línea.
