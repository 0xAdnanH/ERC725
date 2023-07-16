//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Num {
    address public slot0;

    uint256 public count;

    function incrementCount() public payable {
        count++;
    }

    function setAddress(address _slot0) public {
        slot0 = _slot0;
    }
}
