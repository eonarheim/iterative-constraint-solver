import { Contact } from "./contact";
import { assert } from "./math";
import { Motion, Transform } from "./transform";
import { Vector } from "./vector";

export abstract class Collider {
    private static _ID = 0;
    public id = Collider._ID++;
    public static = false;
    public mass = 1;
    
    public bounciness = 0.1;
    public friction = .99;
    public xf = new Transform();
    public m = new Motion();

    get inverseMass() {
        return this.static ? 0 : 1 / this.mass;
    }

    get inertia() {
        return this.mass;
    }

    get inverseInertia() {
        return this.static ? 0 : 1 / this.inertia;
    }

    /**
     * Apply impulse at a point
     * @param point 
     * @param impulse 
     * @returns 
     */
    applyImpulse(point: Vector, impulse: Vector) {
        if (this.static) {
            return;
        }

        const distanceFromCenter = point.sub(this.xf.pos);

        this.m.vel = this.m.vel.add(impulse.scale(this.inverseMass));
        this.m.angularVelocity += this.inverseInertia * distanceFromCenter.cross(impulse);
    }

    applyLinearImpulse(impulse: Vector) {
        if (this.static) {
            return;
        }

        this.m.vel = this.m.vel.add(impulse.scale(this.inverseMass));
    }

    applyAngularImpulse(point: Vector, impulse: Vector) {
        if (this.static) {
            return;
        }

        const distanceFromCenter = point.sub(this.xf.pos);

        this.m.angularVelocity += this.inverseInertia * distanceFromCenter.cross(impulse);
    }

    abstract collide(collider: Collider, contact?: Contact): Contact | null ;
}