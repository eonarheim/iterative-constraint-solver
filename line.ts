import { Circle } from "./circle";
import { Collider } from "./collider";
import { Contact } from "./contact";
import { assert } from "./math";
import { ContactInfo } from "./separating-axis";
import { Vector } from "./vector";

export class Line extends Collider {
    static = true;
    constructor(public begin: Vector, public end: Vector) {
        super();
        this.xf.pos = begin.add(end).scale(.5);
    }

    getSeparation(other: Circle) {
        // center of the circle
        const cc = other.xf.pos;
        // vector in the direction of the edge
        const e = this.end.sub(this.begin);
        // amount of overlap with the circle's center along the edge direction
        const u = e.dot(this.end.sub(cc));
        const v = e.dot(cc.sub(this.begin));

        const den = e.dot(e);
        const pointOnEdge = this.begin
            .scale(u)
            .add(this.end.scale(v))
            .scale(1 / den);
        const d = cc.sub(pointOnEdge);

        const dd = d.dot(d);

        const sep = -Math.abs(other.radius - Math.sqrt(dd));
        
        return sep;
    }
    
    collide(other: Circle | Line, contact?: Contact): Contact | null {
        if (other instanceof Circle) {

            // center of the circle
            const cc = other.xf.pos;
            // vector in the direction of the edge
            const e = this.end.sub(this.begin);
            
            // amount of overlap with the circle's center along the edge direction
            const u = e.dot(this.end.sub(cc));
            const v = e.dot(cc.sub(this.begin));
            
            // Potential region A collision (circle is on the left side of the edge, before the beginning)
            if (v <= 0) {
                const da = this.begin.sub(cc);
                const dda = da.dot(da); // quick and dirty way of calc'n distance in r^2 terms saves some sqrts
                // save some sqrts
                if (dda > other.radius * other.radius) {
                    return null; // no collision
                }
                // RETURN CONTACT
                let separation = da.normalize().scale(other.radius - Math.sqrt(dda));
                let normal = da.normalize();
                let info: ContactInfo = {
                    collider: other,
                    separation: other.radius - Math.sqrt(dda),
                    axis: normal,
                    point: this.begin
                }
                return new Contact(other, this, normal, normal.perpendicular(), info, [this.begin]);
            }
            
            // Potential region B collision (circle is on the right side of the edge, after the end)
            if (u <= 0) {
                const db = this.end.sub(cc);
                const ddb = db.dot(db);
                if (ddb > other.radius * other.radius) {
                    return null;
                }
                // RETURN CONTACT
                let separation = db.normalize().scale(other.radius - Math.sqrt(ddb));
                let normal = db.normalize();
                let info: ContactInfo = {
                    collider: other,
                    separation: other.radius - Math.sqrt(ddb),
                    axis: normal,
                    point: this.end
                }
                return new Contact(other, this, normal, normal.perpendicular(), info, [this.end]);
            }

            // Otherwise potential region AB collision (circle is in the middle of the edge between the beginning and end)
            const den = e.dot(e);
            const pointOnEdge = this.begin
                .scale(u)
                .add(this.end.scale(v))
                .scale(1 / den);
            const d = cc.sub(pointOnEdge);

            const dd = d.dot(d);
            if (dd > other.radius * other.radius) {
                return null; // no collision
            }

            let n = e.perpendicular();
            // flip correct direction
            if (n.dot(cc.sub(this.begin)) < 0) {
                n.x = -n.x;
                n.y = -n.y;
            }

            n = n.normalize();

            const mvt = n.scale(Math.abs(other.radius - Math.sqrt(dd)));

            let info: ContactInfo = {
                collider: other,
                separation: other.radius - Math.sqrt(dd),
                axis: n,
                point: this.begin
            }
            // RETURN CONTACT
            return new Contact(this, other, n, n.perpendicular(), info, [pointOnEdge]);
        }

        return null;
    }

    draw(ctx: CanvasRenderingContext2D, flags: any) {
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = 'green'
        ctx.moveTo(this.begin.x, this.begin.y);
        ctx.lineTo(this.end.x, this.end.y);
        ctx.closePath();
        ctx.stroke();
        ctx.restore();

        if (flags["Debug"]) {
            ctx.fillStyle = 'yellow';
            ctx.fillText('id: ' + this.id, this.xf.pos.x, this.xf.pos.y);
        }
    }
}