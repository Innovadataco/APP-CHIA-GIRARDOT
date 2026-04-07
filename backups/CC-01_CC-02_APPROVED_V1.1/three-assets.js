/**
 * @file three-assets.js
 * @description Factory for ITS Digital Twin 3D Assets
 */

const ThreeAssets = {
    createRoad: (scene) => {
        const grid = new THREE.GridHelper(800, 100, 0x1e293b, 0x0f172a);
        grid.position.y = -0.1;
        scene.add(grid);

        const road = new THREE.Mesh(
            new THREE.BoxGeometry(16, 0.2, 800),
            new THREE.MeshStandardMaterial({ color: 0x0f172a })
        );
        road.position.z = 0;
        scene.add(road);
    },

    createVehicle: (color = 0xef4444) => {
        const carGroup = new THREE.Group();
        const cBody = new THREE.Mesh(new THREE.BoxGeometry(3, 1.2, 5.5), new THREE.MeshStandardMaterial({ color }));
        const cRoof = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.8, 3), new THREE.MeshStandardMaterial({ color: 0x818cf8, transparent: true, opacity: 0.6 }));
        cRoof.position.set(0, 1, -0.4);
        carGroup.add(cBody, cRoof);
        carGroup.position.set(0, 0.7, 50);
        return { group: carGroup };
    },

    createPedestrian: () => {
        const pGroup = new THREE.Group();
        const pMat = new THREE.MeshStandardMaterial({ color: 0xff4400, emissive: 0xff4400, emissiveIntensity: 0.8 });
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 16), pMat); head.position.y = 2.4;
        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 1.8, 16), pMat); body.position.y = 1.3;
        pGroup.add(head, body);
        pGroup.position.set(-6, 0, 40);
        return pGroup;
    },

    createShockwave: () => {
        const sGeo = new THREE.RingGeometry(0.1, 0.4, 32); sGeo.rotateX(-Math.PI / 2);
        const sMat = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0 });
        const shock = new THREE.Mesh(sGeo, sMat);
        shock.position.set(0, 0.1, 40);
        return shock;
    },

    createCCTVSystem: (scene, zPos = 0) => {
        const poleGroup = new THREE.Group();
        const poleMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.6, 22, 16), poleMat);
        pole.position.y = 11;
        const arm = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 4), poleMat); arm.position.set(0, 20.5, 1.5);
        const cctvCam = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 1.2), new THREE.MeshStandardMaterial({ color: 0x1e293b }));
        cctvCam.position.set(0, 20, 3);
        poleGroup.add(pole, arm, cctvCam);
        poleGroup.position.set(-9, 0, zPos);
        scene.add(poleGroup);

        const fGeo = new THREE.ConeGeometry(12, 45, 32); 
        fGeo.rotateX(-Math.PI / 2); // Tip goes to -Z, Base to +Z
        fGeo.translate(0, 0, 45 / 2); // Shift so tip is at origin (0,0,0) and base extends along +Z
        const fMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.15, side: THREE.DoubleSide });
        const frustum = new THREE.Mesh(fGeo, fMat);
        frustum.position.set(-9, 20, 3 + zPos); // Exact global position of the camera lens
        frustum.lookAt(0, 0, 50 + zPos);
        scene.add(frustum);

        return { cam: cctvCam, frustum };
    },

    createCCOHub: (scene) => {
        const hubGroup = new THREE.Group();
        const gMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.2 });
        const eMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, emissive: 0x3b82f6, emissiveIntensity: 2 });
        const t1 = new THREE.Mesh(new THREE.BoxGeometry(8, 12, 8), gMat);
        const t1C = new THREE.Mesh(new THREE.BoxGeometry(3, 12, 3), eMat);
        const t2 = new THREE.Mesh(new THREE.BoxGeometry(6, 14, 6), gMat); t2.position.y = 10;
        const t2C = new THREE.Mesh(new THREE.BoxGeometry(2, 14, 2), eMat); t2C.position.y = 10;
        hubGroup.add(t1, t1C, t2, t2C);
        hubGroup.position.set(24, 6, -70);
        scene.add(hubGroup);

        const labelGroup = new THREE.Group();
        const ring = new THREE.Mesh(new THREE.TorusGeometry(6, 0.1, 16, 100), eMat);
        ring.rotation.x = Math.PI / 2;
        const canv = document.createElement('canvas'); const ct = canv.getContext('2d');
        canv.width = 512; canv.height = 128;
        ct.fillStyle = '#3b82f6'; ct.font = 'Bold 110px Syne'; ct.textAlign = 'center'; ct.fillText('CCO', 256, 100);
        const lSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canv) }));
        lSprite.scale.set(8, 2, 1);
        labelGroup.add(ring, lSprite);
        labelGroup.position.set(24, 28, -70);
        scene.add(labelGroup);

        // Dynamic Stats Sprite
        const sCanv = document.createElement('canvas'); sCanv.width = 256; sCanv.height = 128;
        const sCtx = sCanv.getContext('2d');
        sCtx.fillStyle = '#3b82f6'; sCtx.font = 'Bold 32px monospace';
        sCtx.fillText('CONTEO VDS', 10, 40);
        sCtx.font = 'Bold 48px monospace';
        sCtx.fillText('TOT: 1420', 10, 90);
        const sTex = new THREE.CanvasTexture(sCanv);
        const sSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: sTex }));
        sSprite.scale.set(6, 3, 1);
        sSprite.position.set(24, 22, -70);
        scene.add(sSprite);

        return { eMat, labelGroup, sSprite, sCtx, sTex };
    },

    createTollStructure: (scene) => {
        const pMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
        const pGroup = new THREE.Group();
        const p1 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 14, 0.8), pMat); p1.position.set(-6, 7, 0);
        const p2 = new THREE.Mesh(new THREE.BoxGeometry(1, 14, 1), pMat); p2.position.set(6, 7, 0);
        const beam = new THREE.Mesh(new THREE.BoxGeometry(14, 0.8, 1.5), pMat); beam.position.set(0, 13.5, 0);
        pGroup.add(p1, p2, beam);
        scene.add(pGroup);
        return pMat;
    },

    createPMVSystem: (scene, zPos = 20, color = 0x00ff88) => {
        const group = new THREE.Group();
        const poleMat = new THREE.MeshStandardMaterial({ color: 0x475569 });

        // Support pole
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.5, 18, 12), poleMat);
        pole.position.set(0, 9, 0);
        group.add(pole);

        // Panel frame
        const frameMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, emissive: 0x0f172a, emissiveIntensity: 1 });
        const frame = new THREE.Mesh(new THREE.BoxGeometry(9, 6, 0.3), frameMat);
        frame.position.set(0, 19, 0);
        group.add(frame);

        // LED border glow
        const borderMat = new THREE.MeshStandardMaterial({ color: color, emissive: color, emissiveIntensity: 3, transparent: true, opacity: 0.9 });
        const border = new THREE.Mesh(new THREE.BoxGeometry(9.4, 6.4, 0.1), borderMat);
        border.position.set(0, 19, -0.2);
        group.add(border);

        // Canvas LED display (High Resolution)
        const canvas = document.createElement('canvas');
        canvas.width = 1024; canvas.height = 512;
        const ctx = canvas.getContext('2d');
        const tex = new THREE.CanvasTexture(canvas);
        const screen = new THREE.Mesh(
            new THREE.PlaneGeometry(8.5, 5.5),
            new THREE.MeshStandardMaterial({ map: tex })
        );
        screen.position.set(0, 19, 0.2);
        group.add(screen);

        group.position.set(-2, 0, zPos);
        scene.add(group);

        return { group, canvas, ctx, tex, borderMat };
    },

    createAIDHUD: () => {
        const group = new THREE.Group();
        
        // Bounding Box edges (Cyber look)
        const edges = new THREE.EdgesGeometry(new THREE.BoxGeometry(4.5, 3.5, 7));
        const hudMat = new THREE.LineBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.8, linewidth: 2 });
        const box = new THREE.LineSegments(edges, hudMat);
        box.position.y = 1.75;
        group.add(box);

        // Tech Ground Ring (Scanning effect)
        const ringGeo = new THREE.RingGeometry(4, 4.5, 32);
        ringGeo.rotateX(-Math.PI / 2);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.5, side: THREE.DoubleSide });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.y = 0.1;
        group.add(ring);

        // A simple sprite marker for classification details
        const canv = document.createElement('canvas'); canv.width = 256; canv.height = 64;
        const ct = canv.getContext('2d');
        ct.fillStyle = '#06b6d4'; ct.fillRect(0,0,256,64);
        ct.fillStyle = '#000000'; ct.font = 'Bold 30px monospace'; ct.fillText('ID: OBJ-88', 10, 40);
        const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canv) }));
        sprite.scale.set(4, 1, 1);
        sprite.position.y = 4.5;
        group.add(sprite);

        return { group, hudMat, ringMat, sprite, ring };
    },

    createRain: (count = 5000) => {
        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(count * 3);
        const vel = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 200;
            pos[i * 3 + 1] = Math.random() * 100;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 600;
            vel[i] = 1.5 + Math.random() * 2.5;
        }

        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        const mat = new THREE.PointsMaterial({
            color: 0x88aaff,
            size: 0.15,
            transparent: true,
            opacity: 0.6,
            depthWrite: false
        });

        const points = new THREE.Points(geo, mat);
        points.userData.velocities = vel;
        points.visible = false;
        return points;
    },

    createSOSCallbox: (scene, zPos = 0) => {
        const group = new THREE.Group();
        const orangeMat = new THREE.MeshStandardMaterial({ color: 0xf97316 }); // Orange
        const darkMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
        const redMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 1 });

        // Post body
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.8, 4.5, 0.6), orangeMat);
        post.position.y = 2.25;
        group.add(post);

        // Solar panel (Top)
        const panel = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.05, 0.8), darkMat);
        panel.position.y = 4.5;
        panel.rotation.x = -Math.PI / 6;
        group.add(panel);

        // Call Button (Front)
        const button = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.2, 16), redMat);
        button.rotation.x = Math.PI / 2;
        button.position.set(0, 3, 0.35);
        group.add(button);

        // White SOS label area
        const labelArea = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.6), new THREE.MeshBasicMaterial({ color: 0xffffff }));
        labelArea.position.set(0, 3.8, 0.31);
        group.add(labelArea);

        // Blue pulses for "active call"
        const pulseGeo = new THREE.TorusGeometry(1, 0.05, 16, 32); pulseGeo.rotateX(Math.PI/2);
        const pulse = new THREE.Mesh(pulseGeo, new THREE.MeshBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0 }));
        pulse.position.y = 3;
        group.add(pulse);

        group.position.set(-6.5, 0, zPos);
        scene.add(group);

        return { group, button, redMat, pulse };
    },
    
    createVDSSystem: (scene, zPos = 0) => {
        const group = new THREE.Group();
        const metalMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
        const loopMat = new THREE.MeshStandardMaterial({ 
            color: 0x06b6d4, 
            emissive: 0x06b6d4, 
            emissiveIntensity: 0.5, 
            transparent: true, 
            opacity: 0.4 
        });

        // 1. Processing Cabinet
        const cabinet = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.8, 0.8), metalMat);
        cabinet.position.set(-7.5, 0.9, zPos);
        group.add(cabinet);
        
        const door = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 1.4), new THREE.MeshStandardMaterial({ color: 0x334155 }));
        door.position.set(-6.89, 0.9, zPos);
        door.rotation.y = Math.PI / 2;
        group.add(door);

        // 2. Ground Loops (2 per lane for speed calculation)
        const loopGeo = new THREE.PlaneGeometry(3.5, 1.5);
        loopGeo.rotateX(-Math.PI / 2);

        const loop1 = new THREE.Mesh(loopGeo, loopMat.clone());
        loop1.position.set(-4, 0.05, zPos - 2);
        
        const loop2 = new THREE.Mesh(loopGeo, loopMat.clone());
        loop2.position.set(-4, 0.05, zPos + 2);
        
        const loop3 = new THREE.Mesh(loopGeo, loopMat.clone());
        loop3.position.set(4, 0.05, zPos - 2);
        
        const loop4 = new THREE.Mesh(loopGeo, loopMat.clone());
        loop4.position.set(4, 0.05, zPos + 2);

        group.add(loop1, loop2, loop3, loop4);
        scene.add(group);

        return { group, loops: [loop1, loop2, loop3, loop4] };
    },

    createAnalyticsCamera: (scene, zPos = 0) => {
        const group = new THREE.Group();
        const poleMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8 });
        
        // Specialized housing for AI Camera
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 15, 16), poleMat);
        pole.position.y = 7.5;
        const arm = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 4), poleMat);
        arm.position.set(0, 14, 1.5);
        
        const camBody = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 2), new THREE.MeshStandardMaterial({ color: 0x0f172a }));
        camBody.position.set(0, 13.8, 3.5);
        camBody.rotation.x = Math.PI / 10;
        
        // Front Emissive "Lens" Sensor
        const lens = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.6), new THREE.MeshStandardMaterial({ 
            color: 0x06b6d4, emissive: 0x06b6d4, emissiveIntensity: 5 
        }));
        lens.position.set(0, 13.5, 4.51);
        lens.rotation.x = Math.PI / 10;
        
        // Blue LED indicator (Analysis Active)
        const led = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), new THREE.MeshStandardMaterial({ color: 0x3b82f6, emissive: 0x3b82f6, emissiveIntensity: 3 }));
        led.position.set(0.6, 13.6, 4.5);
        
        group.add(pole, arm, camBody, lens, led);
        group.position.set(-12, 0, zPos);
        scene.add(group);

        // Volumetric Detection Cone (Pyramid)
        const coneGeo = new THREE.CylinderGeometry(0.2, 12, 35, 4, 1, true); // Pyramid shape (4 sides)
        coneGeo.rotateX(Math.PI / 2);
        const coneMat = new THREE.MeshStandardMaterial({ 
            color: 0x3b82f6, transparent: true, opacity: 0.1, side: THREE.DoubleSide 
        });
        const cone = new THREE.Mesh(coneGeo, coneMat);
        cone.position.set(12, 13, -15); // Adjust to project from lens to road
        cone.rotation.y = -Math.PI / 10;
        cone.rotation.x = Math.PI / 6;
        
        group.add(cone);

        return { group, camBody, cone };
    },

    createVehicleHUD: () => {
        const group = new THREE.Group();
        const lineMat = new THREE.LineBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.8 });
        
        // 3D Bounding Box Wireframe
        const boxGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(3.5, 2.5, 6));
        const box = new THREE.LineSegments(boxGeo, lineMat);
        box.position.y = 1.25;
        
        // AI Label "TARGET"
        const canv = document.createElement('canvas'); canv.width = 128; canv.height = 32;
        const ctx = canv.getContext('2d');
        ctx.fillStyle = '#3b82f6'; ctx.font = 'Bold 18px monospace'; ctx.fillText('OBJ_102', 10, 24);
        const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canv) }));
        sprite.scale.set(4, 1, 1);
        sprite.position.y = 3.5;
        
        group.add(box, sprite);
        return { group, box, sprite };
    }
};
