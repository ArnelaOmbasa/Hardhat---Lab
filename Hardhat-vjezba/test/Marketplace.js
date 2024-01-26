const { expect } = require("chai");

describe("Marketplace Contract", function () {
  let contract;
  let contractInstance;
  let seller;
  let buyer;

  beforeEach(async function () {
    contract = await ethers.getContractFactory("Marketplace");
    [seller, buyer] = await ethers.getSigners();
    contractInstance = await contract.deploy();
  });

  it("Should list an item correctly", async function () {
    const itemName = "Laptop";
    const itemDescription = "High-performance laptop";
    const itemPrice = ethers.utils.parseEther("1");

    await contractInstance.connect(seller).listItem(itemName, itemDescription, itemPrice);

    const listedItem = await contractInstance.items(1);

    expect(listedItem.itemId).to.equal(1);
    expect(listedItem.name).to.equal(itemName);
    expect(listedItem.description).to.equal(itemDescription);
    expect(listedItem.price).to.equal(itemPrice);
    expect(listedItem.seller).to.equal(seller.address);
  });

  it("Should purchase an item correctly", async function () {
    const itemName = "Smartphone";
    const itemDescription = "Latest model";
    const itemPrice = ethers.utils.parseEther("0.5");

    await contractInstance.connect(seller).listItem(itemName, itemDescription, itemPrice);

    const initialSellerBalance = await ethers.provider.getBalance(seller.address);
    await contractInstance.connect(buyer).purchaseItem(1, { value: itemPrice });
    const finalSellerBalance = await ethers.provider.getBalance(seller.address);

    const itemAfterPurchase = await contractInstance.items(1);

    expect(itemAfterPurchase.itemId).to.equal(0);
    expect(finalSellerBalance.sub(initialSellerBalance)).to.equal(itemPrice);
  });

  it("Should update item details correctly", async function () {
    const itemName = "Table";
    const itemDescription = "Solid wood table";
    const itemPrice = ethers.utils.parseEther("2");

    await contractInstance.connect(seller).listItem(itemName, itemDescription, itemPrice);

    const updatedName = "Wooden Table";
    const updatedDescription = "Premium quality wooden table";
    const updatedPrice = ethers.utils.parseEther("2.5");

    await contractInstance.connect(seller).updateName(1, updatedName);
    await contractInstance.connect(seller).updateDescription(1, updatedDescription);
    await contractInstance.connect(seller).updatePrice(1, updatedPrice);

    const updatedItem = await contractInstance.items(1);

    expect(updatedItem.name).to.equal(updatedName);
    expect(updatedItem.description).to.equal(updatedDescription);
    expect(updatedItem.price).to.equal(updatedPrice);
  });

  it("Should remove an item correctly", async function () {
    const itemName = "Camera";
    const itemDescription = "High-resolution digital camera";
    const itemPrice = ethers.utils.parseEther("1.2");

    await contractInstance.connect(seller).listItem(itemName, itemDescription, itemPrice);

    await contractInstance.connect(seller).removeItem(1);

    const removedItem = await contractInstance.items(1);
    expect(removedItem.itemId).to.equal(0);
  });
});
