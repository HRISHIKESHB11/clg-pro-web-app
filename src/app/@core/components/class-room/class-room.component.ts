import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import * as THREE from 'three';

@Component({
  selector: 'app-class-room',
  templateUrl: './class-room.component.html',
  styleUrls: ['./class-room.component.scss']
})
export class ClassRoomComponent {
  @ViewChild('canvasContainer', { static: true }) canvasContainer!: ElementRef;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private character!: THREE.Group;
  private classroom!: THREE.Group;
  private tables: THREE.Group[] = [];
  private membersCount: number = 6; // Number of meeting members
  private keys:any = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false };

  ngOnInit(): void {
    this.initScene();
    this.addLights();
    this.createClassroom();
    this.createTablesAndChairs();
    this.createCharacter();
    this.animate();
  }

  private initScene(): void {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xa0a0a0);

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 8, 12);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.canvasContainer.nativeElement.appendChild(this.renderer.domElement);
  }

  private addLights(): void {
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(10, 10, 10);
    this.scene.add(light);

    const ambientLight = new THREE.AmbientLight(0x404040);
    this.scene.add(ambientLight);
  }

  private createClassroom(): void {
    this.classroom = new THREE.Group();

    // Floor
    const floorGeometry = new THREE.PlaneGeometry(20, 20);
    const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    this.classroom.add(floor);

    // Walls
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const wallGeometry = new THREE.BoxGeometry(20, 10, 0.5);

    const backWall = new THREE.Mesh(wallGeometry, wallMaterial);
    backWall.position.set(0, 5, -10);
    this.classroom.add(backWall);

    const leftWall = new THREE.Mesh(wallGeometry, wallMaterial);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-10, 5, 0);
    this.classroom.add(leftWall);

    const rightWall = new THREE.Mesh(wallGeometry, wallMaterial);
    rightWall.rotation.y = Math.PI / 2;
    rightWall.position.set(10, 5, 0);
    this.classroom.add(rightWall);

    this.scene.add(this.classroom);
  }

  private createTablesAndChairs(): void {
    const tableMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    const chairMaterial = new THREE.MeshStandardMaterial({ color: 0x556B2F });

    const rows = Math.ceil(this.membersCount / 2); // Arrange in pairs
    let index = 0;

    for (let row = 0; row < rows; row++) {
      const tableGroup = new THREE.Group();

      // Table
      const tableGeometry = new THREE.BoxGeometry(2, 0.2, 1);
      const table = new THREE.Mesh(tableGeometry, tableMaterial);
      table.position.set(0, 1, 0);
      tableGroup.add(table);

      // Chairs
      for (let i = 0; i < 2 && index < this.membersCount; i++, index++) {
        const chairGeometry = new THREE.BoxGeometry(0.5, 1, 0.5);
        const chair = new THREE.Mesh(chairGeometry, chairMaterial);
        chair.position.set(i === 0 ? -1 : 1, 0.5, 0);
        tableGroup.add(chair);
      }

      // Position tables in a grid layout
      tableGroup.position.set(-4 + row * 4, 0, -4 + row * 2);
      this.scene.add(tableGroup);
      this.tables.push(tableGroup);
    }
  }

  private createCharacter(): void {
    this.character = new THREE.Group();

    // Body
    const bodyGeometry = new THREE.BoxGeometry(0.8, 1.5, 0.5);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.set(0, 1, 0);
    this.character.add(body);

    // Head
    const headGeometry = new THREE.SphereGeometry(0.4);
    const headMaterial = new THREE.MeshStandardMaterial({ color: 0xffcc99 });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.set(0, 2, 0);
    this.character.add(head);

    this.character.position.set(0, 0, 5);
    this.scene.add(this.character);
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (this.keys.hasOwnProperty(event.key)) {
      this.keys[event.key] = true;
    }
  }

  @HostListener('window:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent): void {
    if (this.keys.hasOwnProperty(event.key)) {
      this.keys[event.key] = false;
    }
  }

  private moveCharacter(): void {
    if (this.keys.ArrowUp) this.character.position.z -= 0.1;
    if (this.keys.ArrowDown) this.character.position.z += 0.1;
    if (this.keys.ArrowLeft) this.character.position.x -= 0.1;
    if (this.keys.ArrowRight) this.character.position.x += 0.1;
  }

  private animate = (): void => {
    requestAnimationFrame(this.animate);
    this.moveCharacter();
    this.renderer.render(this.scene, this.camera);
  };
}
