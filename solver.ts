import { Box } from "./box";
import { Circle } from "./circle";
import { Contact } from "./contact";
import { Line } from "./line";
import { clamp } from "./math";
import { SeparatingAxis } from "./separating-axis";
import { Vector } from "./vector";

/**
 * Holds information about contact points, meant to be reused over multiple frames of contact
 */
 export class ContactConstraintPoint {

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
     * Tracks the original contacts velocity multiplied by restitution
     */
    public originalVelocityAndRestitution: number = 0;

    /** 
     * Direction from center of mass of bodyA to contact point
     */
    public aToContact: Vector = new Vector(0, 0);

    /** 
     * Direction from center of mass of bodyB to contact point
     */
    public bToContact: Vector = new Vector(0, 0);
}

export class Solver {
    constructor(public flags: any) {}
    lastFrameContacts: Map<string, Contact> = new Map();

    // map contact id to contact points
    idToContactConstraint: Map<string, ContactConstraintPoint[]> = new Map();

    getContactConstraints(id: string) {
        return this.idToContactConstraint.get(id) ?? [];
    }

    preSolve(contacts: Contact[]) {
        // Keep track of contacts that done
        let finishedContactIds = Array.from(this.idToContactConstraint.keys());
        for (let contact of contacts) {
            // Remove all current contacts that are not done
            let index = finishedContactIds.indexOf(contact.id);
            if (index > -1) {
                finishedContactIds.splice(index, 1);
            }
            let constraints = this.idToContactConstraint.get(contact.id) ?? [];
            
            let pointIndex = 0;
            constraints.length = contact.points.length;

            for (let point of contact.points) {
                const bodyA = contact.bodyA;
                const bodyB = contact.bodyB;
                const normal = contact.normal;
                const tangent = contact.tangent;

                const aToContact = point.sub(bodyA.xf.pos);
                const bToContact = point.sub(bodyB.xf.pos);
    
                const aToContactNormal = aToContact.cross(normal);
                const bToContactNormal = bToContact.cross(normal);

                const normalMass = bodyA.inverseMass + bodyB.inverseMass + 
                                bodyA.inverseInertia * aToContactNormal * aToContactNormal +
                                bodyB.inverseInertia * bToContactNormal * bToContactNormal;

                const aToContactTangent = aToContact.cross(tangent);
                const bToContactTangent = bToContact.cross(tangent);
    
                const tangentMass = bodyA.inverseMass + bodyB.inverseMass +
                                bodyA.inverseInertia * aToContactTangent * aToContactTangent +
                                bodyB.inverseInertia * bToContactTangent * bToContactTangent;

                // Preserve normal/tangent impulse by re-using the contact point if it's close
                if (constraints[pointIndex] && constraints[pointIndex]?.point?.squareDistance(point) < 4) {
                    constraints[pointIndex].point = point;
                    constraints[pointIndex].local = contact.locals[pointIndex]
                } else {
                    // new contact if its' not close or doesn't exist
                    constraints[pointIndex] = new ContactConstraintPoint(point, contact.locals[pointIndex], contact);
                }

                // Update contact point calculations
                constraints[pointIndex].aToContact = aToContact;
                constraints[pointIndex].bToContact = bToContact;
                constraints[pointIndex].normalMass = 1.0 / normalMass;
                constraints[pointIndex].tangentMass = 1.0 / tangentMass;

                 // Calculate relative velocity before solving to accurately do restitution
                const restitution = bodyA.bounciness > bodyB.bounciness ? bodyA.bounciness : bodyB.bounciness;
                const relativeVelocity = contact.normal.dot(constraints[pointIndex].getRelativeVelocity());
                constraints[pointIndex].originalVelocityAndRestitution = 0;
                if (relativeVelocity < -0.1) { // TODO what's a good threshold here?
                    constraints[pointIndex].originalVelocityAndRestitution = -restitution * relativeVelocity;
                }

                pointIndex++
            }
            this.idToContactConstraint.set(contact.id, constraints);
        }

        // Clean up any contacts that did not occur last frame
        for (const id of finishedContactIds) {
            this.idToContactConstraint.delete(id);
        }
    }

    postSolve(contacts: Contact[]) {
        // Store contacts
        this.lastFrameContacts.clear();
        for (const c of contacts) {
            this.lastFrameContacts.set(c.id, c);
        }
    }

    /**
     * Warm up body's based on previous frame contact points
     * @param contacts 
     */
    warmStart(contacts: Contact[]) {
        for (let contact of contacts) {
            let constraints = this.idToContactConstraint.get(contact.id) ?? [];
            for (let constraint of constraints) {
                const normalImpulse = contact.normal.scale(constraint.normalImpulse);
                const tangentImpulse = contact.tangent.scale(constraint.tangentImpulse);

                const impulse = normalImpulse.add(tangentImpulse);
                contact.bodyA.applyImpulse(constraint.point, impulse.negate());
                contact.bodyB.applyImpulse(constraint.point, impulse);
            }
        }
    }

    private _getSeparation(contact: Contact, point: Vector) {
        let bodyA = contact.bodyA;
        let bodyB = contact.bodyB;
        if (bodyA instanceof Circle && bodyB instanceof Circle) {
            const combinedRadius = bodyA.radius + bodyB.radius;
            const distance = bodyA.xf.pos.distance(bodyB.xf.pos);
            const separation = combinedRadius - distance;
            return -separation;
        }

        if (bodyA instanceof Circle && bodyB instanceof Line) {
            return bodyB.getSeparation(bodyA);
        }

        if (bodyA instanceof Line && bodyB instanceof Circle) {
            return bodyA.getSeparation(bodyB);
        }

        if (bodyA instanceof Box && bodyB instanceof Box) {
            if (contact.info.localSide) {
                let side: [Vector, Vector];
                let worldPoint: Vector;
                if (contact.info.collider === bodyA) {
                    side = [bodyA.xf.apply(contact.info.localSide[0]), bodyA.xf.apply(contact.info.localSide[1])];
                    worldPoint = bodyB.xf.apply(point);
                } else {
                    side = [bodyB.xf.apply(contact.info.localSide[0]), bodyB.xf.apply(contact.info.localSide[1])];
                    worldPoint = bodyA.xf.apply(point);
                }

                return SeparatingAxis.distanceToPoint(side[0], side[1], worldPoint, true);
            }
        }

        if (bodyA instanceof Box && bodyB instanceof Circle ||
            bodyB instanceof Box && bodyA instanceof Circle) {
            if (contact.info.side) {
                return SeparatingAxis.distanceToPoint(contact.info.side[0], contact.info.side[1], bodyA.xf.apply(point), true);
            }
        }

        return 0
    }
    

    /**
     * Iteratively solve the position overlap constraint
     * @param contacts 
     */
    solvePosition(contacts: Contact[]) {
        for (let contact of contacts) {
            let constraints = this.idToContactConstraint.get(contact.id) ?? [];
            for (let point of constraints) {
                const bodyA = contact.bodyA;
                const bodyB = contact.bodyB;
                const normal = contact.normal;
                const separation = this._getSeparation(contact, point.local);

                const steeringConstant = this.flags['Steering Factor']; // 0.2
                const maxCorrection = -5;
                const slop = this.flags['Slop']; // .5;

                // Clamp to avoid over-correction
                // Remember that we are shooting for 0 overlap in the end
                const steeringForce = clamp(steeringConstant * (separation + slop), maxCorrection, 0);
                const impulse = normal.scale(-steeringForce * point.normalMass);

                
                // This is a pseudo impulse, meaning we aren't doing a real impulse calculation
                // We adjust position and rotation instead of doing the velocity
                if (!bodyA.static) {
                    bodyA.xf.pos = bodyA.xf.pos.add(impulse.negate().scale(bodyA.inverseMass));
                    bodyA.xf.rotation -= point.aToContact.cross(impulse) * bodyA.inverseInertia;
                }

                if (!bodyB.static) {
                    bodyB.xf.pos = bodyB.xf.pos.add(impulse.scale(bodyB.inverseMass));
                    bodyB.xf.rotation += point.bToContact.cross(impulse) * bodyB.inverseInertia;
                }

            }
        }
    }

    solveVelocity(contacts: Contact[]) {
        for (let contact of contacts) {
            const bodyA = contact.bodyA;
            const bodyB = contact.bodyB;

            const restitution = bodyA.bounciness * bodyB.bounciness;
            const friction = Math.min(bodyA.friction, bodyB.friction);
            let constraints: ContactConstraintPoint[] = this.idToContactConstraint.get(contact.id) ?? [];

            for (let point of constraints) {
                const relativeVelocity = point.getRelativeVelocity();

                // Negate velocity in tangent direction to simulate friction
                const tangentVelocity = -relativeVelocity.dot(contact.tangent);
                let impulseDelta = tangentVelocity * point.tangentMass;

                // Clamping based in Erin Catto's GDC 2006 talk
                // Correct clamping https://github.com/erincatto/box2d-lite/blob/master/docs/GDC2006_Catto_Erin_PhysicsTutorial.pdf
                // Accumulated fiction impulse is always between -uMaxFriction < dT < uMaxFriction
                // But deltas can vary
                const maxFriction = friction * point.normalImpulse;
                const newImpulse = clamp(point.tangentImpulse + impulseDelta, -maxFriction, maxFriction);
                impulseDelta = newImpulse - point.tangentImpulse;
                point.tangentImpulse = newImpulse;

                const impulse = contact.tangent.scale(impulseDelta);
                bodyA.applyImpulse(point.point, impulse.negate());
                bodyB.applyImpulse(point.point, impulse);
            }

            for (let point of constraints) {
                // Need to recalc relative velocity because the previous step could have changed vel
                const relativeVelocity = point.getRelativeVelocity();

                // Compute impulse in normal direction
                const normalVelocity = relativeVelocity.dot(contact.normal);

                // Per Erin it is a mistake to apply the restitution inside the iteration
                // From Erin Catto's Box2D we keep original contact velocity and adjust by small impulses
                let impulseDelta = -point.normalMass * (normalVelocity - point.originalVelocityAndRestitution);

                // Clamping based in Erin Catto's GDC 2014 talk
                // Accumulated impulse stored in the contact is always positive (dV > 0)
                // But deltas can be negative
                const newImpulse = Math.max(point.normalImpulse + impulseDelta, 0);
                impulseDelta = newImpulse - point.normalImpulse;
                point.normalImpulse = newImpulse;

                const impulse = contact.normal.scale(impulseDelta);
                bodyA.applyImpulse(point.point, impulse.negate());
                bodyB.applyImpulse(point.point, impulse);
            }
        }
    }
}