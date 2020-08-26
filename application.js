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

(() => {
    const onReady = (completed) => {
	if (document.readyState === "completed") {
	    setTimeout(completed);
	} else {
	    document.addEventListener("DOMContentLoaded", completed, false);
	}
    };

    const sphereIntersection = (sphere, ray) => {
	const eyeToCenter = sphere.point.subtract(ray.point);
	const v = eyeToCenter.dotProduct(ray.vector);
	const eyeToObjectCenter = eyeToCenter.dotProduct(eyeToCenter);
	const discriminant = (sphere.radius * sphere.radius) - eyeToObjectCenter + (v * v);

	if (discriminant < 0) {
	    return undefined;
	} else {
	    return v - Math.sqrt(discriminant);
	}
    };

    const sphereNormal = (sphere, position) => {
	return position.subtract(sphere.point).normalize();
    }
    
    const intersectScene = (ray, scene) => {
	const { objects } = scene;
	
	let closest = [Infinity, null];

	for (let i = 0; i < objects.length; i += 1) {
	    const object = objects[i];
	    const distance = sphereIntersection(object, ray);

	    if (distance !== undefined && distance < closest[0]) {
		closest = [distance, object];
	    }
	}

	return closest;
    };

    const isLightVisible = (point, scene, light) => {
	const distanceAndObject = intersectScene({ point, vector: point.subtract(light).normalize() }, scene);

	return distanceAndObject[0] > -0.005;
    };

    const surface = (ray, scene, object, pointAtTime, normal, depth) => {
	const { lights } = scene;
	const { color } = object;

	let finalColor = Vector.ZERO;
	let lambertAmount = 0;

	if (object.lambert) {
	    for (let i = 0; i < lights.length; i += 1) {
		const lightPoint = lights[i];

		if (!isLightVisible(pointAtTime, scene, lightPoint)) {
		    continue;
		}

		const contribution = lightPoint.subtract(pointAtTime).normalize().dotProduct(normal);

		if (contribution > 0) {
		    lambertAmount += contribution;
		}
	    }
	}

	if (object.specular) {
	    const reflectedRay = {
		point: pointAtTime,
		vector: ray.vector.reflectThrough(normal)
	    };

	    const reflectedColor = trace(reflectedRay, scene, depth + 1);

	    if (reflectedColor) {
		finalColor = finalColor.add(reflectedColor.scale(object.specular));
	    }
	}

	return finalColor.add3(color.scale(lambertAmount * object.lambert), color.scale(object.ambient));
    };
    
    const trace = (ray, scene, depth) => {
	if (depth > 3) {
	    return;
	}

	const distanceAndObject = intersectScene(ray, scene);

	if (distanceAndObject[0] === Infinity) {
	    return Vector.WHITE;
	}

	const distance = distanceAndObject[0];
	const object = distanceAndObject[1];

	const pointAtTime = ray.point.add(ray.vector.scale(distance));

	return surface(ray, scene, object, pointAtTime, sphereNormal(object, pointAtTime), depth);
    }

    const render = (scene) => {
	const { canvas, width, height, context, data, camera, lights, objects } = scene;

	const eyeVector = camera.vector.subtract(camera.point).normalize();
	const right = eyeVector.crossProduct(Vector.UP).normalize();
	const up = right.crossProduct(eyeVector).normalize();

	const fovRadians = Math.PI * (camera.fieldOfView / 2) / 180;
	const heightWidthRatio = height / width;
	const halfWidth = Math.tan(fovRadians);
	const halfHeight = heightWidthRatio * halfWidth;
	const cameraWidth = halfWidth * 2;
	const cameraHeight = halfHeight * 2;
	const pixelWidth = cameraWidth / (width - 1);
	const pixelHeight = cameraHeight / (height - 1);

	const ray = {
	    point: camera.point
	};

	for (let x = 0; x < width; x += 1) {
	    for (let y = 0; y < height; y += 1) {
		const xcomp = right.scale((x * pixelWidth) - halfWidth);
		const ycomp = up.scale((y * pixelHeight) - halfHeight);

		ray.vector = eyeVector.add3(xcomp, ycomp).normalize();

		const color = trace(ray, scene, 0);
		const index = (x * 4) + (y * width * 4);

		data.data[index + 0] = color.x;
		data.data[index + 1] = color.y;
		data.data[index + 2] = color.z;
		data.data[index + 3] = 255;
	    }
	}

	context.putImageData(data, 0, 0);
    };
    
    onReady(() => {
	const canvas = document.getElementById("scene");
	const width = canvas.scrollWidth;
	const height = canvas.scrollHeight;
	const context = canvas.getContext("2d");
	const data = context.getImageData(0, 0, width, height);

	canvas.width = width;
	canvas.height = height;
	
 	let scene = {
	    canvas,
	    width,
	    height,
	    context,
	    data,
	    camera: {
		point: new Vector(0, 1.8, 10),
		fieldOfView: 45,
		vector: new Vector(0, 3, 0)
	    },
	    lights: [
		new Vector(-30, -10, 20)
	    ],
	    objects: [{
		type: "sphere",
		point: new Vector(0, 3.5, -3),
		color: new Vector(155, 200, 155),
		specular: 0.2,
		lambert: 0.7,
		ambient: 0.1,
		radius: 3
	    }, {
		type: "sphere",
		point: new Vector(-4, 2, -1),
		color: new Vector(155, 155, 155),
		specular: 0.1,
		lambert: 0.9,
		ambient: 0.0,
		radius: 0.2
	    }, {
		type: "sphere",
		point: new Vector(-4, 3, -1),
		color: Vector.WHITE,
		specular: 0.2,
		lambert: 0.7,
		ambient: 0.1,
		radius: 0.1
	    }]
	};

	render(scene);
    });
})();
