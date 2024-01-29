// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { ethers } from "hardhat";
import { Greeter } from "../typechain";

contract GreeterImplementation is Greeter {
    uint private luckyNumber;
    uint private totalSum;

    modifier onlyOwner() {
        require(msg.sender == owner(), "Not owner");
        _;
    }

    function sum(uint a, uint b) external override returns (uint) {
        totalSum = a + b;
        return totalSum;
    }

    function getMyLuckyNumber() external view override returns (uint) {
        return luckyNumber;
    }

    function saveLuckyNumber(uint number) external override onlyOwner {
        require(number != 0, "Lucky number should not be 0.");
        require(luckyNumber == 0, "You already have a lucky number.");
        luckyNumber = number;
    }

    function updateLuckyNumber(uint currentNumber, uint newNumber) external override onlyOwner {
        require(luckyNumber == currentNumber, "Not your previous lucky number.");
        luckyNumber = newNumber;
    }
}
