const { expect } = require("chai");

describe("Escrow Contract", function () {
  let contract;
  let contractInstance;
  let holder;
  let escrow;
  let thirdParty;

  beforeEach(async function () {
    contract = await ethers.getContractFactory("Escrow");
    [holder, escrow, thirdParty] = await ethers.getSigners();
    contractInstance = await contract.deploy();
  });

  it("Should create escrow contract with correct details", async function () {
    const initialBalance = ethers.utils.parseEther("1.5");

    await contractInstance
      .connect(holder)
      .createEscrowContract(escrow.address, escrow.address, {
        value: initialBalance,
      });

    const escrowContract = await contractInstance.escrowContracts(1);

    expect(escrowContract.holder).to.equal(holder.address);
    expect(escrowContract.escrow).to.equal(escrow.address);
    expect(escrowContract.balance).to.equal(initialBalance);
    expect(escrowContract.unlocked).to.be.false;

    const events = await contractInstance.queryFilter("EscrowCreated");
    expect(events.length).to.equal(1);
    expect(events[0].args.contractId).to.equal(1);
    expect(events[0].args._holder).to.equal(holder.address);
    expect(events[0].args._escrow).to.equal(escrow.address);
  });

  it("Should unlock funds by escrow agent", async function () {
    await contractInstance
      .connect(holder)
      .createEscrowContract(escrow.address, escrow.address, {
        value: ethers.utils.parseEther("1.5"),
      });

    await contractInstance.connect(escrow).unlockFunds(1);

    const escrowContract = await contractInstance.escrowContracts(1);
    expect(escrowContract.unlocked).to.be.true;
  });

  it("Should withdraw funds by contract holder", async function () {
    const initialBalance = ethers.utils.parseEther("1.5");
    const withdrawAmount = ethers.utils.parseEther("0.5");
    const recipient = thirdParty.address;

    await contractInstance
      .connect(holder)
      .createEscrowContract(escrow.address, escrow.address, {
        value: initialBalance,
      });

    await contractInstance.connect(escrow).unlockFunds(1);

    const initialRecipientBalance = await ethers.provider.getBalance(recipient);

    await contractInstance
      .connect(holder)
      .withdraw(1, withdrawAmount, recipient);

    const escrowContract = await contractInstance.escrowContracts(1);
    const finalRecipientBalance = await ethers.provider.getBalance(recipient);

    expect(escrowContract.balance).to.equal(initialBalance.sub(withdrawAmount));
    expect(finalRecipientBalance.sub(initialRecipientBalance)).to.equal(
      withdrawAmount
    );
  });

  it("Should revert if someone other than holder tries to withdraw", async function () {
    await contractInstance
      .connect(holder)
      .createEscrowContract(escrow.address, escrow.address, {
        value: ethers.utils.parseEther("1.5"),
      });

    await contractInstance.connect(escrow).unlockFunds(1);

    await expect(
      contractInstance.connect(thirdParty).withdraw(1, ethers.utils.parseEther("0.5"), thirdParty.address)
    ).to.be.revertedWith("You are not holder of this contract");
  });

  it("Should revert if trying to withdraw before unlocking", async function () {
    await contractInstance
      .connect(holder)
      .createEscrowContract(escrow.address, escrow.address, {
        value: ethers.utils.parseEther("1.5"),
      });

    await expect(
      contractInstance.connect(holder).withdraw(1, ethers.utils.parseEther("0.5"), thirdParty.address)
    ).to.be.revertedWith("This contract is locked");
  });
});
