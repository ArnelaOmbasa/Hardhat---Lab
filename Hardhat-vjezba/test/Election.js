const { expect } = require("chai");

describe("Election Contract", function () {
  let contract;
  let contractInstance;
  let superowner;
  let owner1;
  let owner2;
  let candidate1;
  let candidate2;
  let user1;
  let user2;

  beforeEach(async function () {
    contract = await ethers.getContractFactory("Election");
    [superowner, owner1, owner2, candidate1, candidate2, user1, user2] = await ethers.getSigners();
    contractInstance = await contract.deploy();
  });

  it("Superowner should be set correctly", async function () {
    const result = await contractInstance.superowner();
    expect(result).to.equal(superowner.address);
  });

  it("Superowner can add and remove owners", async function () {
    await contractInstance.connect(superowner).addOwner(owner1.address);
    let isOwner1 = await contractInstance.owners(owner1.address);
    expect(isOwner1).to.be.true;

    await contractInstance.connect(superowner).removeOwner(owner1.address);
    isOwner1 = await contractInstance.owners(owner1.address);
    expect(isOwner1).to.be.false;
  });

  it("Owner can add and remove candidates", async function () {
    await contractInstance.connect(superowner).addOwner(owner1.address);

    await contractInstance.connect(owner1).addCandidate(candidate1.address);
    let isCandidate1 = await contractInstance.candidates(candidate1.address);
    expect(isCandidate1).to.be.true;

    await contractInstance.connect(owner1).removeCandidate(candidate1.address);
    isCandidate1 = await contractInstance.candidates(candidate1.address);
    expect(isCandidate1).to.be.false;
  });

  it("Owner can approve users", async function () {
    await contractInstance.connect(superowner).addOwner(owner1.address);

    await contractInstance.connect(owner1).approveUser(user1.address);
    let isUser1Approved = await contractInstance.users(user1.address);
    expect(isUser1Approved).to.be.true;
  });

  it("Superowner can set voting cost", async function () {
    await contractInstance.connect(superowner).setVotingCost(2);

    const result = await contractInstance.votingCost();
    const expectedCost = ethers.utils.parseEther("2");
    expect(result).to.equal(expectedCost);
  });

  it("Superowner can start and stop voting", async function () {
    await contractInstance.connect(superowner).startVoting();
    let inProgress = await contractInstance.inProgress();
    expect(inProgress).to.be.true;

    await contractInstance.connect(superowner).stopVoting();
    inProgress = await contractInstance.inProgress();
    expect(inProgress).to.be.false;
  });

  it("Users can vote", async function () {
    await contractInstance.connect(superowner).setVotingCost(1);
    await contractInstance.connect(superowner).approveUser(user1.address);
    await contractInstance.connect(superowner).addOwner(owner1.address);
    await contractInstance.connect(owner1).addCandidate(candidate1.address);

    await contractInstance.connect(user1).vote(candidate1.address, {
      value: ethers.utils.parseEther("1"),
    });

    const votes = await contractInstance.checkVotes(candidate1.address);
    expect(votes).to.equal(1);
  });

  it("Owners can withdraw funds", async function () {
    await contractInstance.connect(superowner).setVotingCost(1);
    await contractInstance.connect(superowner).approveUser(user1.address);
    await contractInstance.connect(superowner).addOwner(owner1.address);
    await contractInstance.connect(owner1).addCandidate(candidate1.address);
    await contractInstance.connect(superowner).startVoting();

    await contractInstance.connect(user1).vote(candidate1.address, {
      value: ethers.utils.parseEther("1"),
    });

    await contractInstance.connect(superowner).stopVoting();

    const initialBalance = await ethers.provider.getBalance(owner1.address);
    await contractInstance.connect(owner1).withdraw();
    const finalBalance = await ethers.provider.getBalance(owner1.address);

    const expectedIncrease = ethers.utils.parseEther("0.5");
    expect(finalBalance.sub(initialBalance)).to.equal(expectedIncrease);
  });
});
