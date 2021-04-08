import { Box } from "./box";
import { Circle } from "./circle";
import { Collider } from "./collider";
import { Contact } from "./contact";
import { Vector } from "./vector";

export interface ContactInfo {
    /**
     * Collider A
     */
    collider: Collider,
    /**
     * Signed value (negative means overlap, positive no overlap)
     */
    separation: number,
    /**
     * Axis of separation from the collider's perpective
     */
    axis: Vector,
    /**
     * Side of separation (reference) from the collider's perpsective
     */
    side?: [Vector, Vector],
    localSide?: [Vector, Vector],
    
    /**
     * Index of the separation side (reference) from the collider's perspective
     */
    sideId?: number,

    /**
     * Point on collider B (incident point)
     */
    point: Vector;
    /**
     * Local point on collider B (incident point)
     */
    localPoint?: Vector;
}

export class SeparatingAxis {

    static findBoxBoxSeparation(boxA: Box, boxB: Box): ContactInfo {
        let bestSeparation = -Number.MAX_VALUE;
        let bestSide: [Vector, Vector] | null = null;
        let bestAxis: Vector | null = null;
        let bestSideIndex: number = -1;
        let bestOtherPoint: Vector | null = null;
        for (let i = 0; i < 4; i++){
            const side = boxA.getSide(i);
            const axis = side[1].sub(side[0]).normal();
            const vertB = boxB.getFurthestPoint(axis.negate());
            // Separation on side i's axis
            const vertSeparation = SeparatingAxis.distanceToPoint(side[0], side[1], vertB, true); 
            if (vertSeparation > bestSeparation) {
                bestSeparation = vertSeparation;
                bestSide = side;
                bestAxis = axis;
                bestSideIndex = i;
                bestOtherPoint = vertB
            }
        }

        return {
            collider: boxA,
            separation: bestSeparation,
            axis: bestAxis as Vector,
            side: bestSide as [Vector, Vector],
            localSide: boxA.getLocalSide(bestSideIndex),
            sideId: bestSideIndex,
            point: bestOtherPoint as Vector,
            localPoint: boxB.getFurthestLocalPoint(bestAxis!.negate())
        }
    }

    static findBoxBoxContact(boxA: Box, boxB: Box): Contact | null {
        const separationA = SeparatingAxis.findBoxBoxSeparation(boxA, boxB);
        // If there is no overlap from boxA's perspective we can end early
        if (separationA.separation > 0) {
            return null;
        } 

        const separationB = SeparatingAxis.findBoxBoxSeparation(boxB, boxA);
        // If there is no overlap from boxB's perspective exit now
        if (separationB.separation > 0) {
            return null;
        }

        // Separations are both negative, we want to pick the least negative (minimal movement)
        const separation = separationA.separation > separationB.separation ? separationA : separationB;

        // The incident side is the most opposite from the axes of collision on the other shape
        const other = separation.collider === boxA ? boxB : boxA;
        const incident = other.findSide(separation.axis.negate());

        // Clip incident side by the perpendicular lines at each end of the reference side
        // https://en.wikipedia.org/wiki/Sutherland%E2%80%93Hodgman_algorithm
        const reference = separation.side as [Vector, Vector];
        const refDir = reference[1].sub(reference[0]).normalize();
        
        // Find our contact points by clipping the incident by the collision side
        const clipRight = SeparatingAxis._clip(incident[0], incident[1], refDir.negate(), -refDir.dot(reference[0]));
        let clipLeft: [Vector, Vector] | null = null;
        if (clipRight) {
            clipLeft = SeparatingAxis._clip(clipRight[0], clipRight[1], refDir, refDir.dot(reference[1]));
        }

        if (clipLeft) {
            // We only want clip points below the reference edge, discard the others
            const points = clipLeft.filter(p => {
                return SeparatingAxis._below(reference[0], reference[1], p);
            });

            let normal = separation.axis;
            let tangent = normal.perpendicular();
            // Point Contact A -> B
            if (boxB.xf.pos.sub(boxA.xf.pos).dot(normal) < 0) {
                normal = normal.negate();
                tangent = normal.perpendicular();
            }
            // Points are clipped from incident which is the other collider
            // Store those as locals
            let localPoints: Vector[] = [];
            if (separation.collider === boxA) {
                localPoints = points.map(p => boxB.xf.inverse(p));
            } else {
                localPoints = points.map(p => boxA.xf.inverse(p));
            }
            return new Contact(boxA, boxB, normal, normal.perpendicular(), separation, points, localPoints);
        }
        return null;
    }

    static findBoxCircleSeparation(box: Box, circle: Circle): ContactInfo {
        const cirleDir = circle.xf.pos.sub(box.xf.pos).normalize();
        const boxDir = box.xf.pos.sub(circle.xf.pos).normalize();
        const circlePoint = circle.xf.pos.add(boxDir.scale(circle.radius));
        
        let bestSeparation = -Number.MAX_VALUE;
        let bestSide: [Vector, Vector] | null = null;
        let bestAxis: Vector | null = null;
        let bestSideIndex: number = -1;
        let bestOtherPoint: Vector | null = null;

        // Test poly axes against circle point
        for (let i = 0; i < 4; i++){
            const side = box.getSide(i);
            const axis = side[1].sub(side[0]).normal();
            const circlePoint = circle.xf.pos.add(axis.negate().scale(circle.radius));
            // Separation on side i's axis
            const vertSeparation = SeparatingAxis.distanceToPoint(side[0], side[1], circlePoint, true); 
            if (vertSeparation > bestSeparation) {
                bestSeparation = vertSeparation;
                bestSide = side;
                bestAxis = axis;
                bestSideIndex = i;
                bestOtherPoint = circlePoint
            }
        }
        // Test the circle axis against each point of the best edge so far
        for (let i = 0; i < 2; i++) {
            const edgePoint = bestSide![i];
            const circleFromEdgePoint = circle.xf.pos.sub(edgePoint);
            const separation = circleFromEdgePoint.distance() - circle.radius;
            if (separation < 0 && separation > bestSeparation) {
                bestSideIndex = bestSideIndex
                bestSide = bestSide;
                bestSeparation = separation;
                bestAxis = circleFromEdgePoint.normalize();
                bestOtherPoint = bestAxis.negate().scale(circle.radius).add(circle.xf.pos);
            }
        }

        return {
            collider: box,
            separation: bestSeparation,
            axis: bestAxis as Vector,
            side: bestSide as [Vector, Vector],
            sideId: bestSideIndex,
            point: bestOtherPoint as Vector
        }
    }

    static findCircleBoxContact(circle: Circle, box: Box): Contact | null {
        let separation = SeparatingAxis.findBoxCircleSeparation(box, circle);
        if (separation.separation > 0) {
            return null;
        }

        // make sure that the minAxis is pointing away from circle
        let boxDir = box.xf.pos.sub(circle.xf.pos);
        let axis = separation.axis;
        axis = axis.dot(boxDir) < 0 ? axis.negate() : axis;

        const point = circle.getFurthestPoint(axis);
        const normal = axis;

        return new Contact(
            circle,
            box,
            normal,
            normal.perpendicular(),
            separation,
            [point],
            [circle.xf.inverse(point)]
        );
    }

    static findCircleCircleContact(circleA: Circle, circleB: Circle): Contact | null {
        
        const combinedRadius = circleB.radius + circleA.radius;
        const distance = circleB.xf.pos.distance(circleA.xf.pos);
        if (distance < combinedRadius) {
            const separation = combinedRadius - distance;
            
            // normal points from A -> B
            const direction = circleB.xf.pos.sub(circleA.xf.pos);
            const normal = direction.normalize();
            const tangent = normal.perpendicular();
            const point = circleA.xf.pos.add(normal.scale(circleA.radius));
            const info: ContactInfo = {
                collider: circleA,
                separation: separation,
                axis: normal,
                point: point
            }
            return new Contact(circleA, circleB, normal, tangent, info, [point]);
        }
        return null;
    }

    /**
    * Find the perpendicular distance from the line to a point
    * https://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line
    * @param point
    */
   static distanceToPoint(begin: Vector, end: Vector, point: Vector, signed: boolean = false) {
     const x0 = point.x;
     const y0 = point.y;
 
     const l = end.distance(begin);
 
     const dy = end.y - begin.y;
     const dx = end.x - begin.x;
     const distance = (dy * x0 - dx * y0 + end.x * begin.y - end.y * begin.x) / l;
     return signed ? distance : Math.abs(distance);
   }

   /**
    *  Clips along a line returning a new line given a direction and a length
    * ```
    *      Clip Dir  +-------->  Clip Size
    *         Begin  *---------|-------------*  End
    *  Clipped line  *---------* 
    * ```
    * 
    **/
   private static _clip(begin: Vector, end: Vector, clipDir: Vector, size: number): [Vector, Vector] | null {
    let dir = clipDir;
    dir = dir.normalize();


    const near = dir.dot(begin) - size;
    const far = dir.dot(end) - size;

    let results = [];
    if (near <= 0) {
      results.push(begin);
    }
    if (far <= 0) {
      results.push(end);
    }

    if (near * far < 0) {
      const clipTime = near / (near - far);
      results.push(begin.add(end.sub(begin).scale(clipTime)));
    }
    if (results.length !== 2) {
      return null;
    }

    return [results[0], results[1]];
  }

  private static _below(begin: Vector, end: Vector, point: Vector): boolean {
    let above2 = ((end.x - begin.x) * (point.y - begin.y) - 
    (end.y - begin.y) * (point.x - begin.x))
    return above2 >= 0;
  }
}