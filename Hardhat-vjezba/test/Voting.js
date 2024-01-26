const { expect } = require("chai");

describe("SimpleElection Contract", function () {
  let simpleElectionInstance;
  let owner;
  let voter1;

  beforeEach(async function () {
    const SimpleElection = await ethers.getContractFactory("SimpleElection");
    [owner, voter1] = await ethers.getSigners();
    simpleElectionInstance = await SimpleElection.deploy();
  });

  it("should add a candidate", async function () {
    await simpleElectionInstance.addCandidate("Candidate 1");
    const candidates = await simpleElectionInstance.getCandidates();

    expect(candidates.length).to.equal(1);
    expect(candidates[0].name).to.equal("Candidate 1");
    expect(candidates[0].votes).to.equal(0);
  });

  it("should allow a voter to submit a vote", async function () {
    await simpleElectionInstance.addCandidate("Candidate 1");

    // Voter1 submits a vote for Candidate 1
    await simpleElectionInstance.connect(voter1).vote(0);

    // Check if the vote is submitted successfully
    const candidates = await simpleElectionInstance.getCandidates();
    expect(candidates[0].votes).to.equal(1);

    // Check if the contract emitted the VoteSubmitted event
    await expect(
      simpleElectionInstance.connect(voter1).vote(0)
    ).to.emit(simpleElectionInstance, "VoteSubmitted").withArgs(0);
  });

  it("should not allow a voter to vote for a non-existing candidate", async function () {
    // Attempt to vote for a candidate that doesn't exist (ID: 0)
    await expect(
      simpleElectionInstance.connect(voter1).vote(0)
    ).to.be.revertedWith("This candidate does not exist.");
  });

  it("should not allow a voter to vote more than once", async function () {
    await simpleElectionInstance.addCandidate("Candidate 1");

    // Voter1 submits a vote for Candidate 1
    await simpleElectionInstance.connect(voter1).vote(0);

    // Attempt to vote again
    await expect(
      simpleElectionInstance.connect(voter1).vote(0)
    ).to.be.revertedWith("You have already voted.");
  });

  it("should get the list of candidates", async function () {
    await simpleElectionInstance.addCandidate("Candidate 1");
    await simpleElectionInstance.addCandidate("Candidate 2");

    const candidates = await simpleElectionInstance.getCandidates();

    expect(candidates.length).to.equal(2);
    expect(candidates[0].name).to.equal("Candidate 1");
    expect(candidates[1].name).to.equal("Candidate 2");
  });
});
