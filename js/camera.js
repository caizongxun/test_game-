/**
 * 3D Royal Piggy Farm - Camera & Movement Controls
 * Module: js/camera.js
 */

const CameraManager = {
    camera: null,
    controls: null,
    keyState: {},
    panSpeed: 14.0,
    targetFocusPos: null,
    isFollowingPig: false,

    init(cam, ctrl) {
        this.camera = cam;
        this.controls = ctrl;

        if (this.controls) {
            this.controls.enablePan = true;
            this.controls.screenSpacePanning = true;
            this.controls.panSpeed = 1.2;
            this.controls.keyPanSpeed = 14.0;
        }

        // Keyboard listeners for WASD / Arrow camera panning
        window.addEventListener('keydown', (e) => {
            // Do not capture if user is typing in an input or textarea
            const tag = (document.activeElement && document.activeElement.tagName) || '';
            if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

            const code = e.code;
            // Arrow keys only for camera panning; WASD is strictly reserved for Pixel Battle game
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(code)) {
                this.keyState[code] = true;
                this.isFollowingPig = false;
            }
        });

        window.addEventListener('keyup', (e) => {
            const code = e.code;
            if (this.keyState[code]) {
                delete this.keyState[code];
            }
        });
    },

    pan(dx, dz) {
        if (!this.camera || !this.controls) return;
        this.isFollowingPig = false;

        // Get camera forward & right vectors on XZ plane
        const forward = new THREE.Vector3();
        this.camera.getWorldDirection(forward);
        forward.y = 0;
        forward.normalize();

        const right = new THREE.Vector3();
        right.crossVectors(this.camera.up, forward).normalize(); // right direction

        const moveVec = new THREE.Vector3();
        moveVec.addScaledVector(forward, dz);
        moveVec.addScaledVector(right, -dx);

        this.controls.target.add(moveVec);
        this.camera.position.add(moveVec);
    },

    focusOnPosition(x, y, z, smooth = true) {
        if (!this.controls) return;
        if (!smooth) {
            const offset = new THREE.Vector3().subVectors(this.camera.position, this.controls.target);
            this.controls.target.set(x, y, z);
            this.camera.position.copy(this.controls.target).add(offset);
            return;
        }
        this.targetFocusPos = new THREE.Vector3(x, y, z);
    },

    focusActivePig() {
        if (typeof PigManager !== 'undefined') {
            const activeInstance = PigManager.getActivePigInstance();
            if (activeInstance && activeInstance.group) {
                const pos = activeInstance.group.position;
                this.focusOnPosition(pos.x, pos.y + 1.2, pos.z, true);
                this.isFollowingPig = true;
                return;
            }
        }
        this.focusOnPosition(0, 1.3, 0.5, true);
    },

    resetOverview() {
        this.isFollowingPig = false;
        this.targetFocusPos = new THREE.Vector3(0, 1.3, 0.5);
        if (this.camera) {
            // Smoothly lerp camera position to default
            this.targetCamPos = new THREE.Vector3(0, 13.5, 20.5);
        }
    },

    update(dt) {
        if (!this.camera || !this.controls) return;

        // Process Arrow Keyboard Pan (WASD reserved for pixel brawler)
        let dx = 0;
        let dz = 0;
        if (this.keyState['ArrowUp']) dz += 1;
        if (this.keyState['ArrowDown']) dz -= 1;
        if (this.keyState['ArrowLeft']) dx -= 1;
        if (this.keyState['ArrowRight']) dx += 1;

        if (dx !== 0 || dz !== 0) {
            const factor = this.panSpeed * dt;
            this.pan(dx * factor, dz * factor);
        }

        // Following active pig
        if (this.isFollowingPig && typeof PigManager !== 'undefined') {
            const inst = PigManager.getActivePigInstance();
            if (inst && inst.group) {
                const p = inst.group.position;
                this.controls.target.lerp(new THREE.Vector3(p.x, p.y + 1.2, p.z), 4.5 * dt);
            }
        } else if (this.targetFocusPos) {
            this.controls.target.lerp(this.targetFocusPos, 5.0 * dt);
            if (this.targetCamPos) {
                this.camera.position.lerp(this.targetCamPos, 5.0 * dt);
                if (this.camera.position.distanceTo(this.targetCamPos) < 0.1) {
                    this.targetCamPos = null;
                }
            }
            if (this.controls.target.distanceTo(this.targetFocusPos) < 0.05) {
                this.targetFocusPos = null;
            }
        }
    }
};
