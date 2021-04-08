import { Box } from "./box";
import { Collider } from "./collider";
import { Contact } from "./contact";
import { Line } from "./line";
import { SeparatingAxis } from "./separating-axis";
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
    collide(other: Circle | Line | Box, contact?: Contact): Contact | null {
        if (other instanceof Circle) {
            return SeparatingAxis.findCircleCircleContact(this, other);
        }

        if (other instanceof Box) {
            return SeparatingAxis.findCircleBoxContact(this, other)
        }

        if (other instanceof Line) {
            return other.collide(this);
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

    /**
     * Find the point on the shape furthest in the direction specified
     */
    getFurthestPoint(direction: Vector): Vector {
        const dir = direction.normalize();
        return this.xf.pos.add(dir.scale(this.radius));
    }

    getFurthestLocalPoint(direction: Vector): Vector {
        const dir = direction.normalize();
        return dir.scale(this.radius);
    }

    draw(ctx: CanvasRenderingContext2D, flags?: any) {
        ctx.beginPath();
        ctx.fillStyle = 'blue';
        ctx.arc(this.xf.pos.x, this.xf.pos.y, this.radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();

        if (flags["Debug"]) {
            ctx.fillStyle = 'yellow';
            ctx.fillText('id: ' + this.id, this.xf.pos.x, this.xf.pos.y);
        }

        ctx.save();
        ctx.translate(this.xf.pos.x, this.xf.pos.y);
        ctx.rotate(this.xf.rotation);
        ctx.beginPath()
        ctx.strokeStyle = 'black';
        ctx.moveTo(0, 0);
        ctx.lineTo(0 + this.radius, 0);
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
    }
}