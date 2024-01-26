// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;


contract Joint {
   struct JointAccount {
       uint256 accountId;
       address user1;
       address user2;
       uint256 balance;
   }


   mapping(uint256 => JointAccount) private accounts;


   uint256 autoContractId;


   modifier autoIncrementContractId() {
       _;
       autoContractId += 1;
   }


   modifier onlyOwner(address _account1, address _account2) {
       require(
           msg.sender == _account1 || msg.sender == _account2,
           "You are not permitted to call this function"
       );
       _;
   }


   event AccountCreated(
       uint256 indexed contractId,
       address _account1,
       address _account2
   );


   function createAccount(
       address _account1,
       address _account2
   ) external autoIncrementContractId onlyOwner(_account1, _account2) {
       accounts[autoContractId] = JointAccount(
           autoContractId,
           _account1,
           _account2,
           0
       );


       emit AccountCreated(autoContractId, _account1, _account2);
   }


   function deposit(uint256 _accountId) public payable {
       accounts[_accountId].balance += msg.value;
   }


   function balance(uint256 _accountId) public view returns (uint) {
       return accounts[_accountId].balance;
   }


   function withdraw(
       uint256 _accountId,
       uint256 _amount,
       address _destination
   ) public {
       require(accounts[_accountId].balance > _amount, "Not enough balance");
       require(
           accounts[_accountId].user1 == msg.sender ||
               accounts[_accountId].user2 == msg.sender,
           "You are not one of the owners"
       );
       accounts[_accountId].balance -= _amount;
       (bool sent, ) = _destination.call{value: _amount}("");
       require(sent, "Transaction failed");
   }
}
