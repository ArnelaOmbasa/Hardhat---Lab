const { expect } = require("chai");


let jointInstance;


describe("Joint tests", function () {
 beforeEach(async function () {
   let Joint = await ethers.getContractFactory("Joint");
   jointInstance = await Joint.deploy();
 });


 it("AccountCreated Emit", async function () {
   const [owner, address1, address2] = await ethers.getSigners();


   jointInstance = jointInstance.connect(address1);


   await expect(jointInstance.createAccount(address1, address2))
     .to.emit(jointInstance, "AccountCreated")
     .withArgs(0, address1.address, address2.address);
 });


 it("Create account revert", async function () {
   const [owner, address1, address2] = await ethers.getSigners();


   await expect(
     jointInstance.createAccount(address1, address2)
   ).to.be.revertedWith("You are not permitted to call this function");
 });


 it("Deposits", async function () {
   const [owner, address1, address2] = await ethers.getSigners();


   jointInstance = jointInstance.connect(address1);


   await jointInstance.createAccount(address1, address2);
   expect(await jointInstance.balance(0)).to.equal("0");


   await jointInstance.deposit(0, { value: ethers.parseEther("1") });
   expect(await jointInstance.balance(0)).to.equal((1 * 10 ** 18).toString());
 });
});


