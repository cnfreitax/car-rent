const Base = require('./base/base')

class Costumer extends Base {
  constructor({ id, name, age }) {
    super({ id, name });

    this.age = age;
  }
}

module.exports = Costumer;
