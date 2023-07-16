//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract money {
    uint256 moneyReceived = msg.value;
    event received(uint256 moneyReceived);

    receive() external payable {
        emit received(moneyReceived);
    }
}
