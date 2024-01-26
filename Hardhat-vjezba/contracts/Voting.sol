// SPDX-License-Identifier: MIT
pragma solidity 0.8.22;
 
contract SimpleElection {
    struct Candidate {
        uint id;
        string name;
        uint votes;
    }
 
    address owner;
    uint nextId = 0;
    mapping(uint => Candidate) candidates;
    mapping(address => bool) hasVoted;
 
    event VoteSubmitted(uint _candidateId);
 
    modifier onlyOwner {
        require(msg.sender == owner, "Not owner.");
        _;
    }
 
    constructor() {
        owner = msg.sender;
    }
 
    function addCandidate(string memory _name) external onlyOwner {
        candidates[nextId] = Candidate(nextId, _name, 0);
        nextId++;
    }
 
    function vote(uint _id) external {
        // require(!hasVoted[msg.sender], "You have already voted.");
        require(_id >= 0 && _id < nextId, "This candidate does not exist.");
        candidates[_id].votes++;
        hasVoted[msg.sender] = true;
        emit VoteSubmitted(_id);
    }
 
    function getCandidates() external view returns (Candidate[] memory) {
        Candidate[] memory _candidates = new Candidate[](nextId);
        for (uint i = 0; i < nextId; i++) {
            _candidates[i] = candidates[i];
        }
        return _candidates;
    }
}