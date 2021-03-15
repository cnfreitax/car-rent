const { describe, it, before, beforeEach, afterEach } = require("mocha");
const CarService = require("../../src/service/carService");
const { join } = require("path");
const { expect } = require("chai");
const sinon = require("sinon");
const Transaction = require("../../src/entities/transaction");

const carDatabase = join(__dirname, "./../../database", "cars.json");

const mocks = {
  validCarCategory: require("../mocks/valid-car-category.json"),
  validCar: require("../mocks/valid-car.json"),
  customer: require("../mocks/valid-costumer.json"),
};

describe("CarService Suite Test", () => {
  let carService = {};
  let sandBox = {};
  before(() => {
    carService = new CarService({
      cars: carDatabase,
    });
  });

  beforeEach(() => {
    sandBox = sinon.createSandbox();
  });

  afterEach(() => {
    sandBox.restore();
  });

  it("should retrieve a random position from an array", () => {
    const data = [0, 1, 2, 3, 4];
    const result = carService.getRandomPositionFromArray(data);

    expect(result).to.be.lte(data.length).and.be.gte(0);
  });

  it("should choose the first if drom carIds in cardCategory", async () => {
    const carCategory = mocks.validCarCategory;
    const carIndex = 0;

    sandBox
      .stub(carService, carService.getRandomPositionFromArray.name)
      .returns(carIndex);

    const result = carService.chooseRandomCar(carCategory);
    const expected = carCategory.carIds[carIndex];

    expect(carService.getRandomPositionFromArray.calledOnce).to.be.ok;
    expect(result).to.be.equal(expected);
  });

  it("give an carCategory it should an available car", async () => {
    const car = mocks.validCar;
    const carCategory = Object.create(mocks.validCarCategory);
    carCategory.carIds = [car.id];

    sandBox
      .stub(carService.carRepository, carService.carRepository.find.name)
      .resolves(car);

    sandBox.spy(carService, carService.chooseRandomCar.name);

    const result = await carService.getAvailableCar(carCategory);
    const expected = car;

    expect(carService.chooseRandomCar.calledOnce).to.be.ok;
    expect(carService.carRepository.find.calledWithExactly(car.id)).to.be.ok;
    expect(result).to.be.deep.equal(expected);
  });

  it("given a carCategory, customer and numberOfDay it should calculate final amount in real", () => {
    const customer = Object.create(mocks.customer);
    customer.age = 50;

    const category = Object.create(mocks.validCarCategory);
    category.price = 37.6;

    sandBox
      .stub(carService, "taxesBasedOnAge")
      .get(() => [{ from: 40, to: 50, then: 1.3 }]);

    const numberOfDays = 5;

    const expected = carService.currencyFormat.format(244.4);
    const result = carService.calculateFinalPrice(
      customer,
      category,
      numberOfDays
    );

    expect(result).to.be.deep.equal(expected);
  });

  it("give a costmer and car category it shoul return a transaction receipt", async () => {
    const car = mocks.validCar;
    const carCategory = {
      ...mocks.validCarCategory,
      price: 37.6,
      carIds: [car.id],
    };

    const customer = Object.create(mocks.customer);
    customer.age = 20;
    const numberOfDays = 5;
    const dueDate = "14 de março de 2021";

    const now = new Date(2021, 02, 09);
    sandBox.useFakeTimers(now.getTime());

    sandBox
      .stub(carService.carRepository, carService.carRepository.find.name)
      .resolves(car);

    // age: 20, trax: 1.1, categoryPrice: 37.6;
    // 37.6 * 1.1 = 41.36 * 5 = 206.8
    const expectedAmount = carService.currencyFormat.format(206.8);
    const result = await carService.rent(customer, carCategory, numberOfDays);

    const expected = new Transaction({
      customer,
      car,
      amount: expectedAmount,
      dueDate,
    });

    expect(result).to.be.deep.equal(expected);
  });
});
