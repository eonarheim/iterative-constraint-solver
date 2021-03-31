import { Circle } from "./circle";
import { Contact } from "./contact";
import { Line } from "./line";
import { assert, clamp, shuffle } from "./math";
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
    "Warming": true,
    "Position Iterations": 2,
    "Velocity Iterations": 8,
    "Gravity Value": 400,
    "Gravity": false
}
for (let key in flags) {
    if (typeof flags[key] === 'number') {
        gui.add(flags, key, 0, 20, 1);
    }
    if (typeof flags[key] === 'boolean') {
        gui.add(flags, key);
    }
}

const entities = [
    new Line(new Vector(50, 550), new Vector(750, 550)),
    new Line(new Vector(100, 100), new Vector(300, 650)),
    new Line(new Vector(500, 650), new Vector(700, 100)),
    new Circle(40, new Vector(canvas.width / 2, 400)),
    new Circle(40, new Vector(canvas.width / 2, 300)),
    // new Circle(40, new Vector(canvas.width / 2, 200)),
    // new Circle(40, new Vector(canvas.width / 2, 100)),
    // new Circle(40, new Vector(canvas.width / 2, 0)),
    // new Circle(40, new Vector(canvas.width / 2, -100)),
    // new Circle(40, new Vector(canvas.width / 2, -200)),
];
(window as any).entities = entities;

let solver = new Solver();
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
            circle.m.angularVelocity = clamp(circle.m.angularVelocity, -Math.PI, Math.PI);
        }
    }

    // Naive descrete collision detection (broadphase + narrowphase)
    // We re-use contacts from the previous frame if they exist
    contacts = []
    for (let i = 0; i < entities.length; i++) {
        for (let j = i + 1; j < entities.length; j++) {
            let circleA = entities[i];
            let circleB = entities[j];
            let contact = circleA.collide(circleB);
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
            let contactPoints = solver.getContactPoints(contact.id);
            for (let point of contactPoints) {
                point.normalImpulse = 0;
                point.tangentImpulse = 0;
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
            circle.xf.pos = circle.xf.pos.add(circle.m.vel.scale(elapsed)).add(acc.scale(0.5 * elapsed * elapsed));
            circle.xf.rotation += circle.m.angularVelocity * elapsed;
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
        if (e instanceof Circle) {
            ctx.beginPath();
            ctx.fillStyle = 'blue';
            ctx.arc(e.xf.pos.x, e.xf.pos.y, e.radius, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();

            if (flags["Debug"]) {
                ctx.fillStyle = 'yellow';
                ctx.fillText('id: ' + e.id, e.xf.pos.x, e.xf.pos.y);
            }

            ctx.save();
            ctx.translate(e.xf.pos.x, e.xf.pos.y);
            ctx.rotate(e.xf.rotation);
            ctx.beginPath()
            ctx.strokeStyle = 'black';
            ctx.moveTo(0, 0);
            ctx.lineTo(0 + e.radius, 0);
            ctx.closePath();
            ctx.stroke();
            ctx.restore();
        }

        if (e instanceof Line) {
            ctx.save();
            ctx.beginPath();
            ctx.strokeStyle = 'green'
            ctx.moveTo(e.begin.x, e.begin.y);
            ctx.lineTo(e.end.x, e.end.y);
            ctx.closePath();
            ctx.stroke();
            ctx.restore();

            if (flags["Debug"]) {
                ctx.fillStyle = 'yellow';
                ctx.fillText('id: ' + e.id, e.xf.pos.x, e.xf.pos.y);
            }
        }
    }

    if (flags["Debug"]) {
        for (let contact of contacts) {
            let contactPoints = solver.getContactPoints(contact.id);
            for (let p of contactPoints) {
                ctx.beginPath();
                ctx.strokeStyle = 'yellow'
                ctx.arc(p.point.x, p.point.y, 5, 0, Math.PI * 2);
                ctx.closePath();
                ctx.stroke();

                ctx.beginPath();
                ctx.strokeStyle = 'red'
                ctx.moveTo(p.point.x, p.point.y);
                ctx.lineTo(p.point.x + contact.normal.x * 10, p.point.y + contact.normal.y * 10);
                ctx.closePath();
                ctx.stroke();

                ctx.fillStyle = 'yellow';
                ctx.fillText('N- ' + p.normalImpulse.toFixed(1), p.point.x + 10, p.point.y);
                ctx.fillText('T- ' + p.tangentImpulse.toFixed(1), p.point.x + 10, p.point.y + 10);
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

    if (ev.code === 'KeyB') {
        entities.push(new Circle(40, new Vector(canvas.width / 2, 0)));
    }
})
