    import * as THREE from 'three';
    import * as CANNON from 'cannon';

    export class Player {
        constructor(scene, world) {
            this.scene = scene;
            this.world = world;

            // Three.js setup
            const geometry = new THREE.BoxGeometry(1, 1, 1);
            const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
            this.mesh = new THREE.Mesh(geometry, material);
            scene.add(this.mesh);

            // Cannon.js setup
            const shape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));
            this.body = new CANNON.Body({
                mass: 1,
                position: new CANNON.Vec3(0, 0, 0),
                shape: shape
            });
            world.addBody(this.body);

            document.addEventListener('keydown', this.onKeyDown);
            document.addEventListener('keyup', this.onKeyUp);
        }

        onKeyDown = (event) => {
            switch (event.keyCode) {
                case 68: //d right
                    this.body.velocity.x = 5;
                    break;
                case 83: //s backwards
                    this.body.velocity.z = 5;
                    break;
                case 65: //a left
                    this.body.velocity.x = -5;
                    break;
                case 87: //w forwards
                    this.body.velocity.z = -5;
                    break;
                case 32: //space jump
                    this.body.velocity.y = 5;
                    break;
            }
        }

        onKeyUp = (event) => {
            switch (event.keyCode) {
                case 68:
                    this.body.velocity.x = 0;
                    break;
                case 83:
                    this.body.velocity.z = 0;
                    break;
                case 65:
                    this.body.velocity.x = 0;
                    break;
                case 87:
                    this.body.velocity.z = 0;
                    break;
                case 32:
                    this.body.velocity.y = 0;
                    break;
            }
        }

        update() {
            // Sync Three.js mesh with Cannon.js body
            this.mesh.position.copy(this.body.position);
            this.mesh.quaternion.copy(this.body.quaternion);
        }
    }
