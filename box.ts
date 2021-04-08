import { Circle } from "./circle";
import { Collider } from "./collider";
import { Line } from "./line";
import { SeparatingAxis } from "./separating-axis";
import { Vector } from "./vector";

export class Box extends Collider {
    constructor(public width: number, public height: number, pos: Vector) {
        super();
        this.xf.pos = pos;
        this.mass = 1;
    }

    get localPoints(): readonly Vector[] {
        const halfHeight = this.height / 2;
        const halfWidth = this.width / 2;

        const points: Vector[] = [
            new Vector(-halfWidth, -halfHeight),
            new Vector(halfWidth, -halfHeight),
            new Vector(halfWidth, halfHeight),
            new Vector(-halfWidth, halfHeight)
        ];
        return points;
    }

    get points(): readonly Vector[] {
        const pos = this.xf.pos;
        const rot = this.xf.rotation;

        const halfHeight = this.height / 2;
        const halfWidth = this.width / 2;

        const points: Vector[] = [
            pos.add(new Vector(-halfWidth, -halfHeight)),
            pos.add(new Vector(halfWidth, -halfHeight)),
            pos.add(new Vector(halfWidth, halfHeight)),
            pos.add(new Vector(-halfWidth, halfHeight))
        ].map(p => p.rotate(rot, pos));

        return points;
    } 

    get inverseMass() {
        return this.static ? 0 : 1 / this.mass;
    }

    get inertia() {
        // https://en.wikipedia.org/wiki/List_of_moments_of_inertia
        return (this.mass/12) * (this.width + this.height * this.height);
    }

    get inverseInertia() {
        return this.static ? 0 : 1 / this.inertia;
    }

    collide(other: Circle | Line | Box) {
        if (other instanceof Circle) {
            return SeparatingAxis.findCircleBoxContact(other, this);
        }

        if (other instanceof Box) {
            return SeparatingAxis.findBoxBoxContact(this, other)
        }

        if (other instanceof Line) {
            null; // TODO line
        }

        return null;
    }

    /**
     * ```
     *   +----- 0 "top" -----+
     *   |                   |
     *   | 3 "left"          | 1 "right"
     *   |                   |
     *   |                   |
     *   +----- 2 "bottom"---+
     * ```
     * @param index 
     */
    getSide(index: number): [Vector, Vector] {
        const pts = this.points;
        const len = this.points.length;
        return [pts[index], pts[(index + 1) % len]];
    }

    getLocalSide(index: number): [Vector, Vector] {
        const pts = this.localPoints;
        const len = this.localPoints.length;
        return [pts[index], pts[(index + 1) % len]];
    }

    /**
     * Find the point on the shape furthest in the direction specified
     */
    getFurthestPoint(direction: Vector): Vector {
        const pts = this.points;
        let furthestPoint = pts[0];
        let maxDistance = -Number.MAX_VALUE;
        for (let i = 0; i < pts.length; i++) {
            const distance = direction.dot(pts[i]);
            if (distance > maxDistance) {
                maxDistance = distance;
                furthestPoint = pts[i];
            }
        }
        return furthestPoint;
    }

    getFurthestLocalPoint(direction: Vector): Vector {
        const pts = this.localPoints;
        let furthestPoint = pts[0];
        let maxDistance = -Number.MAX_VALUE;
        for (let i = 0; i < pts.length; i++) {
            const distance = direction.dot(pts[i]);
            if (distance > maxDistance) {
                maxDistance = distance;
                furthestPoint = pts[i];
            }
        }
        return furthestPoint;
    }

    findSide(direction: Vector): [Vector, Vector] {
        let bestSide = this.getSide(0);
        let maxDistance = -Number.MAX_VALUE;
        for (let side = 0; side < 4; side++) {
            let currentSide = this.getSide(side);
            const sideNormal = currentSide[1].sub(currentSide[0]).normal();
            const mostDirection = sideNormal.dot(direction);
            if (mostDirection > maxDistance) {
                bestSide = currentSide;
                maxDistance = mostDirection;
            }
        }
        return bestSide;
    }

    findLocalSide(direction: Vector): [Vector, Vector] {
        let bestSide = this.getLocalSide(0);
        let maxDistance = -Number.MAX_VALUE;
        for (let side = 0; side < 4; side++) {
            let currentSide = this.getLocalSide(side);
            const sideNormal = currentSide[1].sub(currentSide[0]).normal();
            const mostDirection = sideNormal.dot(direction);
            if (mostDirection > maxDistance) {
                bestSide = currentSide;
                maxDistance = mostDirection;
            }
        }
        return bestSide;
    }

    draw(ctx: CanvasRenderingContext2D, flags: any) {

        for (let side = 0; side < 4; side++) {
            let currentSide = this.getSide(side);
            ctx.save();
            ctx.beginPath();
            ctx.strokeStyle = 'green'
            ctx.moveTo(currentSide[0].x, currentSide[0].y);
            ctx.lineTo(currentSide[1].x, currentSide[1].y);
            ctx.closePath();
            ctx.stroke();
            ctx.restore();
        }
        if (flags["Debug"]) {
            ctx.fillStyle = 'yellow';
            ctx.fillText('id: ' + this.id, this.xf.pos.x, this.xf.pos.y);
        }
    }
}