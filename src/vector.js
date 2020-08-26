class Vector {
    static get UP() {
	return new Vector(0, 1, 0);
    };

    static get WHITE() {
	return new Vector(255, 255, 255);
    }

    static get ZERO() {
	return new Vector(0, 0, 0);
    }

    constructor(x, y, z) {
	this.x = x || 0;
	this.y = y || 0;
	this.z = z || 0;
    }

    add(other) {
	const x = this.x + other.x;
	const y = this.y + other.y;
	const z = this.z + other.z;

	return new Vector(x, y, z);
    }

    add3(a, b) {
	const x = this.x + a.x + b.x;
	const y = this.y + a.y + b.y;
	const z = this.z + a.z + b.z;

	return new Vector(x, y, z);
    }

    crossProduct(other) {
	const x = (this.y * other.z) - (this.z * other.y);
	const y = (this.z * other.x) - (this.x * other.z);
	const z = (this.x * other.y) - (this.y * other.x);

	return new Vector(x, y, z);
    }

    dotProduct(other) {
	return (this.x * other.x) + (this.y * other.y) + (this.z * other.z);
    }

    length() {
	return Math.sqrt(this.dotProduct(this));
    }

    normalize() {
	return this.scale(1 / this.length());
    }

    reflectThrough(normal) {
	const d = normal.scale(this.dotProduct(normal));

	return d.scale(2).subtract(this);
    }

    scale(t) {
	const x = this.x * t;
	const y = this.y * t;
	const z = this.z * t;

	return new Vector(x, y, z);
    }

    subtract(other) {
	const x = this.x - other.x;
	const y = this.y - other.y;
	const z = this.z - other.z;

	return new Vector(x, y, z);
    }
}

export default Vector;
