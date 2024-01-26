
const { expect } = require("chai");

describe("contract Contract", function () {
  let contract;
  let contractInstance;
  let owner;
  let address1;
  let address2;
  let address3;

  beforeEach(async function () {
    contract = await ethers.getContractFactory("CharityContract");
    [owner, address1, address2, address3] = await ethers.getSigners();
    contractInstance = await contract.deploy(ethers.parseEther("10"));
  });

  it("Adding", async function () {
    await contractInstance.addCharity(address1);
    await contractInstance.addCharity(address2);

    expect(await contractInstance.isCharity(address1)).to.be.true;
    expect(await contractInstance.isCharity(address2)).to.be.true;
  });

  it("Transactions", async function () {
    await contractInstance.addCharity(address1);

    await contractInstance
      .connect(address3)
      .donate(address1, { value: ethers.parseEther("15") });

    expect(await contractInstance.viewCharityBalance(address1)).to.equal(
      (15 * 10 ** 18).toString()
    );

    await contractInstance.connect(address1).withdrawDonations();

    expect(await contractInstance.viewCharityBalance(address1)).to.equal(0);
  });

  it("Circuit breaker", async function () {
    await contractInstance.toggleCircuitBreaker();

    await expect(
      contractInstance
        .connect(address3)
        .donate(address1, { value: ethers.parseEther("15") })
    ).to.be.revertedWith("Donation functionality is currently paused");

    await contractInstance.toggleCircuitBreaker();

    await expect(
      contractInstance
        .connect(address3)
        .donate(address1, { value: ethers.parseEther("15") })
    ).to.not.be.revertedWith("Donation functionality is currently paused");
  });

  it("Min ammount", async function () {
    await contractInstance.addCharity(address1);

    await expect(
      contractInstance
        .connect(address3)
        .donate(address1, { value: ethers.parseEther("5") })
    ).to.be.revertedWith("Donation amount is less than the specified minimum");

    await expect(
      contractInstance
        .connect(address3)
        .donate(address1, { value: ethers.parseEther("10") })
    ).to.not.be.revertedWith(
      "Donation amount is less than the specified minimum"
    );
  });
});
