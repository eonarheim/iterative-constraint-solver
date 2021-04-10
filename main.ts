import { Box } from "./box";
import { Circle } from "./circle";
import { Collider } from "./collider";
import { Contact } from "./contact";
import { Line } from "./line";
import { clamp } from "./math";
import { Solver } from "./solver";
import { Vector } from "./vector";

const canvas = document.createElement('canvas');
canvas.width = 800;
canvas.height = 600;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
document.body.appendChild(canvas);


const gui = new dat.GUI({ name: 'Iterative Solver' });
const flags: Record<string, number | boolean> = {
    "Debug": true,
    "Points": true,
    "Normals": true,
    "RelativeVel": true,
    "Warming": true,
    "Steering Factor": .2,
    "Slop": .5,
    "Position Iterations": 3,
    "Velocity Iterations": 8,
    "Gravity Value": 400,
    "Gravity": false
}
for (let key in flags) {
    if (typeof flags[key] === 'number') {
        switch(key) {
            case "Steering Factor": {
                gui.add(flags, key, .05, 1, .05);
                break;
            }
            case "Slop": {
                gui.add(flags, key, .5, 5, .5);
                break;
            }
            case "Gravity Value": {
                gui.add(flags, key, 0, 1000, 1);
                break;
            }
            default: {
                gui.add(flags, key, 0, 20, 1);
            }
        }
    }
    if (typeof flags[key] === 'boolean') {
        gui.add(flags, key);
    }
}

const entities: Collider[] = [
    // new Line(new Vector(50, 550), new Vector(750, 550)),
    new Box(500, 20, new Vector(canvas.width / 2, 550)),
    new Line(new Vector(100, 100), new Vector(300, 650)),
    new Line(new Vector(500, 650), new Vector(700, 100)),
    // new Circle(40, new Vector(canvas.width / 2, 400)),
    // new Box(40, 40, new Vector(canvas.width / 2, 400)),
    // new Circle(40, new Vector(canvas.width / 2, 300)),
    // new Circle(40, new Vector(canvas.width / 2, 200)),
    // new Circle(40, new Vector(canvas.width / 2, 100)),
    // new Circle(40, new Vector(canvas.width / 2, 0)),
    // new Circle(40, new Vector(canvas.width / 2, -100)),
    // new Circle(40, new Vector(canvas.width / 2, -200)),
];
(window as any).entities = entities;
entities[0].static = true;
// entities[entities.length - 1].xf.rotation = Math.PI / 5;

let solver = new Solver(flags);
let contacts: Contact[] = [];
const update = (elapsed: number) => {
    let acc = new Vector(0, 0);
    if (flags['Gravity']) {
        acc = new Vector(0, flags['Gravity Value'] as number);
    }

    // Integrate motion
    for (let circle of entities) {
        if (!circle.static) {
            circle.m.vel = circle.m.vel.add(acc.scale(elapsed));
            circle.m.angularVelocity = clamp(circle.m.angularVelocity, -1, 1);
        }
    }

    // Naive descrete collision detection (broadphase + narrowphase)
    // We re-use contacts from the previous frame if they exist
    contacts = []
    for (let i = 0; i < entities.length; i++) {
        for (let j = i + 1; j < entities.length; j++) {
            let colliderA = entities[i];
            let colliderB = entities[j];
            let contact = colliderA.collide(colliderB);
            if (contact) {
                contacts.push(contact);
            }
            
        }
    }

    // Initialize contact information
    solver.preSolve(contacts);
    
    // Warm start impulses for velocity constraint
    // This helps with simulation coherence by reusing work from previous frames
    // Practically this will cancel gravity on big stacks
    if (flags["Warming"]) {
        solver.warmStart(contacts);
    } else {
        for (let contact of contacts) {
            let constraints = solver.getContactConstraints(contact.id);
            for (let constraint of constraints) {
                constraint.normalImpulse = 0;
                constraint.tangentImpulse = 0;
            }
        }
    }

    // The velocity constraint is that no contacts are moving relative to each other along the normal
    // in other words relative velocity between contacts should approach 0 on the normal
    for (let i = 0; i < flags['Velocity Iterations']; i++) {
        solver.solveVelocity(contacts);
    }

    // Integrate positions
    for (let circle of entities) {
        if (!circle.static) {
            let offset = circle.m.vel.scale(elapsed).add(acc.scale(0.5 * elapsed * elapsed));
            circle.xf.pos = circle.xf.pos.add(offset);
            circle.xf.rotation += clamp(circle.m.angularVelocity, -1, 1) * elapsed;
            while (circle.xf.rotation > Math.PI * 2) {
                circle.xf.rotation -= Math.PI * 2;
            }
            while (circle.xf.rotation < 0) {
                circle.xf.rotation += Math.PI * 2;
            }
        }
    }

    // The constraint is separation should approach 0
    for (let i = 0; i < flags['Position Iterations']; i++) {
        solver.solvePosition(contacts);
    }

    solver.postSolve(contacts);
}


const draw = (elapsed: number) => {
    ctx.save();
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let e of entities) {
        e.draw(ctx, flags);
    }

    if (flags["Debug"]) {
        for (let contact of contacts) {
            let contactPoints = solver.getContactConstraints(contact.id);
            for (let p of contactPoints) {
                if (flags["Points"]) {
                    ctx.beginPath();
                    ctx.strokeStyle = 'yellow'
                    ctx.arc(p.point.x, p.point.y, 5, 0, Math.PI * 2);
                    ctx.closePath();
                    ctx.stroke();
                }

                if (flags["Normals"]) {
                    ctx.beginPath();
                    ctx.strokeStyle = 'red'
                    ctx.moveTo(p.point.x, p.point.y);
                    ctx.lineTo(p.point.x + contact.normal.x * 10, p.point.y + contact.normal.y * 10);
                    ctx.closePath();
                    ctx.stroke();
                }

                if (flags["RelativeVel"]) {
                    ctx.beginPath();
                    ctx.strokeStyle = 'blue'
                    ctx.moveTo(p.point.x, p.point.y);
                    ctx.lineTo(p.point.x + p.getRelativeVelocity().x, p.point.y + p.getRelativeVelocity().y);
                    ctx.closePath();
                    ctx.stroke();
                }

                if (flags["Impulse"]) {
                    ctx.fillStyle = 'yellow';
                    ctx.fillText('N- ' + p.normalImpulse.toFixed(1), p.point.x + 10, p.point.y);
                    ctx.fillText('T- ' + p.tangentImpulse.toFixed(1), p.point.x + 10, p.point.y + 10);
                }
            }
        }

        for (let circle of entities) {
            
            ctx.beginPath();
            ctx.strokeStyle = 'green';
            ctx.moveTo(circle.xf.pos.x, circle.xf.pos.y);
            ctx.lineTo(circle.xf.pos.x + circle.m.vel.x, circle.xf.pos.y + circle.m.vel.y);
            ctx.closePath();
            ctx.stroke();
        }
    }
    ctx.restore();
}

let singleStep = false;
let lastMs = 0;
const mainloop = (currentMs: number) => {
    if (singleStep) {
        return;
    }

    let seconds = (currentMs - lastMs) / 1000;
    if (seconds > .1) {
        seconds = .016;
    }

    update(seconds);
    draw(seconds);

    lastMs = currentMs;
    requestAnimationFrame(mainloop);
}

mainloop(.016);

document.addEventListener('keydown', (ev) => {
    if (ev.code === 'KeyS') {
        singleStep = true;
        update(.016);
        draw(.016);
    }
    if (ev.code === 'KeyT') {
        singleStep = false;
        lastMs = 0;
        mainloop(.016);
    }

    if (ev.code === 'KeyI') {
        entities[3].applyImpulse(entities[3].xf.pos, new Vector(0, -5500));
        entities[4].applyImpulse(entities[4].xf.pos, new Vector(0, 5500));
    }

    if (ev.code === 'KeyC') {
        entities.push(new Circle(40, new Vector(canvas.width / 2, 0)));
    }

    if (ev.code === 'KeyB') {
        let box = new Box(100, 40, new Vector(canvas.width / 2, 300));
        box.bounciness = .1;
        entities.push(box);
    }
})
