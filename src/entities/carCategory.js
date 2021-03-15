const Base = require("./base/base");

class CarCategory extends Base {
  constructor({ id, name, cardIds, price }) {
    super({ id, name });

    this.cardIds = cardIds;
    this.price = price;
  }
}

module.exports = CarCategory;
