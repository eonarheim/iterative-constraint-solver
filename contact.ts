import { Collider } from "./collider";
import { ContactInfo } from "./separating-axis";
import { Vector } from "./vector";

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

    constructor(
        public bodyA: Collider,
        public bodyB: Collider,
        /**
         * Normals point away from bodyA
         */
        public normal: Vector,
        /**
         * Tangent to collision normal 
         */
        public tangent: Vector,
        // TODO should this just be part of contact?
        public info: ContactInfo,
        /**
         * World space contact points
         */
        public points: Vector[] = [],
        /**
         * Local space contact points
         */
        public locals: Vector[] = []
    ) {}
}