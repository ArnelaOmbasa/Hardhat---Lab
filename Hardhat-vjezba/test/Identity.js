const { expect } = require("chai");

describe("DecentralizedIdentityVerification Contract", function () {
  let contract;
  let contractInstance;
  let owner;
  let user1;
  let user2;

  beforeEach(async function () {
    contract = await ethers.getContractFactory("DecentralizedIdentityVerification");
    [owner, user1, user2] = await ethers.getSigners();
    contractInstance = await contract.deploy();
  });

  it("Administrator should be set correctly", async function () {
    const administrator = await contractInstance.administrator();
    expect(administrator).to.equal(owner.address);
  });

  it("User can register identity", async function () {
    const fullName = "John Doe";
    const dateOfBirth = "1990-01-01";

    await contractInstance.connect(user1).registerIdentity(fullName, dateOfBirth);

    const user = await contractInstance.identityRegistry(user1.address);
    expect(user.userAddress).to.equal(user1.address);
    expect(user.fullName).to.equal(fullName);
    expect(user.dateOfBirth).to.equal(dateOfBirth);
    expect(user.isVerified).to.be.false;
  });

  it("Administrator can verify identity", async function () {
    const fullName = "Alice Smith";
    const dateOfBirth = "1985-05-15";

    await contractInstance.connect(user1).registerIdentity(fullName, dateOfBirth);

    await contractInstance.verifyIdentity(user1.address);

    const user = await contractInstance.identityRegistry(user1.address);
    expect(user.isVerified).to.be.true;
  });

  it("User can view their identity details", async function () {
    const fullName = "Bob Johnson";
    const dateOfBirth = "1995-07-20";

    await contractInstance.connect(user2).registerIdentity(fullName, dateOfBirth);

    const user = await contractInstance.connect(user2).viewIdentityDetails();
    expect(user.userAddress).to.equal(user2.address);
    expect(user.fullName).to.equal(fullName);
    expect(user.dateOfBirth).to.equal(dateOfBirth);
    expect(user.isVerified).to.be.false;
  });

  it("Circuit breaker functionality", async function () {
    // Circuit breaker should be initially not paused
    let isPaused = await contractInstance.paused();
    expect(isPaused).to.be.false;

    // Administrator toggles circuit breaker
    await contractInstance.toggleCircuitBreaker();

    // Circuit breaker should be paused
    isPaused = await contractInstance.paused();
    expect(isPaused).to.be.true;

    // User tries to register identity, should fail
    await expect(
      contractInstance.connect(user1).registerIdentity("Test User", "2000-01-01")
    ).to.be.revertedWith("Identity verification functionality is currently paused");

    // Administrator toggles circuit breaker back
    await contractInstance.toggleCircuitBreaker();

    // Circuit breaker should be not paused
    isPaused = await contractInstance.paused();
    expect(isPaused).to.be.false;

    // User can now register identity successfully
    await contractInstance.connect(user1).registerIdentity("Test User", "2000-01-01");
  });
});
