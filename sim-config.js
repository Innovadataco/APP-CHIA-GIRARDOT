/**
 * @file sim-config.js
 * @description Centralized Simulation Configuration for ITS Digital Twin
 */

const ANIMATIONS = {
    'CC-11': {
        is3D: true,
        steps: [
            {
                txt: "1. El vehículo se dirige a un peaje electrónico y lleva un El dispositivo (TAG): Se instala una pequeña etiqueta electrónica en el parabrisas del vehículo. Contiene un chip RFID que identifica únicamente tu carro y está asociado a una cuenta de pago prepagada o pospagada.",
                meta: "HARDWARE: TAG_RFID_ACTIVE",
                logs: ["[0.0s] TAG: DETECTED_IN_VEHICLE", "[0.5s] CHIP: STATIC_DATA_READY"],
                action: (scene) => scene.moveTo(0) 
            },
            {
                txt: "2. La antena en el peaje: Cuando el vehículo pasa por la caseta (o por arcos sobre la vía en sistemas free-flow), una antena lee el TAG en milisegundos mediante radiofrecuencia (RFID).",
                meta: "SENSOR: ANTENNA_HANDSHAKE",
                logs: ["[1.5s] RFID: READING_TAG...", "[1.8s] RSSI: -45dBm (Strong)"],
                action: (scene) => scene.moveTo(1)
            },
            {
                txt: "3. El cobro automático: El sistema identifica el vehículo, consulta la cuenta asociada y descuenta el valor del peaje automáticamente, sin que el conductor tenga que detenerse ni hacer nada.",
                meta: "TX: AUTOMATIC_CHARGING",
                logs: ["[3.0s] CORE: ACCOUNT_VERIFIED", "[3.5s] POS: TRANSACTION_EXIT_OK"],
                action: (scene) => scene.moveTo(2)
            },
            {
                txt: "4. Reporte de datos al CCO: Toda la información de la transacción y el registro visual se envía en tiempo real al Centro de Control Operacional.",
                meta: "INTEGRATION: CCO_REPORT",
                logs: ["[6.5s] API: SENDING_DATA_CCO...", "[7.0s] CCO: DATA_RECEIVED_ACK"],
                action: (scene) => scene.moveTo(3)
            },
            {
                txt: "5. Visión Panorámica CCO: Auditoría centralizada de la plaza de peaje. El Centro de Control supervisa la recaudación inteligente y el flujo vehicular sin interrupciones.",
                meta: "OVERVIEW: TOLL_AUDIT_SYNC",
                logs: ["[8.5s] CCO: ANALYTICS_REAL_TIME", "[9.0s] FLOW: FREE_SPEED_MAINTAINED"],
                action: (scene) => scene.moveTo(4)
            }
        ]
    },
    'CC-01': {
        is3D: true,
        steps: [
            {
                txt: "1. Vigilancia de Rutina: El sistema CCTV monitorea el tráfico fluido. Se detecta un peatón en la berma intentando cruzar de forma imprudente.",
                meta: "SCAN: MONITORING_ACTIVE",
                logs: ["[0.0s] PTZ: SWEEP_SEC_85", "[0.5s] OBJECT: PED_DETECTED_SHOULDER"],
                action: (scene) => scene.moveTo(0)
            },
            {
                txt: "2. COLISIÓN DETECTADA: Incidente crítico en calzada. El sistema de video analítica identifica el impacto exacto y activa el protocolo de emergencia.",
                meta: "IMPACT: CRITICAL_EVENT",
                logs: ["[2.2s] CORE: IMPACT_DETECTED_PR85", "[2.5s] AI: CRITICAL_FRAME_LOCKED"],
                action: (scene) => scene.moveTo(1)
            },
            {
                txt: "3. Alerta Vital y Coordinación: Se notifica al CCO sobre el accidente vial con herido. El sistema bloquea las coordenadas de GPS para el equipo de rescate.",
                meta: "ALERT: LIFE_SAFETY_PROTOCOL",
                logs: ["[4.0s] EVENT: PRIORITY_1_LIFE", "[4.5s] SOS: AUTOMATIC_REQ_AMBULANCE"],
                action: (scene) => scene.moveTo(2)
            },
            {
                txt: "4. Despacho de Emergencia: La información es transmitida instantáneamente. Se confirma el despacho de ambulancia y apoyo de la Policía de Carreteras.",
                meta: "DESPATCH: EMERGENCY_UNITS_ON_WAY",
                logs: ["[6.5s] CCO: AMBULANCE_DISPATCHED", "[7.0s] POLICE: UNIT_45_EN_ROUTE"],
                action: (scene) => scene.moveTo(3)
            },
            {
                txt: "5. Seguimiento Continuo y Trazabilidad: El sistema de analítica mantiene el rastro del vehículo en los siguientes tramos de vía. La información es compartida con las patrullas en ruta para una interceptación segura.",
                meta: "LOGISTICS: CONTINUOUS_TRACKING_MODE",
                logs: ["[8.5s] AI: TRACKING_LOCKED_SEC_2", "[9.0s] CCO: INTERCEPT_COORDINATION_ACTIVE"],
                action: (scene) => scene.moveTo(4)
            },
            {
                txt: "6. Supervisión Integral CCO: Vista panorámica desde el Centro de Control Operacional monitoreando simultáneamente el punto del siniestro y la trayectoria del vehículo implicado.",
                meta: "OPERATIONS: PANORAMIC_HUB_OVERSIGHT",
                logs: ["[10.0s] CCO: MULTI_EVENT_TRACKING_OK", "[10.5s] HUB: ALL_CAMS_SYNCED"],
                action: (scene) => scene.moveTo(5)
            },
            {
                txt: "7. Intervención Policial: El CCO despacha una patrulla inteligente para interceptar al vehículo infractor. Comienza el seguimiento táctico y reporte de autoridad.",
                meta: "POLICE: INTERCEPT_ACTIVE",
                logs: ["[12.0s] CCO: PATRULLA_DESPACHADA", "[12.5s] UNIT_45: PERSECUCIÓN_ACTIVA"],
                action: (scene) => scene.moveTo(6)
            }
        ]
    },
    'CC-02': {
        is3D: true,
        steps: [
            {
                txt: "1. Flujo Seguro y Distanciado: Múltiples vehículos transitan de manera fluida. Existe una separación paramétrica entre el Vehículo 1 y el Vehículo 2 a 50 KM/H.",
                meta: "AID_MODE: NEURAL_SCAN_ACTIVE",
                logs: ["[0.0s] CORE: DETECTING_2_TARGETS", "[0.5s] FLOW: AVG_SPEED_50_KMH"],
                action: (scene) => scene.moveTo(0)
            },
            {
                txt: "2. Detención Inesperada: El Vehículo 1 sufre una avería y queda varado inmóvil en la vía. La Cámara 1 (proximal) enfoca, detecta anomalía espacial e inicia evaluación térmica.",
                meta: "ANOMALY: OBJECT_STATIC_DETECTION",
                logs: ["[1.5s] TARGET_1: SPEED_DROP_0_KMH", "[1.8s] CAM_1: WARNING_YELLOW_INITIALIZED"],
                action: (scene) => scene.moveTo(1)
            },
            {
                txt: "3. Transmisión Confirmada al CCO: Al cumplirse los segundos de inmovilidad, la Cámara 1 pasa a alerta Roja (Siniestro Confirmado) y transmite de inmediato el paquete de crisis al holograma del CCO.",
                meta: "ALERT: CCO_DISPATCH_TRIGGER",
                logs: ["[3.0s] CAM_1: ALARM_CONFIRMED_RED", "[4.5s] CCO: ALERT_RECEIVED_DISPLAYING"],
                action: (scene) => scene.moveTo(2)
            },
            {
                txt: "4. Prevención Inteligente PMV: El CCO activa el panel advirtiendo: 'ACCIDENTE A 150m'. Alertado, el Vehículo 2 frena a tiempo. Simultáneamente, la Cámara 2 se activa (luz de prevención) e inicia el rastreo del Vehículo 2.",
                meta: "PREVENTION: VMS_CASCADE_WARNING",
                logs: ["[5.0s] PMV: ACTIVATED_EXTREME_ALERT", "[5.5s] CAM_2: TARGET_2_SLOWING_SEALED"],
                action: (scene) => scene.moveTo(3)
            },
            {
                txt: "5. Auditoría de Reducción: El Vehículo 2, acatando el PMV, avanza lentamente unos metros con velocidad controlada. La Cámara 2 del pórtico monitorea activamente si la baja velocidad se mantiene.",
                meta: "TRACKING: SLOW_SPEED_VERIFICATION",
                logs: ["[7.0s] CAM_2: MOTION_DETECTED_V2", "[7.5s] TARGET_2: RECOVERY_20_KMH"],
                action: (scene) => scene.moveTo(4)
            },
            {
                txt: "6. Seguimiento Vehículo en Movimiento: Superada la zona crítica, la Cámara 2 realiza un rastreo analítico en movimiento del Vehículo 2 para confirmar que mantiene una trayectoria segura y fluida.",
                meta: "TRACKING: DYNAMIC_MOTION_FOLLOW",
                logs: ["[9.0s] CAM_2: TARGET_LOCK_V2", "[9.5s] AI: DYNAMIC_TRACKING_SYNC"],
                action: (scene) => scene.moveTo(5)
            },
            {
                txt: "7. Vigilancia del CCO Establecida: El Centro de Control emite su señal de monitoreo integral sobre el tramo PR-105, asegurando el dominio operativo absoluto de la vía.",
                meta: "CCO: VIGILANCIA_ESTABLECIDA_7",
                logs: ["[10.5s] CCO: SCENE_SECURED", "[11.0s] PULSE: ACTIVE_MONITORING"],
                action: (scene) => scene.moveTo(6)
            }
        ]
    },
    'CC-03': {
        is3D: true,
        steps: [
            {
                txt: "1. Panel 1 - Velocidad Nominal: El CCO emite el primer mensaje de rutiina: 'LIMITE 80 KM/H'. El vehículo inicia su recorrido fluido por el PR-105.",
                meta: "VMS_CASCADE: P1_NOMINAL",
                logs: ["[0.0s] CCO: BROADCAST_P1", "[0.5s] VMS_1: MSG_SYNC_OK"],
                action: (scene) => scene.moveTo(0)
            },
            {
                txt: "2. Panel 2 - Alerta Climática: Ante lluvia detectada, el CCO actualiza el segundo panel: 'LLUVIA ADELANTE'. El vehículo mantiene precaución.",
                meta: "VMS_CASCADE: P2_WEATHER",
                logs: ["[2.0s] CCO: P2_WEATHER_SYNC", "[2.5s] RAIN_SENSOR: ACTIVE"],
                action: (scene) => scene.moveTo(1)
            },
            {
                txt: "3. Panel 3 - Advertencia de Incidencia: Radar ITS reporta evento a 1 km. El CCO dispara advertencia: 'ACCIDENTE A 1KM'. El vehículo inicia deceleración.",
                meta: "VMS_CASCADE: P3_WARNING",
                logs: ["[4.0s] CCO: ALERT_P3_EVENT", "[4.5s] RADAR: OBJECT_DETECTED"],
                action: (scene) => scene.moveTo(2)
            },
            {
                txt: "4. Panel 4 - Gestión de Carril: El CCO coordina el cierre preventivo por labores en vía: 'CALZADA CERRADA'. El vehículo realiza maniobra de contención.",
                meta: "VMS_CASCADE: P4_BLOCKAGE",
                logs: ["[6.0s] CCO: ACTION_P4_CLOSE", "[6.5s] FLOW: REDIRECT_ACTIVE"],
                action: (scene) => scene.moveTo(3)
            },
            {
                txt: "5. Panel 5 - Recomendación Final: El CCO confirma tramo recuperado e instruye: 'REDUZCA VELOCIDAD' para reingreso seguro al flujo principal.",
                meta: "VMS_CASCADE: P5_RECOVERY",
                logs: ["[8.0s] CCO: INFO_P5_SYNC", "[8.5s] VMS_5: ACKNOWLEDGE"],
                action: (scene) => scene.moveTo(4)
            },
            {
                txt: "6. Vigilancia del CCO Establecida: Visión maestra de la red de 5 paneles PMV operando sincrónicamente bajo el monitoreo integral del Centro de Control.",
                meta: "OVERVIEW: CCO_STABLISHED",
                logs: ["[10.0s] CCO: SCENE_SECURED", "[10.5s] PULSE: ACTIVE_MONITORING"],
                action: (scene) => scene.moveTo(5)
            }
        ]
    },
    'CC-04': {
        is3D: true,
        steps: [
            {
                txt: "1. Evento en Vía: Un usuario experimenta una falla mecánica y se detiene en la berma cerca de un poste SOS (PR 85+000).",
                meta: "EVENT: EMERGENCY_STOP",
                logs: ["[0.0s] VEHICLE: STOPPED_PR85", "[0.5s] SOS_POST: READY"],
                action: (scene) => scene.moveTo(0)
            },
            {
                txt: "2. Activación de Usuario: Se presiona el botón de pánico físico en el poste. El sistema activa el protocolo de comunicación cifrada.",
                meta: "ACTION: BUTTON_PUSHED",
                logs: ["[1.2s] CORE: HANDSHAKE_INITIALIZED", "[1.5s] LED: ALERT_STATUS_RED"],
                action: (scene) => scene.moveTo(1)
            },
            {
                txt: "3. Transmisión al CCO: El poste SOS establece un enlace de datos y voz con el Centro de Control mediante una transmision satelital/celular.",
                meta: "LINK: DATA_TRANSMISSION",
                logs: ["[2.5s] TX: SENDING_GPS_COORD", "[3.0s] CCO: CALL_INCOMING"],
                action: (scene) => scene.moveTo(2)
            },
            {
                txt: "4. Intercomunicación de Voz: Se abre el canal bidireccional. El operador del CCO brinda instrucciones mientras confirma el despacho.",
                meta: "VOICE: CHANNEL_OPEN",
                logs: ["[4.5s] CCO_OP: 'ESTAMOS EN CAMINO'", "[5.0s] AUDIO: HIGH_FIDELITY_LINK"],
                action: (scene) => scene.moveTo(3)
            },
            {
                txt: "5. Despacho de Ambulancia: El cierre del ciclo de emergencia se confirma con el despacho inmediato de una ambulancia y patrulla desde el Centro de Control para atención en sitio.",
                meta: "DISPATCH: MEDICAL_UNIT_SOS_02",
                logs: ["[6.5s] API: CREATING_TICKET_55", "[7.0s] AMBULANCE: EN_ROUTE_PR85"],
                action: (scene) => scene.moveTo(4)
            }
        ]
    },
    'CC-05': {
        is3D: true,
        steps: [
            {
                txt: "1. Detección IA (Video): El cono de visión inteligente escanea el carril. Se inicia el seguimiento del objeto en tiempo real.",
                meta: "AI: FOV_SCANNING",
                logs: ["[0.0s] AI_CAM: ACTIVE", "[0.5s] CONE: RENDERED"],
                action: (scene) => scene.moveTo(0)
            },
            {
                txt: "2. Captura de Metadatos: La IA clasifica el vehículo como C2 (Liviano). Envío inmediato del primer registro al CCO.",
                meta: "AI: OBJECT_DETECTION",
                logs: ["[1.5s] BBOX: LOCKED", "[1.8s] CCO: DATA_SENT"],
                action: (scene) => scene.moveTo(1)
            },
            {
                txt: "3. Validación Física (Loop): El vehículo cruza los lazos inductivos. Masa metálica confirma la presencia y velocidad.",
                meta: "EVENT: LOOP_VALIDATION",
                logs: ["[3.5s] LOOP: TRIGGERED", "[3.8s] MASS: DETECTED"],
                action: (scene) => scene.moveTo(2)
            },
            {
                txt: "4. Sincronismo de Datos: El CCO recibe la confirmación dual. Se consolidan las estadísticas de conteo y clasificación.",
                meta: "TX: DUAL_SYNC",
                logs: ["[5.5s] CCO: UPDATING_STATS", "[5.8s] STATS: TOTAL +1"],
                action: (scene) => scene.moveTo(3)
            },
            {
                txt: "5. Reporte Estructural: Visualización de analíticas avanzadas. El Gemelo Digital refleja la precisión operativa del corredor.",
                meta: "CCO: FINAL_REPORT",
                logs: ["[7.5s] REPORT: GENERATED", "[8.0s] ACCURACY: 99.8%"],
                action: (scene) => scene.moveTo(4)
            }
        ]
    }
};

window.ANIMATIONS = ANIMATIONS;
