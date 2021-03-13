import { Collider } from "./collider";
import { Contact } from "./contact";
import { Line } from "./line";
import { Motion, Transform } from "./transform";
import { Vector } from "./vector";

export class Circle extends Collider {
    constructor(public radius: number, pos: Vector) {
        super();
        this.xf.pos = pos;
        this.mass = radius;
    }

    get inverseMass() {
        return this.static ? 0 : 1 / this.mass;
    }

    get inertia() {
        return (this.mass * this.radius * this.radius) / 2;
    }

    get inverseInertia() {
        return this.static ? 0 : 1 / this.inertia;
    }

    /**
     * Returns a contact in the direction from `this` -> `other`
     * @param other 
     * @returns 
     */
    collide(other: Circle | Line, contact?: Contact): Contact | null {
        if (other instanceof Circle) {
            const combinedRadius = other.radius + this.radius;
            const distance = other.xf.pos.distance(this.xf.pos);
            if (distance < combinedRadius) {
                const separation = combinedRadius - distance;
                // normal points from A -> B
                const direction = other.xf.pos.sub(this.xf.pos);
                const normal = direction.normalize();
                const tangent = normal.perpendicular();
                const point = this.xf.pos.add(normal.scale(this.radius));
                if (contact) {
                    contact.bodyA = this;
                    contact.bodyB = other;
                    contact.normal = normal;
                    contact.tangent = tangent;
                    contact.updatePoints([point]);
                    
                    return contact;

                } else {
                    return new Contact(this, other, normal, tangent).setPoints([point]);
                }
            }
            return null;
        }

        if (other instanceof Line) {
            // flip so this -> other
            const c = other.collide(this, contact) ?? null;
            return c;
        }

        return null;
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
}