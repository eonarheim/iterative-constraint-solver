/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./circle.ts":
/*!*******************!*\
  !*** ./circle.ts ***!
  \*******************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Circle = void 0;
var collider_1 = __webpack_require__(/*! ./collider */ "./collider.ts");
var contact_1 = __webpack_require__(/*! ./contact */ "./contact.ts");
var line_1 = __webpack_require__(/*! ./line */ "./line.ts");
var Circle = /** @class */ (function (_super) {
    __extends(Circle, _super);
    function Circle(radius, pos) {
        var _this = _super.call(this) || this;
        _this.radius = radius;
        _this.xf.pos = pos;
        _this.mass = radius;
        return _this;
    }
    Object.defineProperty(Circle.prototype, "inverseMass", {
        get: function () {
            return this.static ? 0 : 1 / this.mass;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Circle.prototype, "inertia", {
        get: function () {
            return (this.mass * this.radius * this.radius) / 2;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Circle.prototype, "inverseInertia", {
        get: function () {
            return this.static ? 0 : 1 / this.inertia;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Returns a contact in the direction from `this` -> `other`
     * @param other
     * @returns
     */
    Circle.prototype.collide = function (other, contact) {
        var _a;
        if (other instanceof Circle) {
            var combinedRadius = other.radius + this.radius;
            var distance = other.xf.pos.distance(this.xf.pos);
            if (distance < combinedRadius) {
                var separation = combinedRadius - distance;
                // normal points from A -> B
                var direction = other.xf.pos.sub(this.xf.pos);
                var normal = direction.normalize();
                var tangent = normal.perpendicular();
                var point = this.xf.pos.add(normal.scale(this.radius));
                if (contact) {
                    contact.bodyA = this;
                    contact.bodyB = other;
                    contact.normal = normal;
                    contact.tangent = tangent;
                    contact.updatePoints([point]);
                    return contact;
                }
                else {
                    return new contact_1.Contact(this, other, normal, tangent).setPoints([point]);
                }
            }
            return null;
        }
        if (other instanceof line_1.Line) {
            // flip so this -> other
            var c = (_a = other.collide(this, contact)) !== null && _a !== void 0 ? _a : null;
            return c;
        }
        return null;
    };
    /**
     * Apply impulse at a point
     * @param point
     * @param impulse
     * @returns
     */
    Circle.prototype.applyImpulse = function (point, impulse) {
        if (this.static) {
            return;
        }
        var distanceFromCenter = point.sub(this.xf.pos);
        this.m.vel = this.m.vel.add(impulse.scale(this.inverseMass));
        this.m.angularVelocity += this.inverseInertia * distanceFromCenter.cross(impulse);
    };
    return Circle;
}(collider_1.Collider));
exports.Circle = Circle;


/***/ }),

/***/ "./collider.ts":
/*!*********************!*\
  !*** ./collider.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Collider = void 0;
var transform_1 = __webpack_require__(/*! ./transform */ "./transform.ts");
var Collider = /** @class */ (function () {
    function Collider() {
        this.id = Collider._ID++;
        this.static = false;
        this.mass = 1;
        this.bounciness = 0.1;
        this.friction = .99;
        this.xf = new transform_1.Transform();
        this.m = new transform_1.Motion();
    }
    Object.defineProperty(Collider.prototype, "inverseMass", {
        get: function () {
            return this.static ? 0 : 1 / this.mass;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Collider.prototype, "inertia", {
        get: function () {
            return this.mass;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Collider.prototype, "inverseInertia", {
        get: function () {
            return this.static ? 0 : 1 / this.inertia;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Apply impulse at a point
     * @param point
     * @param impulse
     * @returns
     */
    Collider.prototype.applyImpulse = function (point, impulse) {
        if (this.static) {
            return;
        }
        var distanceFromCenter = point.sub(this.xf.pos);
        this.m.vel = this.m.vel.add(impulse.scale(this.inverseMass));
        this.m.angularVelocity += this.inverseInertia * distanceFromCenter.cross(impulse);
    };
    Collider.prototype.applyLinearImpulse = function (impulse) {
        if (this.static) {
            return;
        }
        this.m.vel = this.m.vel.add(impulse.scale(this.inverseMass));
    };
    Collider.prototype.applyAngularImpulse = function (point, impulse) {
        if (this.static) {
            return;
        }
        var distanceFromCenter = point.sub(this.xf.pos);
        this.m.angularVelocity += this.inverseInertia * distanceFromCenter.cross(impulse);
    };
    Collider._ID = 0;
    return Collider;
}());
exports.Collider = Collider;


/***/ }),

/***/ "./contact.ts":
/*!********************!*\
  !*** ./contact.ts ***!
  \********************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Contact = exports.ContactPoint = void 0;
var circle_1 = __webpack_require__(/*! ./circle */ "./circle.ts");
var line_1 = __webpack_require__(/*! ./line */ "./line.ts");
var vector_1 = __webpack_require__(/*! ./vector */ "./vector.ts");
/**
 * Holds information about contact points, meant to be reused over multiple frames of contact
 */
var ContactPoint = /** @class */ (function () {
    function ContactPoint(point, contact) {
        this.point = point;
        this.contact = contact;
        /**
         * Impulse accumulated over time in normal direction
         */
        this.normalImpulse = 0;
        /**
         * Impulse accumulated over time in the tangent direction
         */
        this.tangentImpulse = 0;
        /**
         * Effective mass seen in the normal direction
         */
        this.normalMass = 0;
        /**
         * Effective mass seen in the tangent direction
         */
        this.tangentMass = 0;
        /**
         * Direction from center of mass of bodyA to contact point
         */
        this.aToContact = new vector_1.Vector(0, 0);
        /**
         * Direction from center of mass of bodyB to contact point
         */
        this.bToContact = new vector_1.Vector(0, 0);
        this.update();
    }
    ContactPoint.prototype.update = function () {
        var bodyA = this.contact.bodyA;
        var bodyB = this.contact.bodyB;
        var normal = this.contact.normal;
        var tangent = this.contact.tangent;
        this.aToContact = this.point.sub(bodyA.xf.pos);
        this.bToContact = this.point.sub(bodyB.xf.pos);
        var aToContactNormal = this.aToContact.cross(normal);
        var bToContactNormal = this.bToContact.cross(normal);
        this.normalMass = bodyA.inverseMass + bodyB.inverseMass +
            bodyA.inverseInertia * aToContactNormal * aToContactNormal +
            bodyB.inverseInertia * bToContactNormal * bToContactNormal;
        var aToContactTangent = this.aToContact.cross(tangent);
        var bToContactTangent = this.bToContact.cross(tangent);
        this.tangentMass = bodyA.inverseMass + bodyB.inverseMass +
            bodyA.inverseInertia * aToContactTangent * aToContactTangent +
            bodyB.inverseInertia * bToContactTangent * bToContactTangent;
        return this;
    };
    ContactPoint.prototype.getRelativeVelocity = function () {
        var bodyA = this.contact.bodyA;
        var bodyB = this.contact.bodyB;
        // Relative velocity in linear terms
        // Angular to linear velocity formula -> omega = velocity/radius so omega x radius = velocity
        var vel = bodyB.m.vel.add(vector_1.cross(bodyB.m.angularVelocity, this.bToContact)).sub(bodyA.m.vel.sub(vector_1.cross(bodyA.m.angularVelocity, this.aToContact)));
        return vel;
    };
    return ContactPoint;
}());
exports.ContactPoint = ContactPoint;
/**
 * Represents contact between two rigid bodies
 *
 * Meant to be re-used over multiple frames
 */
var Contact = /** @class */ (function () {
    function Contact(bodyA, bodyB, normal, tangent) {
        this.bodyA = bodyA;
        this.bodyB = bodyB;
        this.normal = normal;
        this.tangent = tangent;
        this._points = [];
    }
    Object.defineProperty(Contact.prototype, "id", {
        /**
         * The unique id between 2 bodies
         */
        get: function () {
            return Contact.GetId(this.bodyA, this.bodyB);
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Get the id of 2 bodies
     * @param bodyA
     * @param bodyB
     * @returns
     */
    Contact.GetId = function (bodyA, bodyB) {
        if (bodyA.id < bodyB.id) {
            return bodyA.id + "+" + bodyB.id;
        }
        else {
            return bodyB.id + "+" + bodyA.id;
        }
    };
    /**
     * Returns the separation in this contact (negative)
     * @returns
     */
    Contact.prototype.getSeparation = function () {
        if (this.bodyA instanceof circle_1.Circle && this.bodyB instanceof circle_1.Circle) {
            var combinedRadius = this.bodyA.radius + this.bodyB.radius;
            var distance = this.bodyA.xf.pos.distance(this.bodyB.xf.pos);
            var separation = combinedRadius - distance;
            return -separation;
        }
        if (this.bodyA instanceof circle_1.Circle && this.bodyB instanceof line_1.Line) {
            return this.bodyB.getSeparation(this.bodyA);
        }
        if (this.bodyA instanceof line_1.Line && this.bodyB instanceof circle_1.Circle) {
            return this.bodyA.getSeparation(this.bodyB);
        }
        return 0;
    };
    Contact.prototype.setPoints = function (points) {
        var _this = this;
        this._points = points.map(function (p) {
            return new ContactPoint(p, _this).update();
        });
        return this;
    };
    Contact.prototype.updatePoints = function (points) {
        this._points.forEach(function (p, i) {
            p.point = points[i];
            p.update();
        });
        return this;
    };
    Object.defineProperty(Contact.prototype, "points", {
        get: function () {
            return this._points;
        },
        enumerable: false,
        configurable: true
    });
    return Contact;
}());
exports.Contact = Contact;


/***/ }),

/***/ "./line.ts":
/*!*****************!*\
  !*** ./line.ts ***!
  \*****************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Line = void 0;
var circle_1 = __webpack_require__(/*! ./circle */ "./circle.ts");
var collider_1 = __webpack_require__(/*! ./collider */ "./collider.ts");
var contact_1 = __webpack_require__(/*! ./contact */ "./contact.ts");
var Line = /** @class */ (function (_super) {
    __extends(Line, _super);
    function Line(begin, end) {
        var _this = _super.call(this) || this;
        _this.begin = begin;
        _this.end = end;
        _this.static = true;
        _this.xf.pos = begin.add(end).scale(.5);
        return _this;
    }
    Line.prototype.getSeparation = function (other) {
        // center of the circle
        var cc = other.xf.pos;
        // vector in the direction of the edge
        var e = this.end.sub(this.begin);
        // amount of overlap with the circle's center along the edge direction
        var u = e.dot(this.end.sub(cc));
        var v = e.dot(cc.sub(this.begin));
        var den = e.dot(e);
        var pointOnEdge = this.begin
            .scale(u)
            .add(this.end.scale(v))
            .scale(1 / den);
        var d = cc.sub(pointOnEdge);
        var dd = d.dot(d);
        var sep = -Math.abs(other.radius - Math.sqrt(dd));
        return sep;
    };
    Line.prototype.collide = function (other, contact) {
        if (other instanceof circle_1.Circle) {
            // center of the circle
            var cc = other.xf.pos;
            // vector in the direction of the edge
            var e = this.end.sub(this.begin);
            // amount of overlap with the circle's center along the edge direction
            var u = e.dot(this.end.sub(cc));
            var v = e.dot(cc.sub(this.begin));
            // Potential region A collision (circle is on the left side of the edge, before the beginning)
            if (v <= 0) {
                var da = this.begin.sub(cc);
                var dda = da.dot(da); // quick and dirty way of calc'n distance in r^2 terms saves some sqrts
                // save some sqrts
                if (dda > other.radius * other.radius) {
                    return null; // no collision
                }
                // RETURN CONTACT
                var separation = da.normalize().scale(other.radius - Math.sqrt(dda));
                var normal = da.normalize();
                if (contact) {
                    contact.bodyA = other;
                    contact.bodyB = this;
                    contact.normal = normal;
                    contact.tangent = normal.perpendicular();
                    contact.updatePoints([this.begin]);
                    return contact;
                }
                return new contact_1.Contact(other, this, normal, normal.perpendicular()).setPoints([this.begin]);
            }
            // Potential region B collision (circle is on the right side of the edge, after the end)
            if (u <= 0) {
                var db = this.end.sub(cc);
                var ddb = db.dot(db);
                if (ddb > other.radius * other.radius) {
                    return null;
                }
                // RETURN CONTACT
                var separation = db.normalize().scale(other.radius - Math.sqrt(ddb));
                var normal = db.normalize();
                if (contact) {
                    contact.bodyA = other;
                    contact.bodyB = this;
                    contact.normal = normal;
                    contact.tangent = normal.perpendicular();
                    contact.updatePoints([this.end]);
                    return contact;
                }
                return new contact_1.Contact(other, this, normal, normal.perpendicular()).setPoints([this.end]);
            }
            // Otherwise potential region AB collision (circle is in the middle of the edge between the beginning and end)
            var den = e.dot(e);
            var pointOnEdge = this.begin
                .scale(u)
                .add(this.end.scale(v))
                .scale(1 / den);
            var d = cc.sub(pointOnEdge);
            var dd = d.dot(d);
            if (dd > other.radius * other.radius) {
                return null; // no collision
            }
            var n = e.perpendicular();
            // flip correct direction
            if (n.dot(cc.sub(this.begin)) < 0) {
                n.x = -n.x;
                n.y = -n.y;
            }
            n = n.normalize();
            var mvt = n.scale(Math.abs(other.radius - Math.sqrt(dd)));
            // RETURN CONTACT
            if (contact) {
                contact.bodyA = this;
                contact.bodyB = other;
                contact.normal = n;
                contact.tangent = n.perpendicular();
                contact.updatePoints([pointOnEdge]);
                return contact;
            }
            return new contact_1.Contact(this, other, n, n.perpendicular()).setPoints([pointOnEdge]);
        }
        return null;
    };
    return Line;
}(collider_1.Collider));
exports.Line = Line;


/***/ }),

/***/ "./math.ts":
/*!*****************!*\
  !*** ./math.ts ***!
  \*****************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.shuffle = exports.assert = exports.clamp = void 0;
var clamp = function (val, min, max) {
    return Math.max(Math.min(val, max), min);
};
exports.clamp = clamp;
var assert = function (shouldBeTrue, message) {
    if (!shouldBeTrue) {
        throw new Error(message);
    }
};
exports.assert = assert;
var shuffle = function (list) {
    // knuth shuffle
    var currentIndex = list.length;
    var randomIndex = 0;
    var tmp = null;
    while (currentIndex > 0) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        // And swap it with the current element.
        tmp = list[currentIndex];
        list[currentIndex] = list[randomIndex];
        list[randomIndex] = tmp;
    }
    return list;
};
exports.shuffle = shuffle;


/***/ }),

/***/ "./solver.ts":
/*!*******************!*\
  !*** ./solver.ts ***!
  \*******************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Solver = void 0;
var math_1 = __webpack_require__(/*! ./math */ "./math.ts");
var Solver = /** @class */ (function () {
    function Solver() {
    }
    Solver.prototype.warmStart = function (contacts) {
        for (var _i = 0, contacts_1 = contacts; _i < contacts_1.length; _i++) {
            var contact = contacts_1[_i];
            for (var _a = 0, _b = contact.points; _a < _b.length; _a++) {
                var point = _b[_a];
                var normalImpulse = contact.normal.scale(point.normalImpulse);
                // Scaling back the tangent impulse seems to increase stack stability?
                var tangentImpulse = contact.tangent.scale(point.tangentImpulse).scale(.2);
                var impulse = normalImpulse.add(tangentImpulse);
                // contact.bodyA.applyImpulse(point.point, impulse.negate());
                // contact.bodyB.applyImpulse(point.point, impulse);
                contact.bodyA.applyLinearImpulse(normalImpulse.negate());
                contact.bodyA.applyAngularImpulse(point.point, tangentImpulse.negate());
                contact.bodyB.applyLinearImpulse(normalImpulse);
                contact.bodyB.applyAngularImpulse(point.point, tangentImpulse);
            }
        }
    };
    /**
     * Iteratively solve the position overlap constraint
     * @param contacts
     */
    Solver.prototype.solvePosition = function (contacts) {
        for (var _i = 0, contacts_2 = contacts; _i < contacts_2.length; _i++) {
            var contact = contacts_2[_i];
            for (var _a = 0, _b = contact.points; _a < _b.length; _a++) {
                var point = _b[_a];
                var bodyA = contact.bodyA;
                var bodyB = contact.bodyB;
                var normal = contact.normal;
                var separation = contact.getSeparation();
                var steeringConstant = 0.2;
                var maxCorrection = -5;
                var slop = 1;
                // Clamp to avoid over-correction
                // Remember that we are shooting for 0 overlap in the end
                var steeringForce = math_1.clamp(steeringConstant * (separation + slop), maxCorrection, 0);
                var impulse = normal.scale(-steeringForce / point.normalMass);
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
    };
    Solver.prototype.solveVelocity = function (contacts) {
        for (var _i = 0, contacts_3 = contacts; _i < contacts_3.length; _i++) {
            var contact = contacts_3[_i];
            var bodyA = contact.bodyA;
            var bodyB = contact.bodyB;
            var restitution = bodyA.bounciness * bodyB.bounciness;
            var friction = Math.min(bodyA.friction, bodyB.friction);
            for (var _a = 0, _b = contact.points; _a < _b.length; _a++) {
                var point = _b[_a];
                var relativeVelocity = point.getRelativeVelocity();
                // Negate velocity in tangent direction to simulate friction
                var tangentVelocity = -relativeVelocity.dot(contact.tangent);
                var impulseDelta = tangentVelocity / point.tangentMass;
                // Clamping based in Erin Catto's GDC 2006 talk
                // Correct clamping https://github.com/erincatto/box2d-lite/blob/master/docs/GDC2006_Catto_Erin_PhysicsTutorial.pdf
                // Accumulated fiction impulse is always between -uMaxFriction < dT < uMaxFriction
                // But deltas can vary
                var maxFriction = friction * point.normalImpulse;
                var newImpulse = math_1.clamp(point.tangentImpulse + impulseDelta, -maxFriction, maxFriction);
                impulseDelta = newImpulse - point.tangentImpulse;
                point.tangentImpulse = newImpulse;
                var impulse = contact.tangent.scale(impulseDelta);
                bodyA.applyImpulse(point.point, impulse.negate());
                bodyB.applyImpulse(point.point, impulse);
            }
            for (var _c = 0, _d = contact.points; _c < _d.length; _c++) {
                var point = _d[_c];
                // Need to recalc relative velocity because the previous step could have changed vel
                var relativeVelocity = point.getRelativeVelocity();
                // Compute impulse in normal direction
                var normalVelocity = relativeVelocity.dot(contact.normal);
                // See https://en.wikipedia.org/wiki/Collision_response
                var impulseDelta = (-(1 + restitution) * normalVelocity) / point.normalMass;
                // Clamping based in Erin Catto's GDC 2014 talk
                // Accumulated impulse stored in the contact is always positive (dV > 0)
                // But deltas can be negative
                var newImpulse = Math.max(point.normalImpulse + impulseDelta, 0);
                impulseDelta = newImpulse - point.normalImpulse;
                point.normalImpulse = newImpulse;
                var impulse = contact.normal.scale(impulseDelta);
                bodyA.applyImpulse(point.point, impulse.negate());
                bodyB.applyImpulse(point.point, impulse);
            }
        }
    };
    return Solver;
}());
exports.Solver = Solver;


/***/ }),

/***/ "./transform.ts":
/*!**********************!*\
  !*** ./transform.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Motion = exports.Transform = void 0;
var vector_1 = __webpack_require__(/*! ./vector */ "./vector.ts");
var Transform = /** @class */ (function () {
    function Transform() {
        this.pos = new vector_1.Vector(0, 0);
        this.rotation = 0;
    }
    return Transform;
}());
exports.Transform = Transform;
var Motion = /** @class */ (function () {
    function Motion() {
        this.vel = new vector_1.Vector(0, 0);
        this.acc = new vector_1.Vector(0, 0);
        this.angularVelocity = 0;
    }
    return Motion;
}());
exports.Motion = Motion;


/***/ }),

/***/ "./vector.ts":
/*!*******************!*\
  !*** ./vector.ts ***!
  \*******************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.cross = exports.Vector = void 0;
var Vector = /** @class */ (function () {
    function Vector(x, y) {
        this.x = x;
        this.y = y;
    }
    Vector.prototype.distance = function (other) {
        var dx = this.x - other.x;
        var dy = this.y - other.y;
        return Math.sqrt(dx * dx + dy * dy);
    };
    Vector.prototype.normalize = function () {
        var d = this.distance(new Vector(0, 0));
        return new Vector(this.x / d, this.y / d);
    };
    Vector.prototype.size = function () {
        return this.distance(new Vector(0, 0));
    };
    Vector.prototype.scale = function (val) {
        return new Vector(this.x * val, this.y * val);
    };
    Vector.prototype.negate = function () {
        return this.scale(-1);
    };
    /**
     * Returns the perpendicular vector to this one
     */
    Vector.prototype.perpendicular = function () {
        return new Vector(this.y, -this.x);
    };
    /**
     * Returns the normal vector to this one, same as the perpendicular of length 1
     */
    Vector.prototype.normal = function () {
        return this.perpendicular().normalize();
    };
    Vector.prototype.dot = function (other) {
        return this.x * other.x + this.y * other.y;
    };
    Vector.prototype.cross = function (v) {
        if (v instanceof Vector) {
            return this.x * v.y - this.y * v.x;
        }
        else {
            return new Vector(v * this.y, -v * this.x);
        }
    };
    Vector.prototype.add = function (other) {
        return new Vector(this.x + other.x, this.y + other.y);
    };
    /**
     * Creates a vector in the direcion of `other` -> `this`
     * @param other
     * @returns
     */
    Vector.prototype.sub = function (other) {
        return new Vector(this.x - other.x, this.y - other.y);
    };
    return Vector;
}());
exports.Vector = Vector;
var cross = function (num, vec) {
    return new Vector(-num * vec.y, num * vec.x);
};
exports.cross = cross;


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
/*!*****************!*\
  !*** ./main.ts ***!
  \*****************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
var circle_1 = __webpack_require__(/*! ./circle */ "./circle.ts");
var contact_1 = __webpack_require__(/*! ./contact */ "./contact.ts");
var line_1 = __webpack_require__(/*! ./line */ "./line.ts");
var math_1 = __webpack_require__(/*! ./math */ "./math.ts");
var solver_1 = __webpack_require__(/*! ./solver */ "./solver.ts");
var vector_1 = __webpack_require__(/*! ./vector */ "./vector.ts");
var canvas = document.createElement('canvas');
canvas.width = 800;
canvas.height = 600;
var ctx = canvas.getContext('2d');
document.body.appendChild(canvas);
var gui = new dat.GUI({ name: 'Iterative Solver' });
var flags = {
    "Debug": true,
    "Warming": true,
    "Position Iterations": 2,
    "Velocity Iterations": 8,
    "Gravity Value": 400,
    "Gravity": false
};
for (var key in flags) {
    if (typeof flags[key] === 'number') {
        gui.add(flags, key, 0, 20, 1);
    }
    if (typeof flags[key] === 'boolean') {
        gui.add(flags, key);
    }
}
var entities = [
    new line_1.Line(new vector_1.Vector(50, 550), new vector_1.Vector(750, 550)),
    new line_1.Line(new vector_1.Vector(100, 100), new vector_1.Vector(300, 650)),
    new line_1.Line(new vector_1.Vector(500, 650), new vector_1.Vector(700, 100)),
    new circle_1.Circle(40, new vector_1.Vector(canvas.width / 2, 400)),
    // new Circle(40, new Vector(canvas.width / 2, 300)),
    // new Circle(40, new Vector(canvas.width / 2, 200)),
    // new Circle(40, new Vector(canvas.width / 2, 100)),
    // new Circle(40, new Vector(canvas.width / 2, 0)),
    // new Circle(40, new Vector(canvas.width / 2, -100)),
    // new Circle(40, new Vector(canvas.width / 2, -200)),
];
entities[3].m.angularVelocity = 1;
// entities.reverse();
math_1.shuffle(entities);
window.entities = entities;
var solver = new solver_1.Solver();
var contacts = [];
var lastFrameContacts = new Map();
var update = function (elapsed) {
    var acc = new vector_1.Vector(0, 0);
    if (flags['Gravity']) {
        acc = new vector_1.Vector(0, flags['Gravity Value']);
    }
    // Integrate motion
    for (var _i = 0, entities_1 = entities; _i < entities_1.length; _i++) {
        var circle = entities_1[_i];
        if (!circle.static) {
            circle.m.vel = circle.m.vel.add(acc.scale(elapsed));
            circle.m.angularVelocity = math_1.clamp(circle.m.angularVelocity, -Math.PI, Math.PI);
        }
    }
    // Naive descrete collision detection
    // We re-use contacts from the previous frame if they exist
    contacts = [];
    for (var i = 0; i < entities.length; i++) {
        for (var j = i + 1; j < entities.length; j++) {
            var circleA = entities[i];
            var circleB = entities[j];
            var lastFrame = lastFrameContacts.get(contact_1.Contact.GetId(circleA, circleB));
            var contact = circleA.collide(circleB, lastFrame);
            if (contact) {
                contacts.push(contact);
            }
        }
    }
    // Warm start impulses for velocity constraint
    // This helps with simulation coherence by reusing work from previous frames
    // Practically this will cancel gravity on big stacks
    if (flags["Warming"]) {
        solver.warmStart(contacts);
    }
    else {
        for (var _a = 0, contacts_1 = contacts; _a < contacts_1.length; _a++) {
            var contact = contacts_1[_a];
            for (var _b = 0, _c = contact.points; _b < _c.length; _b++) {
                var point = _c[_b];
                point.normalImpulse = 0;
                point.tangentImpulse = 0;
            }
        }
    }
    // The velocity constraint is that no contacts are moving relative to each other along the normal
    // in other words relative velocity between contacts should approach 0 on the normal
    for (var i = 0; i < flags['Velocity Iterations']; i++) {
        solver.solveVelocity(contacts);
    }
    // Integrate positions
    for (var _d = 0, entities_2 = entities; _d < entities_2.length; _d++) {
        var circle = entities_2[_d];
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
    for (var i = 0; i < flags['Position Iterations']; i++) {
        solver.solvePosition(contacts);
    }
    // Store contacts
    lastFrameContacts.clear();
    contacts.forEach(function (c) { return lastFrameContacts.set(c.id, c); });
};
var draw = function (elapsed) {
    ctx.save();
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (var _i = 0, entities_3 = entities; _i < entities_3.length; _i++) {
        var e = entities_3[_i];
        if (e instanceof circle_1.Circle) {
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
            ctx.beginPath();
            ctx.strokeStyle = 'black';
            ctx.moveTo(0, 0);
            ctx.lineTo(0 + e.radius, 0);
            ctx.closePath();
            ctx.stroke();
            ctx.restore();
        }
        if (e instanceof line_1.Line) {
            ctx.save();
            ctx.beginPath();
            ctx.strokeStyle = 'green';
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
        for (var _a = 0, contacts_2 = contacts; _a < contacts_2.length; _a++) {
            var contact = contacts_2[_a];
            for (var _b = 0, _c = contact.points; _b < _c.length; _b++) {
                var p = _c[_b];
                ctx.beginPath();
                ctx.strokeStyle = 'yellow';
                ctx.arc(p.point.x, p.point.y, 5, 0, Math.PI * 2);
                ctx.closePath();
                ctx.stroke();
                ctx.beginPath();
                ctx.strokeStyle = 'red';
                ctx.moveTo(p.point.x, p.point.y);
                ctx.lineTo(p.point.x + contact.normal.x * 10, p.point.y + contact.normal.y * 10);
                ctx.closePath();
                ctx.stroke();
                ctx.fillStyle = 'yellow';
                ctx.fillText('N- ' + p.normalImpulse.toFixed(1), p.point.x + 10, p.point.y);
                ctx.fillText('T- ' + p.tangentImpulse.toFixed(1), p.point.x + 10, p.point.y + 10);
            }
        }
        for (var _d = 0, entities_4 = entities; _d < entities_4.length; _d++) {
            var circle = entities_4[_d];
            ctx.beginPath();
            ctx.strokeStyle = 'green';
            ctx.moveTo(circle.xf.pos.x, circle.xf.pos.y);
            ctx.lineTo(circle.xf.pos.x + circle.m.vel.x, circle.xf.pos.y + circle.m.vel.y);
            ctx.closePath();
            ctx.stroke();
        }
    }
    ctx.restore();
};
var singleStep = false;
var lastMs = 0;
var mainloop = function (currentMs) {
    if (singleStep) {
        return;
    }
    var seconds = (currentMs - lastMs) / 1000;
    if (seconds > .1) {
        seconds = .016;
    }
    update(seconds);
    draw(seconds);
    lastMs = currentMs;
    requestAnimationFrame(mainloop);
};
mainloop(.016);
document.addEventListener('keydown', function (ev) {
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
    if (ev.code === 'KeyB') {
        entities.push(new circle_1.Circle(40, new vector_1.Vector(canvas.width / 2, 0)));
    }
});

})();

/******/ })()
;
//# sourceMappingURL=main.js.map