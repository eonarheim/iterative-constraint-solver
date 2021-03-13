export class Vector {
    constructor(public x: number, public y: number) {}
    distance(other: Vector) {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        return  Math.sqrt(dx * dx + dy * dy);
    }

    normalize(): Vector {
        const d = this.distance(new Vector(0, 0));
        return new Vector(this.x / d, this.y / d);
    }

    size(): number {
        return this.distance(new Vector(0, 0));
    }

    scale(val: number): Vector {
        return new Vector(this.x * val, this.y * val);
    }

    negate(): Vector {
        return this.scale(-1);
    }

    /**
     * Returns the perpendicular vector to this one
     */
    perpendicular(): Vector {
        return new Vector(this.y, -this.x);
    }

    /**
     * Returns the normal vector to this one, same as the perpendicular of length 1
     */
    normal(): Vector {
        return this.perpendicular().normalize();
    }

    dot(other: Vector): number {
        return this.x * other.x + this.y * other.y;
    }

    /**
     * Performs a 2D cross product with scalar. 2D cross products with a scalar return a vector.
     * @param v  The scalar to cross
     */
    cross(v: number): Vector;
    /**
     * Performs a 2D cross product with another vector. 2D cross products return a scalar value not a vector.
     * @param v  The vector to cross
     */
    cross(v: Vector): number;
    cross(v: number | Vector): number | Vector {
        if (v instanceof Vector) {
            return this.x * v.y - this.y * v.x;
        } else {
            return new Vector(v * this.y, -v * this.x);
        }
    }

    add(other: Vector): Vector {
        return new Vector(this.x + other.x, this.y + other.y);
    }

    /**
     * Creates a vector in the direcion of `other` -> `this`
     * @param other 
     * @returns 
     */
    sub(other: Vector): Vector {
        return new Vector(this.x - other.x, this.y - other.y);
    }
}

export const cross = (num: number, vec: Vector) => {
    return new Vector(-num * vec.y, num * vec.x)
}