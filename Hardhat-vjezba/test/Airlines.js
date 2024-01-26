const { expect } = require("chai");

describe("Airlines Contract", function () {
  let contractInstance;
  let owner;
  let airline1;
  let airline2;
  let customer1;

  beforeEach(async function () {
    let Airlines = await ethers.getContractFactory("Airlines");
    contractInstance = await Airlines.deploy();
    [owner, airline1, airline2, customer1] = await ethers.getSigners();
  });

  it("Should add an airline correctly", async function () {
    await contractInstance.connect(owner).addAirline("Airline1", "Country1", airline1.address);

    const airline = await contractInstance.airlines(0);

    expect(airline.id).to.equal(0);
    expect(airline.name).to.equal("Airline1");
    expect(airline.country).to.equal("Country1");
    expect(airline.airAddress).to.equal(airline1.address);
  });

  it("Should add a flight correctly", async function () {
    await contractInstance.connect(owner).addAirline("Airline1", "Country1", airline1.address);

    await contractInstance.connect(airline1).addFlight(0, "Origin1", "Destination1");

    const flight = await contractInstance.flights(0);

    expect(flight.id).to.equal(0);
    expect(flight.origin).to.equal("Origin1");
    expect(flight.destination).to.equal("Destination1");
    expect(flight.status).to.equal("pending");
    expect(flight.airlineId).to.equal(0);
  });

  it("Should end a flight correctly", async function () {
    await contractInstance.connect(owner).addAirline("Airline1", "Country1", airline1.address);

    await contractInstance.connect(airline1).addFlight(0, "Origin1", "Destination1");

    await contractInstance.connect(airline1).endFlight(0);

    const flight = await contractInstance.flights(0);

    expect(flight.status).to.equal("done");
  });

  it("Should book a flight correctly", async function () {
    await contractInstance.connect(owner).addAirline("Airline1", "Country1", airline1.address);
    await contractInstance.connect(airline1).addFlight(0, "Origin1", "Destination1");

    await contractInstance.connect(customer1).bookFlight(0);

    const customer = await contractInstance.customers(customer1.address);

    expect(customer.flightIds.length).to.equal(1);
    expect(customer.flightIds[0]).to.equal(0);
  });

  it("Should get airline's flights correctly", async function () {
    await contractInstance.connect(owner).addAirline("Airline1", "Country1", airline1.address);
    await contractInstance.connect(airline1).addFlight(0, "Origin1", "Destination1");
    await contractInstance.connect(airline1).addFlight(0, "Origin2", "Destination2");

    const airlineFlights = await contractInstance.getAirlinesFlights(0);

    expect(airlineFlights.length).to.equal(2);
    expect(airlineFlights[0].origin).to.equal("Origin1");
    expect(airlineFlights[1].origin).to.equal("Origin2");
  });

  it("Should get customer's flights correctly", async function () {
    await contractInstance.connect(owner).addAirline("Airline1", "Country1", airline1.address);
    await contractInstance.connect(airline1).addFlight(0, "Origin1", "Destination1");

    await contractInstance.connect(customer1).bookFlight(0);

    const customerFlights = await contractInstance.getCustromersFlights();

    expect(customerFlights.length).to.equal(1);
    expect(customerFlights[0].origin).to.equal("Origin1");
  });
});
