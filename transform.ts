import { Vector } from "./vector";

export class Transform {
    public pos: Vector = new Vector(0, 0);
    public rotation: number = 0;
}

export class Motion {
    public vel: Vector = new Vector(0, 0);
    public acc: Vector = new Vector(0, 0);

    public angularVelocity: number = 0;
}