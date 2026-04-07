/**
 * @file three-engine.js
 * @description Core 3D Engine - Monolithic High-Fidelity Version (V1.0.12)
 * STABLE RESTORATION: Reverted to the version approved for CC-05 Hybrid Sync.
 */

class ThreeEngine {
    constructor(steps, container, componentId) {
        this.steps = steps;
        this.container = container;
        this.componentId = componentId;
        this.currentStepIdx = 0;
        this.isAutoplay = false;
        this.autoplayTimer = null;
        
        // Simulation Stats State (Original Approved Values)
        this.stats = { total: 1420, cars: 850, trucks: 570 };

        this.init();
    }

    init() {
        DOMService.update(this.container, `
            <div class="anim-container-v2">
                <div id="v3-canvas-container" class="anim-main-stage"></div>
                <div id="v3-terminal" class="anim-terminal"></div>
            </div>`);

        const canvasWrap = document.getElementById('v3-canvas-container');
        this.v3Term = document.getElementById('v3-terminal');
        this.stepNumDisplay = document.getElementById('step-num');
        this.stepTotalDisplay = document.getElementById('step-total');
        this.stepTxtDisplay = document.getElementById('step-txt-display');
        this.playBtn = document.getElementById('v3-autoplay-btn');

        if (this.stepTotalDisplay) this.stepTotalDisplay.textContent = this.steps.length;

        const w = canvasWrap.offsetWidth || 640;
        const h = canvasWrap.offsetHeight || 420;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x020617);
        this.camera = new THREE.PerspectiveCamera(50, w / h, 1, 1000);
        this.lookTarget = new THREE.Vector3(0, 3, 50);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(w, h);
        canvasWrap.appendChild(this.renderer.domElement);

        this.setupLights();
        this.setupAssets();
        this.setupTerminal();
        this.startRenderLoop();
    }

    setupLights() {
        this.scene.add(new THREE.AmbientLight(0xffffff, 0.4));
        const dLight = new THREE.DirectionalLight(0xffffff, 1.5);
        dLight.position.set(30, 50, 30);
        this.scene.add(dLight);

        this.carSpot = new THREE.SpotLight(0xffffff, 25, 100, Math.PI / 6, 0.4);
        this.carSpot.position.set(0, 30, 50);
        this.scene.add(this.carSpot);
    }

    setupAssets() {
        this.scene.fog = new THREE.FogExp2(0x020617, 0.001); 
        ThreeAssets.createRoad(this.scene);
        const carData = ThreeAssets.createVehicle();
        this.carGroup = carData.group;
        this.scene.add(this.carGroup);
        this.carSpot.target = this.carGroup;

        this.hub = ThreeAssets.createCCOHub(this.scene);
        this.rain = ThreeAssets.createRain(5000);
        this.scene.add(this.rain);

        // Component Specific Asset Setup (Monolithic)
        if (this.componentId === 'CC-01') {
            // CCTV-01 (General View)
            const o1 = ThreeAssets.createCCTVSystem(this.scene, 0);
            this.cctvCam = o1.cam; this.activeFrustum = o1.frustum;

            // CCTV-02 (Incident Monitoring & Tracking)
            const o2 = ThreeAssets.createCCTVSystem(this.scene, -60);
            this.cctvCam2 = o2.cam; this.activeFrustum2 = o2.frustum;
            this.activeFrustum2.visible = false; // INICIA APAGADA

            this.activePed = ThreeAssets.createPedestrian();
            this.scene.add(this.activePed);
            this.activeShock = ThreeAssets.createShockwave();
            this.scene.add(this.activeShock);

            // PATRULLA POLICIAL (NUEVO ACTIVO)
            const p = ThreeAssets.createVehicle(0x1e293b); // Patrulla oscura
            this.policeGroup = p.group;
            this.policeGroup.visible = false;
            
            // Sirenas Policiales (Rojo / Azul)
            this.sirenRL = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.2, 0.8), new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 0 }));
            this.sirenBL = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.2, 0.8), new THREE.MeshStandardMaterial({ color: 0x3b82f6, emissive: 0x3b82f6, emissiveIntensity: 0 }));
            this.sirenRL.position.set(-0.4, 1.45, -0.4);
            this.sirenBL.position.set(0.4, 1.45, -0.4);
            this.policeGroup.add(this.sirenRL, this.sirenBL);
            this.scene.add(this.policeGroup);

            // AMBULANCIA (DESPACHO MEDICO)
            this.ambObj = ThreeAssets.createAmbulance(this.scene);
            this.ambGroup = this.ambObj.group;
            this.ambSirenRL = this.ambObj.sRL;
            this.ambSirenWL = this.ambObj.sWL;
        } else if (this.componentId === 'CC-02') {
            // CCTV-01 (Detección de Incidentes)
            const o1 = ThreeAssets.createCCTVSystem(this.scene, -150);
            this.cctvCam = o1.cam; this.activeFrustum = o1.frustum;

            // CCTV-02 (Monitoreo de Flujo Preventivo)
            const o2 = ThreeAssets.createCCTVSystem(this.scene, 20);
            this.cctvCam2 = o2.cam; this.activeFrustum2 = o2.frustum;
            this.activeFrustum2.visible = false; // INICIA APAGADA

            this.aidObj = ThreeAssets.createAIDHUD();
            this.aidGroup = this.aidObj.group; this.aidGroup.visible = false;
            this.scene.add(this.aidGroup);

            // VEHICULO 2 PARA CC-02 (INTERACCION TACTICA)
            const c2 = ThreeAssets.createVehicle(0x3b82f6); // Azul
            this.carGroup2 = c2.group;
            this.scene.add(this.carGroup2);

            // PMV LOCAL PARA AID
            this.pmvAid = ThreeAssets.createPMVSystem(this.scene, 50, 0x00ff88);
        } else if (this.componentId === 'CC-03') {
            // CASCADA DE 5 PANELES PMV
            this.pmvCascade = [];
            this.carGroup.visible = false; // OCULTAR VEHÍCULO BLUE PREDETERMINADO
            const positions = [140, 90, 40, -10, -60];
            positions.forEach((z, i) => {
                const pmv = ThreeAssets.createPMVSystem(this.scene, z, 0x00ff88);
                this.pmvCascade.push(pmv);
            });
            
            // VEHÍCULO DE TRAYECTO PERSISTENTE (ÚNICO)
            const car = ThreeAssets.createVehicle(0xeab308); // Naranja/Ambar
            this.mainTraveler = car.group;
            this.mainTraveler.position.set(0, 0.7, 180);
            this.scene.add(this.mainTraveler);

            // FOCO DE SEGUIMIENTO CCO
            this.pmvFoco = ThreeAssets.createCameraFrustum(this.scene, { x: 20, y: 15, z: 40 }, 0x22d3ee);
            this.pmvFoco.visible = false;
        } else if (this.componentId === 'CC-04') {
            this.sos = ThreeAssets.createSOSCallbox(this.scene, 0);
        } else if (this.componentId === 'CC-05') {
            this.vdsV = ThreeAssets.createAnalyticsCamera(this.scene, 0); 
            this.vds = ThreeAssets.createVDSSystem(this.scene, 20);      
            this.vdsHud = ThreeAssets.createVehicleHUD();
            this.vdsHud.group.visible = false; 
            this.carGroup.add(this.vdsHud.group);
        } else if (this.componentId === 'CC-11') {
            this.pillarMat = ThreeAssets.createTollStructure(this.scene);
            // FOCO DE VALIDACIÓN PEAJE
            this.tollFoco = ThreeAssets.createCameraFrustum(this.scene, { x: 5, y: 15, z: 20 }, 0x10b981);
            this.tollFoco.visible = false;
        }

        // LIMPIEZA DE ADICIONALES PARA MANTENER UI LIMPIA (V0.8.15.1)
        if (this.vdsHud && this.componentId !== 'CC-05') this.vdsHud.group.visible = false;
        if (this.aidGroup && this.componentId !== 'CC-02') this.aidGroup.visible = false;

        // PULSO DE VIGILANCIA ACTIVA (VIGILANDO LOS 2 EVENTOS)
        const pulseGeom = new THREE.RingGeometry(1, 1.2, 32);
        const pulseMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0, side: THREE.DoubleSide });
        this.ccoPulse = new THREE.Mesh(pulseGeom, pulseMat);
        this.ccoPulse.position.set(24, 0.1, 40); // ORIGEN EN EL CCO HUB
        this.ccoPulse.rotation.x = -Math.PI / 2;
        this.scene.add(this.ccoPulse);
    }

    setupTerminal() {
        this.termGroup = new THREE.Group();
        this.termCanvas = document.createElement('canvas');
        this.termCtx = this.termCanvas.getContext('2d');
        this.termCanvas.width = 512; this.termCanvas.height = 512;
        this.termTex = new THREE.CanvasTexture(this.termCanvas);
        const termMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(12, 12),
            new THREE.MeshStandardMaterial({ map: this.termTex, transparent: true, opacity: 0.9, emissive: 0x3b82f6, emissiveIntensity: 0.5 })
        );
        this.termGroup.add(termMesh);
        this.termGroup.position.set(12, 22, -65);
        this.termGroup.rotation.y = -Math.PI / 6;
        this.termGroup.scale.set(0, 0, 0);
        this.scene.add(this.termGroup);
    }

    startRenderLoop() {
        const animate = () => {
            if (!this.renderer) return;
            requestAnimationFrame(animate);
            if (this.rain && this.rain.visible) {
                const pos = this.rain.geometry.attributes.position.array;
                const vel = this.rain.userData.velocities;
                for (let i = 0; i < vel.length; i++) {
                    pos[i * 3 + 1] -= vel[i];
                    if (pos[i * 3 + 1] < 0) pos[i * 3 + 1] = 100;
                }
                this.rain.geometry.attributes.position.needsUpdate = true;
            }
            if (this.hub && this.hub.labelGroup) this.hub.labelGroup.rotation.y += 0.01;

            // UNIVERSAL INDEPENDENT TRACKING (V0.8.5)
            if (this.componentId === 'CC-01') {
                // CAMARA 1 -> SIEMPRE AL PEATÓN (VÍCTIMA)
                if (this.activeFrustum && this.activePed) {
                    this.activeFrustum.lookAt(this.activePed.position);
                }
                // CAMARA 2 -> AL VEHÍCULO (INFRACTOR)
                if (this.activeFrustum2 && this.carGroup) {
                    this.activeFrustum2.lookAt(this.carGroup.position);
                }
                
                // ACTUALIZACIÓN DE CUERPOS FÍSICOS DE CÁMARA
                if (this.cctvCam && this.activePed) this.cctvCam.lookAt(this.activePed.position);
                if (this.cctvCam2 && this.carGroup) this.cctvCam2.lookAt(this.carGroup.position);

            } else if (this.componentId === 'CC-02') {
                // CAMARA 1 -> SIEMPRE AL INCIDENTE (VEHICULO VARADO)
                if (this.activeFrustum && this.carGroup) {
                    this.activeFrustum.lookAt(this.carGroup.position);
                }
                // CAMARA 2 -> AL VEHÍCULO DE APOYO (PATRULLA)
                if (this.activeFrustum2 && this.carGroup2) {
                    this.activeFrustum2.lookAt(this.carGroup2.position);
                }
                
                // ACTUALIZACIÓN DE CUERPOS FÍSICOS DE CÁMARA
                if (this.cctvCam && this.carGroup) this.cctvCam.lookAt(this.carGroup.position);
                if (this.cctvCam2 && this.carGroup2) this.cctvCam2.lookAt(this.carGroup2.position);
            } else {
                // OTROS ESCENARIOS (PMV, VDS, PEAJE)
                const targetCar = (this.componentId === 'CC-03') ? this.mainTraveler : this.carGroup;
                if (targetCar) {
                    if (this.pmvFoco) {
                        // RASTREO ANALÍTICO DE ROTACIÓN (LA POSICIÓN SE GESTIONA EN HANDLESTEPLOGIC PARA FLUIDEZ TOTAL)
                        this.pmvFoco.lookAt(targetCar.position);
                    }
                    if (this.tollFoco) this.tollFoco.lookAt(targetCar.position);
                    if (this.vdsV && this.vdsV.cone) this.vdsV.cone.lookAt(targetCar.position);
                }
            }

            if (this.aidGroup && this.carGroup) {
                this.aidGroup.position.copy(this.carGroup.position);
                this.aidObj.ring.rotation.z += 0.05;
            }

            this.camera.lookAt(this.lookTarget);
            this.renderer.render(this.scene, this.camera);
        };
        animate();
    }

    goToStep(idx) {
        if (idx < 0 || idx >= this.steps.length) return;
        this.currentStepIdx = idx;
        const step = this.steps[idx];
        if (this.stepNumDisplay) this.stepNumDisplay.textContent = idx + 1;
        if (this.stepTxtDisplay) this.stepTxtDisplay.textContent = step.txt;
        if (step.logs) {
            step.logs.forEach(log => {
                const line = document.createElement('div');
                line.className = 'term-line';
                const ts = `<span class="term-ts">[${new Date().toLocaleTimeString()}]</span> `;
                DOMService.update(line, ts + DOMService.safeHTML(log));
                this.v3Term.appendChild(line);
            });
            this.v3Term.scrollTop = this.v3Term.scrollHeight;
        }
        this.moveTo(idx);
        this.handleStepLogic(idx);
    }

    moveTo(idx) {
        const mapping = this.getStepMapping(idx);
        const duration = (idx === 0) ? 0.8 : 2.5; 
        this.impactTriggered = false; // Reset flag for collisions

        gsap.to(this.carGroup.position, { 
            z: mapping.target, 
            duration: duration, 
            ease: "power2.inOut",
            onUpdate: () => {
                // Trigger dinámico para CC-01 Paso 2
                if (this.componentId === 'CC-01' && idx === 1 && !this.impactTriggered) {
                    if (this.carGroup.position.z <= 43.5) {
                        this.impactTriggered = true;
                        this.triggerCC01Impact();
                    }
                }
            }
        });
        gsap.to(this.camera.position, { x: mapping.cam.x, y: mapping.cam.y, z: mapping.cam.z, duration: duration + 1, ease: "power2.inOut" });
        gsap.to(this.lookTarget, { 
            x: mapping.look.x, y: mapping.look.y, z: mapping.look.z, 
            duration: duration + 1, ease: "power2.inOut",
            onUpdate: () => this.camera.lookAt(this.lookTarget)
        });
    }

    triggerCC01Impact() {
        // CINEMÁTICA DE ATROPELLAMIENTO INSTANTÁNEA
        gsap.to(this.activePed.rotation, { x: -Math.PI / 2.1, duration: 0.25, ease: "bounce.out" });
        gsap.to(this.activePed.position, { y: 0.3, z: 43.5, duration: 0.25 });

        this.activeShock.scale.set(1, 1, 1); 
        this.activeShock.material.opacity = 0.8;
        this.activeShock.material.color.set(0xff0000);
        
        gsap.to(this.activeShock.scale, { x: 75, y: 75, duration: 0.4, repeat: -1 });
        gsap.to(this.activeShock.material, { opacity: 0, duration: 0.4, repeat: -1 });
        
        if (this.activeFrustum) {
            this.activeFrustum.material.color.set(0xff0000);
            this.activeFrustum.material.opacity = 0.4;
            gsap.to(this.activeFrustum.material, { opacity: 0.1, duration: 0.2, repeat: -1, yoyo: true });
        }

        this.drawReport('CC-01');
        gsap.to(this.termGroup.scale, { x: 1.1, y: 1.1, z: 1.1, duration: 0.5, ease: "back.out" });
    }

    getStepMapping(idx) {
        const defaultMap = { target: 0, cam: { x: 35, y: 35, z: 90 }, look: { x: 0, y: 3, z: 40 } };
        const maps = {
            'CC-01': [
                { target: 60, cam: { x: 35, y: 35, z: 90 }, look: { x: 0, y: 3, z: 40 } },
                { target: 40, cam: { x: 45, y: 40, z: 95 }, look: { x: 0, y: 3, z: 20 } },
                { target: 25, cam: { x: 40, y: 30, z: 60 }, look: { x: 0, y: 4, z: 0 } },
                { target: -40, cam: { x: 45, y: 35, z: -10 }, look: { x: 18, y: 18, z: -68 } },
                { target: -100, cam: { x: 55, y: 30, z: -50 }, look: { x: 18, y: 18, z: -68 } },
                { target: -105, cam: { x: 200, y: 110, z: -40 }, look: { x: 0, y: 15, z: -40 } },
                { target: -130, cam: { x: 240, y: 130, z: -45 }, look: { x: 0, y: 15, z: -45 } }
            ],
            'CC-02': [
                { target: -150, cam: { x: 8, y: 5, z: 170 }, look: { x: 0, y: 2, z: 150 } },
                { target: -150, cam: { x: 12, y: 6, z: -120 }, look: { x: 0, y: 2, z: -150 } },
                { target: -150, cam: { x: 20, y: 8, z: 100 }, look: { x: 0, y: 6, z: 50 } },
                { target: -150, cam: { x: 45, y: 35, z: 20 }, look: { x: 0, y: 5, z: -50 } },
                { target: -150, cam: { x: 55, y: 40, z: -100 }, look: { x: 0, y: 5, z: -150 } },
                { target: -150, cam: { x: 15, y: 15, z: 45 }, look: { x: 0, y: 4, z: 10 } }, // SEGUIMIENTO V2 (NUEVO)
                { target: -150, cam: { x: 200, y: 130, z: -40 }, look: { x: 0, y: 15, z: -45 } } // VIGILANCIA CCO
            ],
            'CC-03': [
                { target: 0, cam: { x: 35, y: 25, z: 180 }, look: { x: 0, y: 3, z: 140 } }, // Panel 1
                { target: 0, cam: { x: 35, y: 25, z: 130 }, look: { x: 0, y: 3, z: 90 } },  // Panel 2
                { target: 0, cam: { x: 35, y: 25, z: 80 }, look: { x: 0, y: 3, z: 40 } },   // Panel 3
                { target: 0, cam: { x: 35, y: 25, z: 30 }, look: { x: 0, y: 3, z: -10 } },  // Panel 4
                { target: 0, cam: { x: 35, y: 25, z: -20 }, look: { x: 0, y: 3, z: -60 } }, // Panel 5
                { target: 0, cam: { x: 45, y: 35, z: -100 }, look: { x: 0, y: 5, z: -140 } }, // Seguimiento Final
                { target: 0, cam: { x: 240, y: 130, z: -45 }, look: { x: 0, y: 15, z: -45 } } // Vigilancia CCO
            ],
            'CC-04': [
                { target: 0, cam: { x: 10, y: 10, z: 50 }, look: { x: 0, y: 2, z: 0 } },
                { target: 0, cam: { x: 8, y: 5, z: 12 }, look: { x: 0, y: 4, z: 0 } },
                { target: 0, cam: { x: 30, y: 35, z: -40 }, look: { x: 24, y: 10, z: -70 } },
                { target: 0, cam: { x: 15, y: 10, z: 10 }, look: { x: 0, y: 6, z: 0 } },
                { target: 0, cam: { x: 240, y: 130, z: -45 }, look: { x: 0, y: 15, z: -45 } }
            ],
            'CC-05': [
                { target: 150, cam: { x: 25, y: 15, z: 80 }, look: { x: 0, y: 2, z: 0 } },
                { target: 70, cam: { x: -18, y: 14.5, z: 12 }, look: { x: -8, y: 10, z: 0 } },
                { target: 25, cam: { x: 12, y: 6, z: 35 }, look: { x: 0, y: 0, z: 20 } },
                { target: 10, cam: { x: 30, y: 25, z: -40 }, look: { x: 24, y: 10, z: -70 } },
                { target: 0, cam: { x: 240, y: 130, z: -45 }, look: { x: 0, y: 15, z: -45 } }
            ],
            'CC-11': [
                { target: 50, cam: { x: 35, y: 35, z: 90 }, look: { x: 0, y: 3, z: 40 } },
                { target: 25, cam: { x: 25, y: 25, z: 60 }, look: { x: 0, y: 3, z: 20 } },
                { target: 0, cam: { x: 15, y: 15, z: 30 }, look: { x: 0, y: 4, z: 0 } },
                { target: -45, cam: { x: 10, y: 30, z: -30 }, look: { x: 18, y: 18, z: -68 } },
                { target: -45, cam: { x: 240, y: 130, z: -45 }, look: { x: 0, y: 15, z: -45 } }
            ]
        };
        return (maps[this.componentId] ? maps[this.componentId][idx] : null) || defaultMap;
    }

    handleStepLogic(idx) {
        if (idx < this.steps.length - 1) gsap.to(this.termGroup.scale, { x: 0, y: 0, z: 0, duration: 0.5 });
        
        // GESTOR DE VISIBILIDAD MAESTRO (V0.8.6)
        if (this.activeFrustum) {
            if (this.componentId === 'CC-01') this.activeFrustum.visible = (idx >= 1 && idx < this.steps.length - 1);
            else this.activeFrustum.visible = (idx < this.steps.length - 1);
        }
        if (this.activeFrustum2) {
            if (this.componentId === 'CC-01') this.activeFrustum2.visible = (idx >= 1 && idx < this.steps.length - 1);
            else this.activeFrustum2.visible = (idx === 6 || (this.componentId === 'CC-02' && idx === 5));
        }
        if (this.pmvFoco) this.pmvFoco.visible = (this.componentId === 'CC-03' && idx < 5);
        if (this.tollFoco) this.tollFoco.visible = (this.componentId === 'CC-11' && idx > 0 && idx < 3);
        if (this.vdsV && this.vdsV.cone) this.vdsV.cone.visible = (this.componentId === 'CC-05' && (idx === 1 || idx === 2));

        // AUTOMATIZACIÓN DE VIGILANCIA CCO AL FINALIZAR CUALQUIER ANIMACIÓN
        if (idx === this.steps.length - 1) {
            this.triggerMonitoringSignal();
        }

        switch(this.componentId) {
            case 'CC-01':
                if (idx === 1) {
                    // PREPARACIÓN DE ESCENA (COLISIÓN DINÁMICA VÍA TRIGGER)
                    this.activePed.position.x = 0;
                    
                    // CAMARA 2: PERMANECE APAGADA
                    if (this.activeFrustum2) {
                        this.activeFrustum2.visible = false;
                        gsap.killTweensOf(this.activeFrustum2.material);
                    }
                } else if (idx === 2) {
                    // PASO 3: CCO ACTIVA CAMARA 2 (ALERTA ROJA) - ANÁLISIS DE SITUACIÓN
                    if (this.activeFrustum2) {
                        this.activeFrustum2.visible = true; 
                        this.activeFrustum2.material.color.set(0xff0000);
                        this.activeFrustum2.material.opacity = 0.4;
                        gsap.to(this.activeFrustum2.material, { opacity: 0.1, duration: 0.3, repeat: -1, yoyo: true });
                    }
                    this.drawReport('CC-01');
                    gsap.to(this.termGroup.scale, { x: 1, y: 1, z: 1, duration: 0.5 });
                } else if (idx === 3) {
                    // PASO 4: DESPACHO TOTAL (AMBULANCIA + PATRULLA)
                    if (this.ambGroup) {
                        this.ambGroup.visible = true;
                        gsap.to(this.ambSirenRL.material, { emissiveIntensity: 12, duration: 0.2, repeat: -1, yoyo: true });
                        gsap.to(this.ambSirenWL.material, { emissiveIntensity: 12, duration: 0.2, repeat: -1, yoyo: true, delay: 0.2 });
                    }
                    if (this.policeGroup) {
                        this.policeGroup.visible = true;
                        gsap.to(this.sirenRL.material, { emissiveIntensity: 12, duration: 0.2, repeat: -1, yoyo: true });
                        gsap.to(this.sirenBL.material, { emissiveIntensity: 12, duration: 0.2, repeat: -1, yoyo: true, delay: 0.2 });
                        // INICIO DE PERSECUCION ACTIVA
                        gsap.to(this.policeGroup.position, { z: -90, duration: 10, ease: "power1.inOut" });
                    }
                    gsap.to(this.carGroup.position, { z: -100, duration: 10, ease: "power1.inOut" });
                    this.drawReport('CC-01-ALERTA-TOTAL');
                    this.triggerMonitoringSignal(); // SEÑAL DE DESPACHO COORDINADO
                } else if (idx === 5) {
                    // PASO 6: PANORAMICA CCO
                    this.drawReport('CC-01');
                    gsap.to(this.termGroup.scale, { x: 0, y: 0, z: 0, duration: 0.5 }); 
                } else if (idx === 6) {
                    // PASO 7: INTERVENCION POLICIAL FINAL
                    this.drawReport('CC-01-PATRULLA');
                    this.triggerMonitoringSignal();
                } else if (idx === 0) {
                    // RESET COMPLETO DE EMERGENCIA (V0.8.8.1)
                    if (this.policeGroup) {
                        this.policeGroup.visible = false;
                        this.policeGroup.position.set(-8, 0.7, 50);
                        gsap.killTweensOf(this.sirenRL.material);
                        gsap.killTweensOf(this.sirenBL.material);
                        gsap.killTweensOf(this.policeGroup.position);
                    }
                    if (this.ambGroup) {
                        this.ambGroup.visible = false;
                        gsap.killTweensOf(this.ambSirenRL.material);
                        gsap.killTweensOf(this.ambSirenWL.material);
                    }
                    if (this.carGroup) {
                        this.carGroup.position.set(0, 0.7, 50);
                        gsap.killTweensOf(this.carGroup.position);
                    }
                    this.activePed.position.set(-6, 0.5, 40);
                    this.activePed.rotation.x = 0;
                    gsap.killTweensOf(this.activePed.rotation);
                    gsap.killTweensOf(this.activePed.position);
                    gsap.killTweensOf(this.activeShock.scale);
                    
                    if (this.activeFrustum) {
                        this.activeFrustum.material.color.set(0x3b82f6);
                        this.activeFrustum.material.opacity = 0.15;
                        gsap.killTweensOf(this.activeFrustum.material);
                    }
                    if (this.activeFrustum2) {
                        this.activeFrustum2.visible = false;
                        this.activeFrustum2.material.color.set(0x3b82f6);
                        this.activeFrustum2.material.opacity = 0.15;
                        gsap.killTweensOf(this.activeFrustum2.material);
                    }
                }
                break;
            case 'CC-02':
                if (idx === 1) {
                    // PASO 2: VEHICULO VARADO (CAM 1 AMARILLO)
                    this.aidGroup.visible = true; 
                    gsap.from(this.aidGroup.scale, { x: 0, y: 0, z: 0, duration: 0.5 });
                    if (this.activeFrustum) {
                        this.activeFrustum.material.color.set(0xffcc00);
                        this.activeFrustum.material.opacity = 0.3;
                    }
                } else if (idx === 2) {
                    // PASO 3: SINIESTRO CONFIRMADO (CAM 1 ROJO)
                    if (this.activeFrustum) {
                        this.activeFrustum.material.color.set(0xff0000);
                        this.activeFrustum.material.opacity = 0.4;
                        gsap.to(this.activeFrustum.material, { opacity: 0.1, duration: 0.4, repeat: -1, yoyo: true });
                    }
                    this.drawReport('CC-02');
                    gsap.to(this.termGroup.scale, { x: 1, y: 1, z: 1, duration: 0.5 });
                } else if (idx === 3) {
                    // PASO 4: ACTIVACION CAM 2 (AMARILLO SEGUIMIENTO) Y PMV ALERTA
                    if (this.activeFrustum2) {
                        this.activeFrustum2.visible = true;
                        this.activeFrustum2.material.color.set(0xffcc00); // AMARILLO SEGUIMIENTO
                        this.activeFrustum2.material.opacity = 0.4;
                        gsap.to(this.activeFrustum2.material, { opacity: 0.1, duration: 0.4, repeat: -1, yoyo: true });
                    }
                    if (this.pmvAid) {
                        this.drawPMV(this.pmvAid, 'VEHÍCULO DETENIDO A 50M');
                        this.pmvAid.borderMat.color.set(0xff0000);
                        this.pmvAid.borderMat.emissive.set(0xff0000);
                    }
                    if (this.carGroup2) {
                        // El vehículo 2 continúa el trayecto a velocidad de precaución
                        gsap.to(this.carGroup2.position, { z: 10, duration: 4, ease: "none" });
                    }
                } else if (idx === 5) {
                    // PASO 6: SEGUIMIENTO DINAMICO VEHICULO 2
                    if (this.carGroup2) {
                        gsap.to(this.carGroup2.position, { z: -10, duration: 4, ease: "none" });
                    }
                } else if (idx === 6) {
                    if (this.activeFrustum) this.activeFrustum.visible = true;
                    if (this.activeFrustum2) this.activeFrustum2.visible = true;
                    // PASO 7: VIGILANCIA CCO ESTABLECIDA (PANORAMICA + PULSO)
                    this.drawReport('CC-02');
                    gsap.to(this.termGroup.scale, { x: 1, y: 1, z: 1, duration: 0.5 });
                    this.triggerMonitoringSignal();
                } else if (idx === 0) {
                    // RESET
                    this.aidGroup.visible = false;
                    if (this.carGroup2) {
                        this.carGroup2.position.set(0, 0.7, 100);
                        gsap.killTweensOf(this.carGroup2.position);
                    }
                    if (this.pmvAid) {
                        this.drawPMV(this.pmvAid, 'NOMINAL');
                        this.pmvAid.borderMat.color.set(0x00ff88);
                    }
                    gsap.to(this.termGroup.scale, { x: 0, y: 0, z: 0, duration: 0.5 });
                    if (this.activeFrustum) {
                        this.activeFrustum.material.color.set(0x3b82f6);
                        this.activeFrustum.material.opacity = 0.15;
                        gsap.killTweensOf(this.activeFrustum.material);
                    }
                    if (this.activeFrustum2) {
                        this.activeFrustum2.visible = false;
                        this.activeFrustum2.material.color.set(0x3b82f6);
                        this.activeFrustum2.material.opacity = 0.15;
                        gsap.killTweensOf(this.activeFrustum2.material);
                    }
                }
                break;
            case 'CC-03':
                this.setRain(idx === 1); 
                const cascadeMsgs = [
                    'VEL: 80 KM/H',
                    'LLUVIA ADELANTE',
                    'ACCIDENTE A 1KM',
                    'CALZADA CERRADA',
                    'REDUZCA VELOCIDAD'
                ];
                const cascadeColors = [0x00ff88, 0xffcc00, 0xff0000, 0xff0000, 0xffcc00];
                
                // ACTIVACIÓN DE PANELES Y MOVIMIENTO COORDINADO (V0.8.15)
                if (idx >= 0 && idx < 5) {
                    if (this.pmvFoco) this.pmvFoco.visible = true;
                    const pmv = this.pmvCascade[idx];
                    
                    // PRIMER LETRERO EN OFF (PASO 1) SEGÚN REQUERIMIENTO
                    if (idx === 0) {
                        this.drawPMV(pmv, 'OFF'); 
                        if (pmv.borderMat) pmv.borderMat.emissive.set(0x000000);
                    } else {
                        this.drawPMV(pmv, cascadeMsgs[idx]);
                        if (pmv.borderMat) {
                            pmv.borderMat.color.set(cascadeColors[idx]);
                            pmv.borderMat.emissive.set(cascadeColors[idx]);
                        }
                    }

                    if (this.mainTraveler) {
                        const targetZ = [140, 90, 40, -10, -60][idx];
                        gsap.to(this.mainTraveler.position, { z: targetZ, duration: 2, ease: "power1.inOut" });
                        // SINCRONIZACIÓN MILIMÉTRICA DEL FOCO CON EL COCHE
                        if (this.pmvFoco) gsap.to(this.pmvFoco.position, { z: targetZ + 25, duration: 2, ease: "power1.inOut" });
                    }
                    this.triggerMonitoringSignal(); 
                } else if (idx === 5) {
                    // PASO 6: VIGILANCIA CCO FINAL - CIERRE CINEMATOGRÁFICO
                    if (this.pmvFoco) {
                        this.pmvFoco.visible = true; 
                        gsap.to(this.pmvFoco.position, { z: -55, duration: 4, ease: "power1.inOut" });
                    }
                    if (this.mainTraveler) {
                        gsap.to(this.mainTraveler.position, { z: -80, duration: 4, ease: "power1.inOut" });
                    }
                    this.drawReport('CC-03');
                    gsap.to(this.termGroup.scale, { x: 1, y: 1, z: 1, duration: 0.5 });
                    this.triggerMonitoringSignal();
                }

                if (idx === 0) {
                    // RESET ESPECÍFICO CC-03 CON POSICIONAMIENTO DE FOCO ORIGINAL
                    if (this.mainTraveler) {
                        this.mainTraveler.position.set(0, 0.7, 180);
                        gsap.killTweensOf(this.mainTraveler.position);
                    }
                    if (this.pmvFoco) {
                        this.pmvFoco.position.z = 205; // POSICIÓN DE ESPERA DETRÁS DEL PANEL 1
                        gsap.killTweensOf(this.pmvFoco.position);
                    }
                    this.pmvCascade.forEach(pmv => {
                        this.drawPMV(pmv, 'OFF');
                        if (pmv.borderMat) {
                            pmv.borderMat.color.set(0x00ff88);
                            pmv.borderMat.emissive.set(0x000000);
                        }
                    });
                }
                break;
            case 'CC-04':
            case 'CC-04':
                if (this.sos && this.sos.pulse) {
                    this.sos.pulse.visible = (idx >= 1 && idx <= 3);
                    if (idx === 1) {
                        // ALERTA ROJA POSTE
                        gsap.to(this.sos.redMat, { emissiveIntensity: 15, duration: 0.3, repeat: -1, yoyo: true });
                        this.sos.pulse.scale.set(1, 1, 1);
                        this.sos.pulse.material.opacity = 0.8;
                        gsap.to(this.sos.pulse.scale, { x: 45, y: 45, duration: 1.2, repeat: -1 });
                        gsap.to(this.sos.pulse.material, { opacity: 0, duration: 1.2, repeat: -1 });
                    }
                }
                if (idx === 4) {
                    this.drawReport('CC-04');
                    gsap.to(this.termGroup.scale, { x: 1, y: 1, z: 1, duration: 0.5 });
                } else if (idx === 0) {
                    if (this.sos && this.sos.pulse) {
                        gsap.killTweensOf(this.sos.pulse.scale);
                        gsap.killTweensOf(this.sos.pulse.material);
                        gsap.killTweensOf(this.sos.redMat);
                        this.sos.redMat.emissiveIntensity = 1;
                        this.sos.pulse.visible = false;
                    }
                    gsap.to(this.termGroup.scale, { x: 0, y: 0, z: 0, duration: 0.5 });
                }
                break;
            case 'CC-05':
                if (idx === 1) {
                    // FASE 1: DETECCION IA (ESCaneo)
                    if(this.vdsV.cone) { 
                        this.vdsV.cone.visible = true; 
                        this.vdsV.cone.material.opacity = 0; 
                        gsap.to(this.vdsV.cone.material, { opacity: 0.4, duration: 0.3, repeat: 3, yoyo: true }); 
                    }
                    setTimeout(() => { 
                        this.vdsHud.group.visible = true; 
                        this.stats.total++; 
                        this.updateCCOStats('DET_IA: C2', this.stats.total); 
                        // Efecto de pulso en el HUD
                        gsap.from(this.vdsHud.group.scale, { x:1.2, y:1.2, z:1.2, duration: 0.4, ease: "elastic.out" });
                    }, 500);
                } else if (idx === 2) {
                    // FASE 2: VALIDACION VDS (LAZOS)
                    this.vds.loops.forEach((l, i) => {
                        l.material.color.set(0x06b6d4);
                        gsap.to(l.material, { emissiveIntensity: 15, opacity: 1, duration: 0.2, repeat: 2, yoyo: true, delay: i*0.08 });
                    });
                    this.updateCCOStats('HYBRID_SYNC_OK', this.stats.total);
                }
                if (idx === 0) {
                    // RESET
                    this.vdsHud.group.visible = false;
                    if(this.vdsV.cone) this.vdsV.cone.visible = false;
                    this.vds.loops.forEach(l => {
                        l.material.color.set(0x10b981);
                        l.material.emissiveIntensity = 4;
                    });
                    gsap.to(this.termGroup.scale, { x: 0, y: 0, z: 0, duration: 0.5 });
                }
                if (idx === this.steps.length - 1) { 
                    this.drawReport('CC-05'); 
                    gsap.to(this.termGroup.scale, { x: 1, y: 1, z: 1, duration: 0.5 });
                }
                break;
            case 'CC-11':
                if (this.tollFoco) this.tollFoco.visible = (idx >= 1 && idx <= 3); // ACTIVAR FOCO EN VALIDACIÓN
                
                if (idx === 2 && this.pillarMat) {
                    // DETESTELLO DE EXITO PEAJE (VERDE)
                    this.pillarMat.emissive.set(0x10b981);
                    gsap.to(this.pillarMat, { emissiveIntensity: 15, duration: 0.2, repeat: 5, yoyo: true });
                } else if (idx === 0 && this.pillarMat) {
                    // RESET
                    this.pillarMat.emissive.set(0x000000);
                    this.pillarMat.emissiveIntensity = 0;
                    gsap.to(this.termGroup.scale, { x: 0, y: 0, z: 0, duration: 0.5 });
                }
                if (idx === this.steps.length - 1) { 
                    this.drawReport('CC-11'); 
                    gsap.to(this.termGroup.scale, { x: 1, y: 1, z: 1, duration: 0.5 }); 
                }
                break;
        }
    }

    drawReport(cid) {
        const ctx = this.termCtx;
        ctx.fillStyle = 'rgba(2, 6, 23, 0.95)'; ctx.fillRect(0, 0, 512, 512);
        ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 10; ctx.strokeRect(5, 5, 502, 502);
        ctx.fillStyle = '#3b82f6'; ctx.font = 'Bold 35px monospace';
        if (cid === 'CC-01') { 
            ctx.fillText('> ALERTA: PEATÓN EN VÍA', 40, 80); 
            ctx.font = '26px monospace'; 
            ctx.fillText('PRIORIDAD: VITAL (S01)', 40, 150); 
            ctx.fillStyle = '#ef4444'; ctx.fillText('EVENTO: INTRUSIÓN PR-85', 40, 310); 
        } else if (cid === 'CC-01-PATRULLA') {
            ctx.fillText('> INTERVENCIÓN POLICIAL', 40, 80);
            ctx.font = '26px monospace';
            ctx.fillText('UNIDAD: PATRULLA_45_OK', 40, 150);
            ctx.fillStyle = '#3b82f6'; ctx.fillText('STATUS: PERSECUCIÓN ACTIVA', 40, 310);
        } else if (cid === 'CC-02') {
            ctx.fillText('> ALERTA AID: INCIDENTE', 40, 80);
            ctx.font = '26px monospace';
            ctx.fillText('ESTADO: VEHÍCULO VARADO', 40, 150);
            ctx.fillStyle = '#f59e0b'; ctx.fillText('DETECCIÓN: ANALÍTICA V5', 40, 310);
        } else if (cid === 'CC-03') {
            ctx.fillText('> REPORTE PMV / VMS', 40, 80);
            ctx.font = '26px monospace';
            ctx.fillText('SISTEMA: DINÁMICO ACTIVO', 40, 150);
            ctx.fillText('MODO: GESTIÓN DE TRÁFICO', 40, 200);
        } else if (cid === 'CC-04') {
            ctx.fillText('> ALERTA SOS: LLAMADA', 40, 80);
            ctx.font = '26px monospace';
            ctx.fillText('POSTE ID: SOS-CH-85', 40, 150);
            ctx.fillStyle = '#ef4444'; ctx.fillText('ESTADO: COMUNICACIÓN OK', 40, 310);
        } else if (cid === 'CC-05') { 
            ctx.fillText('> REPORTE TRÁFICO HÍBRIDO', 40, 80); 
            ctx.font = '26px monospace'; 
            ctx.fillText(`TOTAL ACUM: ${this.stats.total}`, 40, 250); 
            ctx.fillText('VALIDACIÓN DUAL OK', 40, 310); 
        } else if (cid === 'CC-11') {
            ctx.fillText('> REPORTE PEAJE (FreeFlow)', 40, 80);
            ctx.font = '26px monospace';
            ctx.fillText('TAG ID: RFID-CON-77', 40, 150);
            ctx.fillStyle = '#10b981'; ctx.fillText('STATUS: TRANSACCIÓN OK', 40, 310);
        } else { 
            ctx.fillText(`> REPORTE COMPONENTE ${cid}`, 40, 80); 
            ctx.fillText('ESTADO: NOMINAL', 40, 150); 
        }
        ctx.fillStyle = '#3b82f6'; ctx.font = '24px monospace'; ctx.fillText('FECHA: ' + new Date().toLocaleDateString(), 40, 440);
        this.termTex.needsUpdate = true;
    }

    updateCCOStats(msg, total) {
        if (!this.hub || !this.hub.sCtx) return;
        const ctx = this.hub.sCtx; ctx.fillStyle = '#020617'; ctx.fillRect(0, 0, 256, 128);
        ctx.fillStyle = '#3b82f6'; ctx.font = 'Bold 28px monospace'; ctx.fillText(msg, 10, 40);
        ctx.font = 'Bold 42px monospace'; ctx.fillText(`TOT: ${total}`, 10, 95);
        this.hub.sTex.needsUpdate = true;
    }

    drawPMV(pmv, message) {
        if (!pmv) return;
        const ctx = pmv.ctx;
        ctx.fillStyle = '#020617'; ctx.fillRect(0, 0, 1024, 512);

        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        let color = '#3b82f6';
        if (message.includes('LLUVIA')) color = '#fbbf24';
        if (message.includes('ACCIDENTE') || message.includes('CERRADA')) color = '#ef4444'; 

        ctx.fillStyle = color;
        ctx.shadowBlur = 0; // ELIMINAMOS SHADOW PARA MÁXIMA NITIDEZ
        
        ctx.font = '900 100px Arial Black'; // ESCALA EQUILIBRADA PARA NITIDEZ Y COMPOSICIÓN
        const words = message.split(' ');
        if (words.length > 2) {
            const mid = Math.ceil(words.length / 2);
            ctx.fillText(words.slice(0, mid).join(' '), 512, 180);
            ctx.fillText(words.slice(mid).join(' '), 512, 330);
        } else {
            ctx.fillText(message, 512, 256);
        }

        pmv.tex.needsUpdate = true;
    }

    setRain(isVisible) { if (this.rain) this.rain.visible = isVisible; }

    toggleAutoplay() {
        this.isAutoplay = !this.isAutoplay;
        if (this.isAutoplay) { this.playBtn.innerHTML = `<span class="material-symbols-outlined">stop</span>`; this.runAutoplayStep(); }
        else { this.playBtn.innerHTML = `<span class="material-symbols-outlined">play_arrow</span>`; if (this.autoplayTimer) clearTimeout(this.autoplayTimer); }
    }

    triggerMonitoringSignal() {
        if (!this.ccoPulse) return;
        
        // ORIGEN DINÁMICO DESDE EL CCO (V0.8.11)
        if (this.hub && this.hub.labelGroup) {
            this.ccoPulse.position.set(this.hub.labelGroup.position.x, 0.1, this.hub.labelGroup.position.z);
        }

        this.ccoPulse.scale.set(1, 1, 1);
        this.ccoPulse.material.opacity = 1;
        gsap.to(this.ccoPulse.scale, { x: 200, y: 200, z: 200, duration: 2, ease: "power1.out" });
        gsap.to(this.ccoPulse.material, { 
            opacity: 0, duration: 2, 
            onComplete: () => {
                // Segundo pulso para el "Latido" del CCO
                this.ccoPulse.scale.set(1, 1, 1);
                this.ccoPulse.material.opacity = 1;
                gsap.to(this.ccoPulse.scale, { x: 250, y: 250, z: 250, duration: 2, ease: "power1.out" });
                gsap.to(this.ccoPulse.material, { opacity: 0, duration: 2 });
            }
        });
    }

    runAutoplayStep() {
        const nextIdx = (this.currentStepIdx + 1) % this.steps.length;
        this.autoplayTimer = setTimeout(() => { if (!this.isAutoplay) return; this.goToStep(nextIdx); this.runAutoplayStep(); }, 4000);
    }
}
