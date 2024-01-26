// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;


contract Escrow {
    struct EscrowContract {
        uint256 contractId;
        address holder;
        address escrow;
        uint256 balance;
        bool unlocked;
    }


    mapping(uint256 => EscrowContract) private escrowContracts;


    uint256 autoContractId;
    modifier autoIncrementContractId() {
        _;
        autoContractId += 1;
    }


    modifier onlyOwner(address _holder, address _escrow) {
        require(
            msg.sender == _holder || msg.sender == _escrow,
            "You are not permitted to call this function"
        );
        _;
    }


    event EscrowCreated(
        uint256 indexed contractId,
        address _holder,
        address _escrow
    );


    function createEscrowContract(address _holder, address _escrow)
        external
        payable
        autoIncrementContractId
        onlyOwner(_holder, _escrow)
    {
        escrowContracts[autoContractId] = EscrowContract(
            autoContractId,
            _holder,
            _escrow,
            msg.value,
            false
        );


        emit EscrowCreated(autoContractId, _holder, _escrow);
    }


    function unlockFunds(uint256 _contractId) external {
        require(
            escrowContracts[_contractId].escrow == msg.sender,
            "You are not escrow agent"
        );
        escrowContracts[_contractId].unlocked = true;
    }


    function withdraw(
        uint256 _contractId,
        uint256 _amount,
        address _to
    ) external payable {
        require(
            msg.sender == escrowContracts[_contractId].holder,
            "You are not holder of this contract"
        );
        require(
            escrowContracts[_contractId].unlocked == true,
            "This contract is locked"
        );
        require(
            escrowContracts[_contractId].balance >= _amount,
            "Not enough ether in your balance"
        );


        escrowContracts[_contractId].balance -= _amount;


        (bool sent, ) = _to.call{value: msg.value}("");
        require(sent, "Failed to send Ethereum");
    }
}
