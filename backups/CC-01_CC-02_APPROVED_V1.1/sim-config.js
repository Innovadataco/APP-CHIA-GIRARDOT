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
                txt: "6. Visión Panorámica y Contención: El plano maestro confirma los dos eventos en simultáneo: El Vehículo 1 sigue absolutamente varado custodiado en rojo por la Cámara 1, mientras el Vehículo 2 se aleja en marcha segura bajo el lente de la Cámara 2.",
                meta: "OVERVIEW: MASTER_SCENE_CONTROL",
                logs: ["[9.0s] CORE: DUAL_TRACKING_SYNC", "[9.5s] CCO: SCENE_SECURED_AUDIT_PASS"],
                action: (scene) => scene.moveTo(5)
            }
        ]
    },
    'CC-03': {
        is3D: true,
        steps: [
            {
                txt: "1. Control de Velocidad Nominal: El Panel de Mensajería Variable (PMV) muestra el límite reglamentario de 80 KM/H para flujo normal de tráfico bajo condiciones óptimas.",
                meta: "VMS_MODE: SPEED_LIMIT_80",
                logs: ["[0.0s] PMV: DISPLAYING_NOMINAL", "[0.5s] LIMIT: 80 KM/H"],
                action: (scene) => scene.moveTo(0)
            },
            {
                txt: "2. Alerta por Lluvia: Sensores detectan precipitación. El PMV cambia automáticamente para advertir sobre pavimento húmedo y reducir riesgos de hidroplaneo.",
                meta: "VMS_MODE: WEATHER_ADVISE_RAIN",
                logs: ["[1.5s] SENSOR: RAIN_DETECTED_HIGH", "[1.8s] PMV: UPDATE_LLUVIA_INTENSA"],
                action: (scene) => scene.moveTo(1)
            },
            {
                txt: "3. Reporte de Accidente: El Sistema de Detección de Incidentes reporta un choque adelante. El PMV alerta a los conductores para evitar colisiones por alcance.",
                meta: "VMS_MODE: INCIDENT_AHEAD",
                logs: ["[3.0s] CORE: ACCIDENT_DETECTED_PR45", "[3.5s] PMV: UPDATE_ACCIDENTE_VIA"],
                action: (scene) => scene.moveTo(2)
            },
            {
                txt: "4. Bloqueo de Calzada: Debido a la magnitud del evento, se confirma el bloqueo total de un carril. El PMV ordena el desvío o detención preventiva.",
                meta: "VMS_MODE: ROAD_BLOCKAGE",
                logs: ["[5.0s] CCO: TOTAL_BLOCKAGE_CONFIRMED", "[5.5s] PMV: UPDATE_BLOQUEO_VIA"],
                action: (scene) => scene.moveTo(3)
            },
            {
                txt: "5. Recomendación de Seguridad: Fase de mitigación. Se solicita a todos los usuarios disminuir la velocidad significativamente para garantizar la seguridad del personal de emergencia.",
                meta: "VMS_MODE: REDUCE_SPEED_NOW",
                logs: ["[7.0s] SAFETY: EMERGENCY_ZONE_ACTIVE", "[7.5s] PMV: DISMINUIR_VELOCIDAD"],
                action: (scene) => scene.moveTo(4)
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
