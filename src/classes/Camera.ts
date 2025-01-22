import { ICamera } from "@/interfaces/EngineInterfaces";
import { mat4, vec3 } from "gl-matrix";

export class Camera implements ICamera {
  private projectionMatrix: mat4;
  private viewMatrix: mat4;
  private position: vec3;
  private target: vec3;
  private up: vec3;
  private fov: number; // Field of View in degrees (for perspective mode)
  private aspect: number; // Aspect ratio
  private near: number; // Near clipping plane
  private far: number; // Far clipping plane
  private mode: "perspective" | "orthographic";

  constructor(
    mode: "perspective" | "orthographic" = "perspective",
    position: vec3 = vec3.fromValues(0, 0, 5),
    target: vec3 = vec3.fromValues(0, 0, 0),
    up: vec3 = vec3.fromValues(0, 1, 0),
    fov: number = 90,
    aspect: number = 1,
    near: number = 0.1,
    far: number = 100
  ) {
    this.mode = mode;
    this.position = vec3.clone(position);
    this.target = vec3.clone(target);
    this.up = vec3.clone(up);
    this.fov = fov;
    this.aspect = aspect;
    this.near = near;
    this.far = far;

    this.projectionMatrix = mat4.create();
    this.viewMatrix = mat4.create();

    this.updateProjectionMatrix();
    this.updateViewMatrix();
  }

  // Update the projection matrix based on the camera mode
  private updateProjectionMatrix(): void {
    if (this.mode === "perspective") {
      mat4.perspective(
        this.projectionMatrix,
        (this.fov * Math.PI) / 180, // Convert FOV to radians
        this.aspect,
        this.near,
        this.far
      );
    } else if (this.mode === "orthographic") {
      const orthoSize = 10; // Fixed orthographic size
      mat4.ortho(
        this.projectionMatrix,
        -orthoSize * this.aspect,
        orthoSize * this.aspect,
        -orthoSize,
        orthoSize,
        this.near,
        this.far
      );
    }
  }

  // Update the view matrix based on the position, target, and up vector
  private updateViewMatrix(): void {
    mat4.lookAt(this.viewMatrix, this.position, this.target, this.up);
  }

  // Change the camera's mode and update the projection matrix
  setMode(mode: "perspective" | "orthographic"): void {
    this.mode = mode;
    this.updateProjectionMatrix();
  }

  // Update the aspect ratio (e.g., when resizing the window)
  setAspect(aspect: number): void {
    this.aspect = aspect;
    this.updateProjectionMatrix();
  }

  // Set the camera position
  setPosition(position: vec3): void {
    vec3.copy(this.position, position);
    this.updateViewMatrix();
  }

  // Set the camera target
  setTarget(target: vec3): void {
    vec3.copy(this.target, target);
    this.updateViewMatrix();
  }

  // Set the Field of View (for perspective mode only)
  setFov(fov: number): void {
    this.fov = fov;
    this.updateProjectionMatrix();
  }

  // Get the projection matrix
  getProjectionMatrix(): mat4 {
    return this.projectionMatrix;
  }

  // Get the view matrix
  getViewMatrix(): mat4 {
    return this.viewMatrix;
  }

  // Get the combined view-projection matrix
  getViewProjectionMatrix(): mat4 {
    const viewProjectionMatrix = mat4.create();
    mat4.multiply(viewProjectionMatrix, this.projectionMatrix, this.viewMatrix);
    return viewProjectionMatrix;
  }

  // Rotate the camera around the target
  public rotate(axis: vec3, angle: number): void {
    const rotationMatrix = mat4.create();
    mat4.rotate(rotationMatrix, mat4.create(), angle, axis);

    const direction = vec3.create();
    vec3.subtract(direction, this.position, this.target);

    const rotatedDirection = vec3.create();
    vec3.transformMat4(rotatedDirection, direction, rotationMatrix);

    vec3.add(this.position, this.target, rotatedDirection);

    this.updateViewMatrix();
  }
}
