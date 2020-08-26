import Vector from "./vector";
import Shape from "./shape";

class Sphere extends Shape {
  constructor(point, radius, color, specular, lambert, ambient) {
    super();

    this.point = point || new Vector();
    this.radius = Number(radius || 1);
    this.color = color || new Vector();
    this.specular = Number(specular || 0.2);
    this.lambert = Number(lambert || 0.7);
    this.ambient = Number(ambient || 0.1);

    if (isNaN(radius)) {
      throw new Error("Radius must be a number.");
    }

    if (radius <= 0) {
      throw new Error("Radius must be greater than 0.");
    }
  }

  intersection(ray) {
    const eyeToCenter = this.point.subtract(ray.point);
    const v = eyeToCenter.dotProduct(ray.vector);
    const eyeToObjectCenter = eyeToCenter.dotProduct(eyeToCenter);
    const discriminant = (this.radius * this.radius) - eyeToObjectCenter + (v * v);

	if (discriminant < 0) {
	    return undefined;
	} else {
	    return v - Math.sqrt(discriminant);
	}
    }

    normal(position) {
	return position.subtract(this.point).normalize();
    }
}

export default Sphere;
