import { Circle } from "./circle";
import { Collider } from "./collider";
import { Line } from "./line";
import { assert } from "./math";
import { cross, Vector } from "./vector";

/**
 * Holds information about contact points, meant to be reused over multiple frames of contact
 */
export class ContactPoint {

    constructor(public point: Vector, public contact: Contact) {
        this.update();
     }

    update() {
        const bodyA = this.contact.bodyA;
        const bodyB = this.contact.bodyB;
        const normal = this.contact.normal;
        const tangent = this.contact.tangent;

        this.aToContact = this.point.sub(bodyA.xf.pos);
        this.bToContact = this.point.sub(bodyB.xf.pos);

        const aToContactNormal = this.aToContact.cross(normal);
        const bToContactNormal = this.bToContact.cross(normal);

        this.normalMass = bodyA.inverseMass + bodyB.inverseMass + 
                          bodyA.inverseInertia * aToContactNormal * aToContactNormal +
                          bodyB.inverseInertia * bToContactNormal * bToContactNormal;
                          

        const aToContactTangent = this.aToContact.cross(tangent);
        const bToContactTangent = this.bToContact.cross(tangent);

        this.tangentMass = bodyA.inverseMass + bodyB.inverseMass +
                           bodyA.inverseInertia * aToContactTangent * aToContactTangent +
                           bodyB.inverseInertia * bToContactTangent * bToContactTangent;


        return this;
    }

    public getRelativeVelocity() {
        const bodyA = this.contact.bodyA;
        const bodyB = this.contact.bodyB;
        // Relative velocity in linear terms
        // Angular to linear velocity formula -> omega = velocity/radius so omega x radius = velocity
        const vel = bodyB.m.vel.add(cross(bodyB.m.angularVelocity, this.bToContact)).sub(
               bodyA.m.vel.sub(cross(bodyA.m.angularVelocity, this.aToContact)));

        return vel;
    }

    /**
     * Impulse accumulated over time in normal direction
     */
    public normalImpulse: number = 0;

    /**
     * Impulse accumulated over time in the tangent direction
     */
    public tangentImpulse: number = 0;

    /**
     * Effective mass seen in the normal direction
     */
    public normalMass: number = 0;
    
    /**
     * Effective mass seen in the tangent direction
     */
    public tangentMass: number = 0;

    /** 
     * Direction from center of mass of bodyA to contact point
     */
    public aToContact: Vector = new Vector(0, 0);

    /** 
     * Direction from center of mass of bodyB to contact point
     */
    public bToContact: Vector = new Vector(0, 0);
}

/**
 * Represents contact between two rigid bodies
 * 
 * Meant to be re-used over multiple frames
 */
export class Contact {

    /**
     * The unique id between 2 bodies
     */
    public get id() {
        return Contact.GetId(this.bodyA, this.bodyB);
    }

    /**
     * Get the id of 2 bodies
     * @param bodyA 
     * @param bodyB 
     * @returns 
     */
    public static GetId(bodyA: Collider, bodyB: Collider) {
        if (bodyA.id < bodyB.id) {
            return `${bodyA.id}+${bodyB.id}`;
        } else {
            return `${bodyB.id}+${bodyA.id}`;
        }
    }

    /**
     * Returns the separation in this contact (negative)
     * @returns 
     */
    public getSeparation() {
        if (this.bodyA instanceof Circle && this.bodyB instanceof Circle) {
            const combinedRadius = this.bodyA.radius + this.bodyB.radius;
            const distance = this.bodyA.xf.pos.distance(this.bodyB.xf.pos);
            const separation = combinedRadius - distance;
            return -separation;
        }

        if (this.bodyA instanceof Circle && this.bodyB instanceof Line) {
            return this.bodyB.getSeparation(this.bodyA);
        }

        if (this.bodyA instanceof Line && this.bodyB instanceof Circle) {
            return this.bodyA.getSeparation(this.bodyB);
        }

        return 0
    }

    private _points: ContactPoint[] = [];
    public setPoints(points: Vector[]) {
        this._points = points.map(p => {
           return new ContactPoint(p, this).update()
        });
        return this;
    }

    public updatePoints(points: Vector[]) {
        this._points.forEach((p, i) => {
            p.point = points[i];
            p.update();
        })
        return this;
    }

    public get points(): ContactPoint[] {
        return this._points;
    }

    constructor(
        public bodyA: Collider,
        public bodyB: Collider,
        public normal: Vector,
        public tangent: Vector
    ) {}
}