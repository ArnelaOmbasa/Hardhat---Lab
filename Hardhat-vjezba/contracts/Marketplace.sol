// SPDX-License-Identifier: MIT
 
pragma solidity 0.8.22;
 
contract Marketplace {
    struct MarketItem {
        uint itemId;
        string name;
        string description;
        uint price; // ether
        address seller;
    }
 
    mapping(uint => MarketItem) public items;
    uint private itemId;
 
    event ListItemEvent(uint id, string name, address seller);
    event PurchaseItemEvent(uint id, address buyer);
 
    modifier autoIncrement {
        _;
        itemId += 1;
    }
 
    modifier onlySeller(uint _id) {
        require(msg.sender == items[_id].seller, "You are not the seller of this item.");
        _;
    }
 
    function listItem(string memory name, string memory description, uint price) external autoIncrement returns (uint) {
        items[itemId] = MarketItem(itemId, name, description, price, msg.sender);
        emit ListItemEvent(itemId, name, msg.sender);
 
        return itemId;
    }
 
    function purchaseItem(uint _id) external payable {
        // 1 ether = 10**18 wei
        require(items[_id].price * 10**18 == msg.value, "You need to send the exact Ether amount.");
        emit PurchaseItemEvent(_id, msg.sender);
 
        (bool sent,) = items[_id].seller.call{value: msg.value}("");
        require(sent, "Failed to send Ether");
 
        delete items[_id];
    }
 
    function updateName(uint _id, string memory _name) external onlySeller(_id) {
        items[_id].name = _name;
    }
 
    function updateDescription(uint _id, string memory _description) external onlySeller(_id) {
        items[_id].description = _description;
    }
 
    function updatePrice(uint _id, uint _price) external onlySeller(_id) {
        items[_id].price = _price;
    }
 
    function removeItem(uint _id) external onlySeller(_id) {
        delete items[_id];
    }
}