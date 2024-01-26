// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


contract CharityDonationPlatform {
    address public administrator;
    bool public paused;
    uint public minDonationAmount;
    address[] public verifiedCharities;


    mapping(address => bool) public isCharity;
    mapping(address => uint) public totalDonations;


    event CharityAdded(address indexed charityAddress);


    modifier onlyAdministrator() {
        require(msg.sender == administrator, "Only the administrator can call this function");
        _;
    }


    modifier notPaused() {
        require(!paused, "Donation functionality is currently paused");
        _;
    }


    modifier validDonationAmount(uint _amount) {
        require(_amount >= minDonationAmount, "Donation amount is less than the specified minimum");
        _;
    }


    constructor(uint _minDonationAmount) {
        administrator = msg.sender;
        paused = false;
        minDonationAmount = _minDonationAmount;
    }


    function addCharity(address _charityAddress) external onlyAdministrator {
        isCharity[_charityAddress] = true;
        verifiedCharities.push(_charityAddress);
        emit CharityAdded(_charityAddress);
    }


    function removeCharity(address _charityAddress) external onlyAdministrator {
        isCharity[_charityAddress] = false;
        for (uint i = 0; i < verifiedCharities.length; i++) {
            if (verifiedCharities[i] == _charityAddress) {
               
                for (uint j = i; j < verifiedCharities.length - 1; j++) {
                    verifiedCharities[j] = verifiedCharities[j + 1];
                }
                verifiedCharities.pop();
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


    function updateMinDonationAmount(uint _newMinDonationAmount) external onlyAdministrator {
        minDonationAmount = _newMinDonationAmount;
    }


    function toggleCircuitBreaker() external onlyAdministrator {
        paused = !paused;
    }
}
