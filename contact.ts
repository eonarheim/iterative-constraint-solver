import { Box } from "./box";
import { Circle } from "./circle";
import { Collider } from "./collider";
import { Line } from "./line";
import { assert } from "./math";
import { ContactInfo, SeparatingAxis } from "./separating-axis";
import { Vector } from "./vector";

/**
 * Holds information about contact points, meant to be reused over multiple frames of contact
 */
export class ContactPoint {

    constructor(public point: Vector, public local: Vector, public contact: Contact) {}

    public getRelativeVelocity() {
        const bodyA = this.contact.bodyA;
        const bodyB = this.contact.bodyB;
        // Relative velocity in linear terms
        // Angular to linear velocity formula -> omega = velocity/radius so omega x radius = velocity
        const velA = bodyA.m.vel.add(Vector.cross(bodyA.m.angularVelocity, this.aToContact));
        const velB = bodyB.m.vel.add(Vector.cross(bodyB.m.angularVelocity, this.bToContact));

        return velB.sub(velA);
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
    public getSeparation(point: Vector) {
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

        // TODO separation needs to work on local points
        if (this.bodyA instanceof Box && this.bodyB instanceof Box) {
            if (this.info.localSide) {
                let side: [Vector, Vector];
                let worldPoint: Vector;
                if (this.info.collider === this.bodyA) {
                    side = [this.bodyA.xf.apply(this.info.localSide[0]), this.bodyA.xf.apply(this.info.localSide[1])];
                    worldPoint = this.bodyB.xf.apply(point);
                } else {
                    side = [this.bodyB.xf.apply(this.info.localSide[0]), this.bodyB.xf.apply(this.info.localSide[1])];
                    worldPoint = this.bodyA.xf.apply(point);
                }

                return SeparatingAxis.distanceToPoint(side[0], side[1], worldPoint, true);
            }
        }

        if (this.bodyA instanceof Box && this.bodyB instanceof Circle ||
            this.bodyB instanceof Box && this.bodyA instanceof Circle) {
            if (this.info.side) {
                return SeparatingAxis.distanceToPoint(this.info.side[0], this.info.side[1], point, true);
            }
        }

        return 0
    }

    public flip(): Contact {
        const temp = this.bodyA;
        this.bodyA = this.bodyB;
        this.bodyB = temp;
        this.normal = this.normal.negate();
        this.tangent = this.normal.perpendicular();
        return this;
    }

    constructor(
        public bodyA: Collider,
        public bodyB: Collider,
        /**
         * Normals point away from bodyA
         */
        public normal: Vector,
        public tangent: Vector,
        public info: ContactInfo,
        public points: Vector[] = [],
        /**
         * Points are on bodyA
         */
        public locals: Vector[] = []
    ) {}
}