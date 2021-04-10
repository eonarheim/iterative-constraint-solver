/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./box.ts":
/*!****************!*\
  !*** ./box.ts ***!
  \****************/
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
exports.Box = void 0;
var circle_1 = __webpack_require__(/*! ./circle */ "./circle.ts");
var collider_1 = __webpack_require__(/*! ./collider */ "./collider.ts");
var line_1 = __webpack_require__(/*! ./line */ "./line.ts");
var separating_axis_1 = __webpack_require__(/*! ./separating-axis */ "./separating-axis.ts");
var vector_1 = __webpack_require__(/*! ./vector */ "./vector.ts");
var Box = /** @class */ (function (_super) {
    __extends(Box, _super);
    function Box(width, height, pos) {
        var _this = _super.call(this) || this;
        _this.width = width;
        _this.height = height;
        _this.xf.pos = pos;
        _this.mass = 1;
        return _this;
    }
    Object.defineProperty(Box.prototype, "localPoints", {
        get: function () {
            var halfHeight = this.height / 2;
            var halfWidth = this.width / 2;
            var points = [
                new vector_1.Vector(-halfWidth, -halfHeight),
                new vector_1.Vector(halfWidth, -halfHeight),
                new vector_1.Vector(halfWidth, halfHeight),
                new vector_1.Vector(-halfWidth, halfHeight)
            ];
            return points;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Box.prototype, "points", {
        get: function () {
            var pos = this.xf.pos;
            var rot = this.xf.rotation;
            var halfHeight = this.height / 2;
            var halfWidth = this.width / 2;
            var points = [
                pos.add(new vector_1.Vector(-halfWidth, -halfHeight)),
                pos.add(new vector_1.Vector(halfWidth, -halfHeight)),
                pos.add(new vector_1.Vector(halfWidth, halfHeight)),
                pos.add(new vector_1.Vector(-halfWidth, halfHeight))
            ].map(function (p) { return p.rotate(rot, pos); });
            return points;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Box.prototype, "inverseMass", {
        get: function () {
            return this.static ? 0 : 1 / this.mass;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Box.prototype, "inertia", {
        get: function () {
            // https://en.wikipedia.org/wiki/List_of_moments_of_inertia
            return (this.mass / 12) * (this.width + this.height * this.height);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Box.prototype, "inverseInertia", {
        get: function () {
            return this.static ? 0 : 1 / this.inertia;
        },
        enumerable: false,
        configurable: true
    });
    Box.prototype.collide = function (other) {
        if (other instanceof circle_1.Circle) {
            return separating_axis_1.SeparatingAxis.findCircleBoxContact(other, this);
        }
        if (other instanceof Box) {
            return separating_axis_1.SeparatingAxis.findBoxBoxContact(this, other);
        }
        if (other instanceof line_1.Line) {
            null; // TODO line
        }
        return null;
    };
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
    Box.prototype.getSide = function (index) {
        var pts = this.points;
        var len = this.points.length;
        return [pts[index], pts[(index + 1) % len]];
    };
    Box.prototype.getLocalSide = function (index) {
        var pts = this.localPoints;
        var len = this.localPoints.length;
        return [pts[index], pts[(index + 1) % len]];
    };
    /**
     * Find the point on the shape furthest in the direction specified
     */
    Box.prototype.getFurthestPoint = function (direction) {
        var pts = this.points;
        var furthestPoint = pts[0];
        var maxDistance = -Number.MAX_VALUE;
        for (var i = 0; i < pts.length; i++) {
            var distance = direction.dot(pts[i]);
            if (distance > maxDistance) {
                maxDistance = distance;
                furthestPoint = pts[i];
            }
        }
        return furthestPoint;
    };
    Box.prototype.getFurthestLocalPoint = function (direction) {
        var pts = this.localPoints;
        var furthestPoint = pts[0];
        var maxDistance = -Number.MAX_VALUE;
        for (var i = 0; i < pts.length; i++) {
            var distance = direction.dot(pts[i]);
            if (distance > maxDistance) {
                maxDistance = distance;
                furthestPoint = pts[i];
            }
        }
        return furthestPoint;
    };
    Box.prototype.findSide = function (direction) {
        var bestSide = this.getSide(0);
        var maxDistance = -Number.MAX_VALUE;
        for (var side = 0; side < 4; side++) {
            var currentSide = this.getSide(side);
            var sideNormal = currentSide[1].sub(currentSide[0]).normal();
            var mostDirection = sideNormal.dot(direction);
            if (mostDirection > maxDistance) {
                bestSide = currentSide;
                maxDistance = mostDirection;
            }
        }
        return bestSide;
    };
    Box.prototype.findLocalSide = function (direction) {
        var bestSide = this.getLocalSide(0);
        var maxDistance = -Number.MAX_VALUE;
        for (var side = 0; side < 4; side++) {
            var currentSide = this.getLocalSide(side);
            var sideNormal = currentSide[1].sub(currentSide[0]).normal();
            var mostDirection = sideNormal.dot(direction);
            if (mostDirection > maxDistance) {
                bestSide = currentSide;
                maxDistance = mostDirection;
            }
        }
        return bestSide;
    };
    Box.prototype.draw = function (ctx, flags) {
        for (var side = 0; side < 4; side++) {
            var currentSide = this.getSide(side);
            ctx.save();
            ctx.beginPath();
            ctx.strokeStyle = 'green';
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
    };
    return Box;
}(collider_1.Collider));
exports.Box = Box;


/***/ }),

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
var box_1 = __webpack_require__(/*! ./box */ "./box.ts");
var collider_1 = __webpack_require__(/*! ./collider */ "./collider.ts");
var line_1 = __webpack_require__(/*! ./line */ "./line.ts");
var separating_axis_1 = __webpack_require__(/*! ./separating-axis */ "./separating-axis.ts");
var Circle = /** @class */ (function (_super) {
    __extends(Circle, _super);
    function Circle(radius, pos) {
        var _this = _super.call(this) || this;
        _this.radius = radius;
        _this.xf.pos = pos;
        _this.mass = 1;
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
        if (other instanceof Circle) {
            return separating_axis_1.SeparatingAxis.findCircleCircleContact(this, other);
        }
        if (other instanceof box_1.Box) {
            return separating_axis_1.SeparatingAxis.findCircleBoxContact(this, other);
        }
        if (other instanceof line_1.Line) {
            return other.collide(this);
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
    /**
     * Find the point on the shape furthest in the direction specified
     */
    Circle.prototype.getFurthestPoint = function (direction) {
        var dir = direction.normalize();
        return this.xf.pos.add(dir.scale(this.radius));
    };
    Circle.prototype.getFurthestLocalPoint = function (direction) {
        var dir = direction.normalize();
        return dir.scale(this.radius);
    };
    Circle.prototype.draw = function (ctx, flags) {
        ctx.beginPath();
        ctx.fillStyle = 'blue';
        ctx.arc(this.xf.pos.x, this.xf.pos.y, this.radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
        if (flags["Debug"]) {
            ctx.fillStyle = 'yellow';
            ctx.fillText('id: ' + this.id, this.xf.pos.x, this.xf.pos.y);
        }
        ctx.save();
        ctx.translate(this.xf.pos.x, this.xf.pos.y);
        ctx.rotate(this.xf.rotation);
        ctx.beginPath();
        ctx.strokeStyle = 'black';
        ctx.moveTo(0, 0);
        ctx.lineTo(0 + this.radius, 0);
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
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
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Contact = void 0;
/**
 * Represents contact between two rigid bodies
 *
 * Meant to be re-used over multiple frames
 */
var Contact = /** @class */ (function () {
    function Contact(bodyA, bodyB, 
    /**
     * Normals point away from bodyA
     */
    normal, 
    /**
     * Tangent to collision normal
     */
    tangent, 
    // TODO should this just be part of contact?
    info, 
    /**
     * World space contact points
     */
    points, 
    /**
     * Local space contact points
     */
    locals) {
        if (points === void 0) { points = []; }
        if (locals === void 0) { locals = []; }
        this.bodyA = bodyA;
        this.bodyB = bodyB;
        this.normal = normal;
        this.tangent = tangent;
        this.info = info;
        this.points = points;
        this.locals = locals;
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
                var info_1 = {
                    collider: other,
                    separation: other.radius - Math.sqrt(dda),
                    axis: normal,
                    point: this.begin
                };
                return new contact_1.Contact(other, this, normal, normal.perpendicular(), info_1, [this.begin]);
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
                var info_2 = {
                    collider: other,
                    separation: other.radius - Math.sqrt(ddb),
                    axis: normal,
                    point: this.end
                };
                return new contact_1.Contact(other, this, normal, normal.perpendicular(), info_2, [this.end]);
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
            var info = {
                collider: other,
                separation: other.radius - Math.sqrt(dd),
                axis: n,
                point: this.begin
            };
            // RETURN CONTACT
            return new contact_1.Contact(this, other, n, n.perpendicular(), info, [pointOnEdge]);
        }
        return null;
    };
    Line.prototype.draw = function (ctx, flags) {
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = 'green';
        ctx.moveTo(this.begin.x, this.begin.y);
        ctx.lineTo(this.end.x, this.end.y);
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
        if (flags["Debug"]) {
            ctx.fillStyle = 'yellow';
            ctx.fillText('id: ' + this.id, this.xf.pos.x, this.xf.pos.y);
        }
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

/***/ "./separating-axis.ts":
/*!****************************!*\
  !*** ./separating-axis.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SeparatingAxis = void 0;
var contact_1 = __webpack_require__(/*! ./contact */ "./contact.ts");
var SeparatingAxis = /** @class */ (function () {
    function SeparatingAxis() {
    }
    SeparatingAxis.findBoxBoxSeparation = function (boxA, boxB) {
        var bestSeparation = -Number.MAX_VALUE;
        var bestSide = null;
        var bestAxis = null;
        var bestSideIndex = -1;
        var bestOtherPoint = null;
        for (var i = 0; i < 4; i++) {
            var side = boxA.getSide(i);
            var axis = side[1].sub(side[0]).normal();
            var vertB = boxB.getFurthestPoint(axis.negate());
            // Separation on side i's axis
            var vertSeparation = SeparatingAxis.distanceToPoint(side[0], side[1], vertB, true);
            if (vertSeparation > bestSeparation) {
                bestSeparation = vertSeparation;
                bestSide = side;
                bestAxis = axis;
                bestSideIndex = i;
                bestOtherPoint = vertB;
            }
        }
        return {
            collider: boxA,
            separation: bestSeparation,
            axis: bestAxis,
            side: bestSide,
            localSide: boxA.getLocalSide(bestSideIndex),
            sideId: bestSideIndex,
            point: bestOtherPoint,
            localPoint: boxB.getFurthestLocalPoint(bestAxis.negate())
        };
    };
    SeparatingAxis.findBoxBoxContact = function (boxA, boxB) {
        var separationA = SeparatingAxis.findBoxBoxSeparation(boxA, boxB);
        // If there is no overlap from boxA's perspective we can end early
        if (separationA.separation > 0) {
            return null;
        }
        var separationB = SeparatingAxis.findBoxBoxSeparation(boxB, boxA);
        // If there is no overlap from boxB's perspective exit now
        if (separationB.separation > 0) {
            return null;
        }
        // Separations are both negative, we want to pick the least negative (minimal movement)
        var separation = separationA.separation > separationB.separation ? separationA : separationB;
        // The incident side is the most opposite from the axes of collision on the other shape
        var other = separation.collider === boxA ? boxB : boxA;
        var incident = other.findSide(separation.axis.negate());
        // Clip incident side by the perpendicular lines at each end of the reference side
        // https://en.wikipedia.org/wiki/Sutherland%E2%80%93Hodgman_algorithm
        var reference = separation.side;
        var refDir = reference[1].sub(reference[0]).normalize();
        // Find our contact points by clipping the incident by the collision side
        var clipRight = SeparatingAxis._clip(incident[0], incident[1], refDir.negate(), -refDir.dot(reference[0]));
        var clipLeft = null;
        if (clipRight) {
            clipLeft = SeparatingAxis._clip(clipRight[0], clipRight[1], refDir, refDir.dot(reference[1]));
        }
        if (clipLeft) {
            // We only want clip points below the reference edge, discard the others
            var points = clipLeft.filter(function (p) {
                return SeparatingAxis._below(reference[0], reference[1], p);
            });
            var normal = separation.axis;
            var tangent = normal.perpendicular();
            // Point Contact A -> B
            if (boxB.xf.pos.sub(boxA.xf.pos).dot(normal) < 0) {
                normal = normal.negate();
                tangent = normal.perpendicular();
            }
            // Points are clipped from incident which is the other collider
            // Store those as locals
            var localPoints = [];
            if (separation.collider === boxA) {
                localPoints = points.map(function (p) { return boxB.xf.inverse(p); });
            }
            else {
                localPoints = points.map(function (p) { return boxA.xf.inverse(p); });
            }
            return new contact_1.Contact(boxA, boxB, normal, normal.perpendicular(), separation, points, localPoints);
        }
        return null;
    };
    SeparatingAxis.findBoxCircleSeparation = function (box, circle) {
        var circleDir = circle.xf.pos.sub(box.xf.pos).normalize();
        var boxDir = box.xf.pos.sub(circle.xf.pos).normalize();
        var circlePoint = circle.xf.pos.add(boxDir.scale(circle.radius));
        var bestSeparation = -Number.MAX_VALUE;
        var bestSide = null;
        var bestAxis = null;
        var bestSideIndex = -1;
        var bestOtherPoint = null;
        // Test poly axes against circle point
        for (var i = 0; i < 4; i++) {
            var side = box.getSide(i);
            var axis = side[1].sub(side[0]).normal();
            var circlePoint_1 = circle.xf.pos.add(axis.negate().scale(circle.radius));
            // Separation on side i's axis
            var vertSeparation = SeparatingAxis.distanceToPoint(side[0], side[1], circlePoint_1, true);
            if (vertSeparation > bestSeparation) {
                bestSeparation = vertSeparation;
                bestSide = side;
                bestAxis = axis;
                bestSideIndex = i;
                bestOtherPoint = circlePoint_1;
            }
        }
        // Test the circle -> box axis against each point of the box
        var minCircleSeparation = Number.MAX_VALUE;
        var minCircleSide = 0;
        for (var i = 0; i < 4; i++) {
            // project box points on the circle axis
            var projection = circleDir.dot(box.points[i]);
            var minCircle = circleDir.dot(circle.xf.pos) - circle.radius;
            var maxCircle = circleDir.dot(circle.xf.pos) + circle.radius;
            var separation = Math.min(minCircle - projection, maxCircle - projection);
            if (separation < minCircleSeparation) {
                minCircleSeparation = separation;
                minCircleSide = i;
            }
        }
        if (minCircleSeparation > bestSeparation) {
            var boxPt = box.getFurthestPoint(circleDir);
            bestSeparation = minCircleSeparation;
            bestSide = box.getSide(minCircleSide);
            bestAxis = circle.xf.pos.sub(boxPt).normalize();
            bestSideIndex = minCircleSide;
            bestOtherPoint = box.getFurthestPoint(circleDir);
        }
        return {
            collider: box,
            separation: bestSeparation,
            axis: bestAxis,
            side: bestSide,
            sideId: bestSideIndex,
            point: bestOtherPoint
        };
    };
    SeparatingAxis.findCircleBoxContact = function (circle, box) {
        var separation = SeparatingAxis.findBoxCircleSeparation(box, circle);
        if (separation.separation > 0) {
            return null;
        }
        // make sure that the minAxis is pointing away from circle
        var boxDir = box.xf.pos.sub(circle.xf.pos);
        var axis = separation.axis;
        axis = axis.dot(boxDir) < 0 ? axis.negate() : axis;
        var point = circle.getFurthestPoint(axis);
        var normal = axis;
        return new contact_1.Contact(circle, box, normal, normal.perpendicular(), separation, [point], [circle.xf.inverse(point)]);
    };
    SeparatingAxis.findCircleCircleContact = function (circleA, circleB) {
        var combinedRadius = circleB.radius + circleA.radius;
        var distance = circleB.xf.pos.distance(circleA.xf.pos);
        if (distance < combinedRadius) {
            var separation = combinedRadius - distance;
            // normal points from A -> B
            var direction = circleB.xf.pos.sub(circleA.xf.pos);
            var normal = direction.normalize();
            var tangent = normal.perpendicular();
            var point = circleA.xf.pos.add(normal.scale(circleA.radius));
            var info = {
                collider: circleA,
                separation: separation,
                axis: normal,
                point: point
            };
            return new contact_1.Contact(circleA, circleB, normal, tangent, info, [point]);
        }
        return null;
    };
    /**
    * Find the perpendicular distance from the line to a point
    * https://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line
    * @param point
    */
    SeparatingAxis.distanceToPoint = function (begin, end, point, signed) {
        if (signed === void 0) { signed = false; }
        var x0 = point.x;
        var y0 = point.y;
        var l = end.distance(begin);
        var dy = end.y - begin.y;
        var dx = end.x - begin.x;
        var distance = (dy * x0 - dx * y0 + end.x * begin.y - end.y * begin.x) / l;
        return signed ? distance : Math.abs(distance);
    };
    /**
     *  Clips along a line returning a new line given a direction and a length
     * ```
     *      Clip Dir  +-------->  Clip Size
     *         Begin  *---------|-------------*  End
     *  Clipped line  *---------*
     * ```
     *
     **/
    SeparatingAxis._clip = function (begin, end, clipDir, size) {
        var dir = clipDir;
        dir = dir.normalize();
        var near = dir.dot(begin) - size;
        var far = dir.dot(end) - size;
        var results = [];
        if (near <= 0) {
            results.push(begin);
        }
        if (far <= 0) {
            results.push(end);
        }
        if (near * far < 0) {
            var clipTime = near / (near - far);
            results.push(begin.add(end.sub(begin).scale(clipTime)));
        }
        if (results.length !== 2) {
            return null;
        }
        return [results[0], results[1]];
    };
    SeparatingAxis._below = function (begin, end, point) {
        var above2 = ((end.x - begin.x) * (point.y - begin.y) -
            (end.y - begin.y) * (point.x - begin.x));
        return above2 >= 0;
    };
    return SeparatingAxis;
}());
exports.SeparatingAxis = SeparatingAxis;


/***/ }),

/***/ "./solver.ts":
/*!*******************!*\
  !*** ./solver.ts ***!
  \*******************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Solver = exports.ContactConstraintPoint = void 0;
var box_1 = __webpack_require__(/*! ./box */ "./box.ts");
var circle_1 = __webpack_require__(/*! ./circle */ "./circle.ts");
var line_1 = __webpack_require__(/*! ./line */ "./line.ts");
var math_1 = __webpack_require__(/*! ./math */ "./math.ts");
var separating_axis_1 = __webpack_require__(/*! ./separating-axis */ "./separating-axis.ts");
var vector_1 = __webpack_require__(/*! ./vector */ "./vector.ts");
/**
 * Holds information about contact points, meant to be reused over multiple frames of contact
 */
var ContactConstraintPoint = /** @class */ (function () {
    function ContactConstraintPoint(point, local, contact) {
        this.point = point;
        this.local = local;
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
    }
    ContactConstraintPoint.prototype.getRelativeVelocity = function () {
        var bodyA = this.contact.bodyA;
        var bodyB = this.contact.bodyB;
        // Relative velocity in linear terms
        // Angular to linear velocity formula -> omega = velocity/radius so omega x radius = velocity
        var velA = bodyA.m.vel.add(vector_1.Vector.cross(bodyA.m.angularVelocity, this.aToContact));
        var velB = bodyB.m.vel.add(vector_1.Vector.cross(bodyB.m.angularVelocity, this.bToContact));
        return velB.sub(velA);
    };
    return ContactConstraintPoint;
}());
exports.ContactConstraintPoint = ContactConstraintPoint;
var Solver = /** @class */ (function () {
    function Solver(flags) {
        this.flags = flags;
        this.lastFrameContacts = new Map();
        // map contact id to contact points
        this.idToContactConstraint = new Map();
    }
    Solver.prototype.getContactConstraints = function (id) {
        var _a;
        return (_a = this.idToContactConstraint.get(id)) !== null && _a !== void 0 ? _a : [];
    };
    Solver.prototype.preSolve = function (contacts) {
        var _a, _b, _c;
        // Keep track of contacts that done
        var finishedContactIds = Array.from(this.idToContactConstraint.keys());
        for (var _i = 0, contacts_1 = contacts; _i < contacts_1.length; _i++) {
            var contact = contacts_1[_i];
            // Remove all current contacts that are not done
            var index = finishedContactIds.indexOf(contact.id);
            if (index > -1) {
                finishedContactIds.splice(index, 1);
            }
            var constraints = (_a = this.idToContactConstraint.get(contact.id)) !== null && _a !== void 0 ? _a : [];
            var pointIndex = 0;
            constraints.length = contact.points.length;
            for (var _d = 0, _e = contact.points; _d < _e.length; _d++) {
                var point = _e[_d];
                var bodyA = contact.bodyA;
                var bodyB = contact.bodyB;
                var normal = contact.normal;
                var tangent = contact.tangent;
                var aToContact = point.sub(bodyA.xf.pos);
                var bToContact = point.sub(bodyB.xf.pos);
                var aToContactNormal = aToContact.cross(normal);
                var bToContactNormal = bToContact.cross(normal);
                var normalMass = bodyA.inverseMass + bodyB.inverseMass +
                    bodyA.inverseInertia * aToContactNormal * aToContactNormal +
                    bodyB.inverseInertia * bToContactNormal * bToContactNormal;
                var aToContactTangent = aToContact.cross(tangent);
                var bToContactTangent = bToContact.cross(tangent);
                var tangentMass = bodyA.inverseMass + bodyB.inverseMass +
                    bodyA.inverseInertia * aToContactTangent * aToContactTangent +
                    bodyB.inverseInertia * bToContactTangent * bToContactTangent;
                // Preserve normal/tangent impulse by re-using the contact point if it's close
                if (constraints[pointIndex] && ((_c = (_b = constraints[pointIndex]) === null || _b === void 0 ? void 0 : _b.point) === null || _c === void 0 ? void 0 : _c.squareDistance(point)) < 4) {
                    constraints[pointIndex].point = point;
                    constraints[pointIndex].local = contact.locals[pointIndex];
                }
                else {
                    // new contact if its' not close or doesn't exist
                    constraints[pointIndex] = new ContactConstraintPoint(point, contact.locals[pointIndex], contact);
                }
                // Update contact point calculations
                constraints[pointIndex].aToContact = aToContact;
                constraints[pointIndex].bToContact = bToContact;
                constraints[pointIndex].normalMass = normalMass;
                constraints[pointIndex].tangentMass = tangentMass;
                pointIndex++;
            }
            this.idToContactConstraint.set(contact.id, constraints);
        }
        // Clean up any contacts that did not occur last frame
        for (var _f = 0, finishedContactIds_1 = finishedContactIds; _f < finishedContactIds_1.length; _f++) {
            var id = finishedContactIds_1[_f];
            this.idToContactConstraint.delete(id);
        }
    };
    Solver.prototype.postSolve = function (contacts) {
        // Store contacts
        this.lastFrameContacts.clear();
        for (var _i = 0, contacts_2 = contacts; _i < contacts_2.length; _i++) {
            var c = contacts_2[_i];
            this.lastFrameContacts.set(c.id, c);
        }
    };
    /**
     * Warm up body's based on previous frame contact points
     * @param contacts
     */
    Solver.prototype.warmStart = function (contacts) {
        var _a;
        for (var _i = 0, contacts_3 = contacts; _i < contacts_3.length; _i++) {
            var contact = contacts_3[_i];
            var constraints = (_a = this.idToContactConstraint.get(contact.id)) !== null && _a !== void 0 ? _a : [];
            for (var _b = 0, constraints_1 = constraints; _b < constraints_1.length; _b++) {
                var constraint = constraints_1[_b];
                var normalImpulse = contact.normal.scale(constraint.normalImpulse);
                var tangentImpulse = contact.tangent.scale(constraint.tangentImpulse);
                var impulse = normalImpulse.add(tangentImpulse);
                contact.bodyA.applyImpulse(constraint.point, impulse.negate());
                contact.bodyB.applyImpulse(constraint.point, impulse);
            }
        }
    };
    Solver.prototype._getSeparation = function (contact, point) {
        var bodyA = contact.bodyA;
        var bodyB = contact.bodyB;
        if (bodyA instanceof circle_1.Circle && bodyB instanceof circle_1.Circle) {
            var combinedRadius = bodyA.radius + bodyB.radius;
            var distance = bodyA.xf.pos.distance(bodyB.xf.pos);
            var separation = combinedRadius - distance;
            return -separation;
        }
        if (bodyA instanceof circle_1.Circle && bodyB instanceof line_1.Line) {
            return bodyB.getSeparation(bodyA);
        }
        if (bodyA instanceof line_1.Line && bodyB instanceof circle_1.Circle) {
            return bodyA.getSeparation(bodyB);
        }
        if (bodyA instanceof box_1.Box && bodyB instanceof box_1.Box) {
            if (contact.info.localSide) {
                var side = void 0;
                var worldPoint = void 0;
                if (contact.info.collider === bodyA) {
                    side = [bodyA.xf.apply(contact.info.localSide[0]), bodyA.xf.apply(contact.info.localSide[1])];
                    worldPoint = bodyB.xf.apply(point);
                }
                else {
                    side = [bodyB.xf.apply(contact.info.localSide[0]), bodyB.xf.apply(contact.info.localSide[1])];
                    worldPoint = bodyA.xf.apply(point);
                }
                return separating_axis_1.SeparatingAxis.distanceToPoint(side[0], side[1], worldPoint, true);
            }
        }
        if (bodyA instanceof box_1.Box && bodyB instanceof circle_1.Circle ||
            bodyB instanceof box_1.Box && bodyA instanceof circle_1.Circle) {
            if (contact.info.side) {
                return separating_axis_1.SeparatingAxis.distanceToPoint(contact.info.side[0], contact.info.side[1], bodyA.xf.apply(point), true);
            }
        }
        return 0;
    };
    /**
     * Iteratively solve the position overlap constraint
     * @param contacts
     */
    Solver.prototype.solvePosition = function (contacts) {
        var _a;
        for (var _i = 0, contacts_4 = contacts; _i < contacts_4.length; _i++) {
            var contact = contacts_4[_i];
            var constraints = (_a = this.idToContactConstraint.get(contact.id)) !== null && _a !== void 0 ? _a : [];
            for (var _b = 0, constraints_2 = constraints; _b < constraints_2.length; _b++) {
                var point = constraints_2[_b];
                var bodyA = contact.bodyA;
                var bodyB = contact.bodyB;
                var normal = contact.normal;
                var separation = this._getSeparation(contact, point.local);
                var steeringConstant = this.flags['Steering Factor']; // 0.2
                var maxCorrection = -5;
                var slop = this.flags['Slop']; // .5;
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
        var _a;
        for (var _i = 0, contacts_5 = contacts; _i < contacts_5.length; _i++) {
            var contact = contacts_5[_i];
            var bodyA = contact.bodyA;
            var bodyB = contact.bodyB;
            var restitution = bodyA.bounciness * bodyB.bounciness;
            var friction = Math.min(bodyA.friction, bodyB.friction);
            var constraints = (_a = this.idToContactConstraint.get(contact.id)) !== null && _a !== void 0 ? _a : [];
            for (var _b = 0, constraints_3 = constraints; _b < constraints_3.length; _b++) {
                var point = constraints_3[_b];
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
            for (var _c = 0, constraints_4 = constraints; _c < constraints_4.length; _c++) {
                var point = constraints_4[_c];
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
    Transform.prototype.apply = function (vec) {
        return vec.rotate(this.rotation).add(this.pos);
    };
    Transform.prototype.inverse = function (vec) {
        return vec.sub(this.pos).rotate(-this.rotation);
    };
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
exports.Vector = void 0;
var Vector = /** @class */ (function () {
    function Vector(x, y) {
        this.x = x;
        this.y = y;
    }
    Vector.prototype.distance = function (other) {
        if (!other) {
            other = new Vector(0, 0);
        }
        var dx = this.x - other.x;
        var dy = this.y - other.y;
        return Math.sqrt(dx * dx + dy * dy);
    };
    Vector.prototype.squareDistance = function (other) {
        var dx = this.x - other.x;
        var dy = this.y - other.y;
        return dx * dx + dy * dy;
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
    /**
     * Rotates the current vector around a point by a certain number of
     * degrees in radians
     */
    Vector.prototype.rotate = function (angle, anchor) {
        if (!anchor) {
            anchor = new Vector(0, 0);
        }
        var sinAngle = Math.sin(angle);
        var cosAngle = Math.cos(angle);
        var x = cosAngle * (this.x - anchor.x) - sinAngle * (this.y - anchor.y) + anchor.x;
        var y = sinAngle * (this.x - anchor.x) + cosAngle * (this.y - anchor.y) + anchor.y;
        return new Vector(x, y);
    };
    Vector.cross = function (num, vec) {
        return new Vector(-num * vec.y, num * vec.x);
    };
    return Vector;
}());
exports.Vector = Vector;


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
var box_1 = __webpack_require__(/*! ./box */ "./box.ts");
var circle_1 = __webpack_require__(/*! ./circle */ "./circle.ts");
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
};
for (var key in flags) {
    if (typeof flags[key] === 'number') {
        switch (key) {
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
var entities = [
    // new Line(new Vector(50, 550), new Vector(750, 550)),
    new box_1.Box(500, 20, new vector_1.Vector(canvas.width / 2, 550)),
    new line_1.Line(new vector_1.Vector(100, 100), new vector_1.Vector(300, 650)),
    new line_1.Line(new vector_1.Vector(500, 650), new vector_1.Vector(700, 100)),
    // new Circle(40, new Vector(canvas.width / 2, 400)),
    // new Box(40, 40, new Vector(canvas.width / 2, 400)),
    // new Circle(40, new Vector(canvas.width / 2, 300)),
    // new Circle(40, new Vector(canvas.width / 2, 200)),
    // new Circle(40, new Vector(canvas.width / 2, 100)),
    // new Circle(40, new Vector(canvas.width / 2, 0)),
    // new Circle(40, new Vector(canvas.width / 2, -100)),
    // new Circle(40, new Vector(canvas.width / 2, -200)),
];
window.entities = entities;
entities[0].static = true;
// entities[entities.length - 1].xf.rotation = Math.PI / 5;
var solver = new solver_1.Solver(flags);
var contacts = [];
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
            circle.m.angularVelocity = math_1.clamp(circle.m.angularVelocity, -1, 1);
        }
    }
    // Naive descrete collision detection (broadphase + narrowphase)
    // We re-use contacts from the previous frame if they exist
    contacts = [];
    for (var i = 0; i < entities.length; i++) {
        for (var j = i + 1; j < entities.length; j++) {
            var colliderA = entities[i];
            var colliderB = entities[j];
            var contact = colliderA.collide(colliderB);
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
    }
    else {
        for (var _a = 0, contacts_1 = contacts; _a < contacts_1.length; _a++) {
            var contact = contacts_1[_a];
            var constraints = solver.getContactConstraints(contact.id);
            for (var _b = 0, constraints_1 = constraints; _b < constraints_1.length; _b++) {
                var constraint = constraints_1[_b];
                constraint.normalImpulse = 0;
                constraint.tangentImpulse = 0;
            }
        }
    }
    // The velocity constraint is that no contacts are moving relative to each other along the normal
    // in other words relative velocity between contacts should approach 0 on the normal
    for (var i = 0; i < flags['Velocity Iterations']; i++) {
        solver.solveVelocity(contacts);
    }
    // Integrate positions
    for (var _c = 0, entities_2 = entities; _c < entities_2.length; _c++) {
        var circle = entities_2[_c];
        if (!circle.static) {
            var offset = circle.m.vel.scale(elapsed).add(acc.scale(0.5 * elapsed * elapsed));
            circle.xf.pos = circle.xf.pos.add(offset);
            circle.xf.rotation += math_1.clamp(circle.m.angularVelocity, -1, 1) * elapsed;
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
    solver.postSolve(contacts);
};
var draw = function (elapsed) {
    ctx.save();
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (var _i = 0, entities_3 = entities; _i < entities_3.length; _i++) {
        var e = entities_3[_i];
        e.draw(ctx, flags);
    }
    if (flags["Debug"]) {
        for (var _a = 0, contacts_2 = contacts; _a < contacts_2.length; _a++) {
            var contact = contacts_2[_a];
            var contactPoints = solver.getContactConstraints(contact.id);
            for (var _b = 0, contactPoints_1 = contactPoints; _b < contactPoints_1.length; _b++) {
                var p = contactPoints_1[_b];
                if (flags["Points"]) {
                    ctx.beginPath();
                    ctx.strokeStyle = 'yellow';
                    ctx.arc(p.point.x, p.point.y, 5, 0, Math.PI * 2);
                    ctx.closePath();
                    ctx.stroke();
                }
                if (flags["Normals"]) {
                    ctx.beginPath();
                    ctx.strokeStyle = 'red';
                    ctx.moveTo(p.point.x, p.point.y);
                    ctx.lineTo(p.point.x + contact.normal.x * 10, p.point.y + contact.normal.y * 10);
                    ctx.closePath();
                    ctx.stroke();
                }
                if (flags["RelativeVel"]) {
                    ctx.beginPath();
                    ctx.strokeStyle = 'blue';
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
        for (var _c = 0, entities_4 = entities; _c < entities_4.length; _c++) {
            var circle = entities_4[_c];
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
    if (ev.code === 'KeyI') {
        entities[3].applyImpulse(entities[3].xf.pos, new vector_1.Vector(0, -5500));
        entities[4].applyImpulse(entities[4].xf.pos, new vector_1.Vector(0, 5500));
    }
    if (ev.code === 'KeyC') {
        entities.push(new circle_1.Circle(40, new vector_1.Vector(canvas.width / 2, 0)));
    }
    if (ev.code === 'KeyB') {
        var box = new box_1.Box(100, 40, new vector_1.Vector(canvas.width / 2, 300));
        box.bounciness = .1;
        entities.push(box);
    }
});

})();

/******/ })()
;
//# sourceMappingURL=main.js.map