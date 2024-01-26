// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


contract DecentralizedIdentityVerification {
    address public administrator;
    bool public paused;


    struct Identity {
        address userAddress;
        string fullName;
        string dateOfBirth;
        bool isVerified;
    }


    mapping(address => Identity) public identityRegistry;




    modifier onlyAdministrator() {
        require(msg.sender == administrator, "Only the administrator can call this function");
        _;
    }


    modifier notPaused() {
        require(!paused, "Identity verification functionality is currently paused");
        _;
    }


    constructor() {
        administrator = msg.sender;
        paused = false;
    }


    function registerIdentity(string memory _fullName, string memory _dateOfBirth) external notPaused {
        Identity storage user = identityRegistry[msg.sender];
        require(user.userAddress == address(0), "Identity already registered");


        user.userAddress = msg.sender;
        user.fullName = _fullName;
        user.dateOfBirth = _dateOfBirth;


    }


    function verifyIdentity(address _userAddress) external onlyAdministrator notPaused {
        Identity storage user = identityRegistry[_userAddress];
        require(user.userAddress != address(0), "Identity not registered");


        user.isVerified = true;


    }


    function viewIdentityDetails() external view returns (Identity memory) {
        Identity storage user = identityRegistry[msg.sender];
        require(user.userAddress != address(0), "Identity not registered");


        return user;
    }


    function toggleCircuitBreaker() external onlyAdministrator {
        paused = !paused;
    }
}
