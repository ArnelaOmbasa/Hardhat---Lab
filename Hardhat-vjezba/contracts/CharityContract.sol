// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract CharityDonationPlatform is Ownable {
    bool public paused;
    uint public minDonationAmount;
    address[] public verifiedCharities;

    mapping(address => bool) public isCharity;
    mapping(address => uint) public totalDonations;

    event CharityAdded(address indexed charityAddress);
    event CharityRemoved(address indexed charityAddress);

    modifier notPaused() {
        require(!paused, "Donation functionality is currently paused");
        _;
    }

    modifier validDonationAmount(uint _amount) {
        require(_amount >= minDonationAmount && _amount > 0, "Invalid donation amount");
        _;
    }

    constructor(uint _minDonationAmount) {
        minDonationAmount = _minDonationAmount;
    }

    function addCharity(address _charityAddress) external onlyOwner {
        require(!isCharity[_charityAddress], "Charity already added");
        isCharity[_charityAddress] = true;
        verifiedCharities.push(_charityAddress);
        emit CharityAdded(_charityAddress);
    }

    function removeCharity(address _charityAddress) external onlyOwner {
        require(isCharity[_charityAddress], "Charity not found");
        isCharity[_charityAddress] = false;

        for (uint i = 0; i < verifiedCharities.length; i++) {
            if (verifiedCharities[i] == _charityAddress) {
                verifiedCharities[i] = verifiedCharities[verifiedCharities.length - 1];
                verifiedCharities.pop();
                emit CharityRemoved(_charityAddress);
                break;
            }
        }
    }

    function donate(address _charityAddress) external payable notPaused validDonationAmount(msg.value) {
        require(isCharity[_charityAddress], "Invalid charity address");
        totalDonations[_charityAddress] += msg.value;
    }

    function withdrawDonations() external {
        address payable charity = payable(msg.sender);
        require(isCharity[charity], "Only verified charities can withdraw donations");

        uint amount = totalDonations[charity];
        totalDonations[charity] = 0;

        charity.transfer(amount);
    }

    function viewCharities() external view returns (address[] memory) {
        return verifiedCharities;
    }

    function updateMinDonationAmount(uint _newMinDonationAmount) external onlyOwner {
        minDonationAmount = _newMinDonationAmount;
    }

    function toggleCircuitBreaker() external onlyOwner {
        paused = !paused;
    }

    receive() external payable {
        revert("Direct donations not accepted");
    }
}
