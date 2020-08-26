class Shape {
  constructor() {
    if (new.target === Shape) {
      throw new TypeError("Cannot construct Shape instances directly.");
    }
  }
}

export default Shape;
