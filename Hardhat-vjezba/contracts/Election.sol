// SPDX-License-Identifier: MIT
 
pragma solidity 0.8.22;
 
contract Election {
    address private superowner;
    mapping(address => bool) private owners;
    mapping(address => bool) private candidates;
    mapping(address => bool) private users;
    mapping(address => uint) private votes;
    mapping(address => bool) hasWithdrawn;
    bool private inProgress;
    bool private stoppedOnce;
    uint private finalBalance;
    uint private numOwners;
 
    uint private votingCost;
 
    constructor() {
        superowner = msg.sender;
    }
 
    modifier isSuperowner() {
        require(msg.sender == superowner, "Not a superowner.");
        _;
    }
 
    modifier isAnyOwner() {
        require(msg.sender == superowner || owners[msg.sender], "Not a superowner nor an owner.");
        _;   
    }
 
    modifier notStarted() {
        require(!inProgress, "You cannot modify this while voting is in progress.");
        _;
    }
 
    function addOwner(address _address) external isSuperowner notStarted {
        owners[_address] = true;
        numOwners += 1;
    }
 
    function removeOwner(address _address) external isSuperowner {
        require(!inProgress, "You cannot modify this while voting is in progress.");
        delete owners[_address];
        numOwners -= 1;
    }
 
    function addCandidate(address _address) external isAnyOwner {
        require(!inProgress, "You cannot modify this while voting is in progress.");
        candidates[_address] = true;
    }
 
    function removeCandidate(address _address) external isAnyOwner {
        require(!inProgress, "You cannot modify this while voting is in progress.");
        delete candidates[_address];
    }
 
    function approveUser(address _address) external isAnyOwner {
        users[_address] = true;
    }
 
    function setVotingCost(uint _cost) external isSuperowner {
        require(!inProgress, "You cannot modify this while voting is in progress.");
        require(_cost >= 0, "The voting cost has to be non-zero.");
        votingCost = 10**18 * _cost;
    }
 
    function startVoting() external isSuperowner {
        require(!stoppedOnce, "You cannot restart a vote.");
        inProgress = true;
    }
 
    function stopVoting() external isSuperowner {
        inProgress = false;
        stoppedOnce = true;
        finalBalance = address(this).balance;
    }
 
    function vote(address _address) external payable {
        require(inProgress, "The voting has not started.");
        require(msg.value == votingCost, "You need to send the proper Ether amount to vote.");
        require(candidates[_address], "This candidate does not exist.");
        require(users[msg.sender], "You are not approved to vote / you have already voted.");
 
        votes[_address] += 1;
        delete users[msg.sender];
    }
 
    function checkVotes(address _address) external view returns (uint) {
        return votes[_address];
    }
 
    function withdraw() external isAnyOwner {
        require(!inProgress, "You cannot withdraw Ether while voting is in progress.");
        require(!hasWithdrawn[msg.sender], "You have already withdrawn your payout.");
 
        hasWithdrawn[msg.sender] = true;
        if (msg.sender == superowner) {
            (bool sent, ) = msg.sender.call{value: finalBalance / 2}("");
            require(sent, "Failed to send Ether");
        } else {
            (bool sent, ) = msg.sender.call{value: (finalBalance / 2) / numOwners}("");
            require(sent, "Failed to send Ether");
        }
    }
}