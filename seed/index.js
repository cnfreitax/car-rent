const { join } = require("path");
const { writeFile } = require("fs/promises");
const faker = require("faker");
const Car = require("../src/entities/car");
const Costumer = require("../src/entities/costumer");
const CarCategory = require("../src/entities/carCategory");

const seederBaseFolder = join(__dirname, "../", "database");
const ITEMS_AMOUT = 2;

const carCategories = new CarCategory({
  id: faker.random.uuid(),
  name: faker.vehicle.type(),
  carIds: [],
  price: Number(faker.finance.amount(20, 100)),
});

const cars = [];
const costumers = [];
for (let index = 0; index < ITEMS_AMOUT; index++) {
  const car = new Car({
    id: faker.random.uuid(),
    name: faker.vehicle.model(),
    available: true,
    gasAvailable: true,
    releaseYear: faker.date.past().getFullYear(),
  });

  carCategories.cardIds.push(car.id);
  cars.push(car);

  const costumer = new Costumer({
    id: faker.random.uuid(),
    age: faker.random.number({ min: 18, max: 50 }),
    name: faker.name.findName(),
  });

  costumers.push(costumer);
}

const wirte = (filename, data) =>
  writeFile(join(seederBaseFolder, filename), JSON.stringify(data));

(async () => {
  await wirte("cars.json", cars);
  await wirte("carCategory.json", [carCategories]);
  await wirte("costumer.json", costumers);
})();
