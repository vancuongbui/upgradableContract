pragma solidity ^0.4.24;

import "./SafeMath.sol";

contract Victim {
    using SafeMath for uint256;
    bytes32 public name = "Victim";
    uint8 public decimals = 2;
    
    mapping(address => uint) public balances;

    function donate(address _to) public payable {
        balances[_to] += msg.value;
    }

    function balanceOf(address _who) public constant returns (uint balance) {
        return balances[_who];
    }

    function withdraw(uint _amount) public {
        if(balances[msg.sender] >= _amount) {
        if(msg.sender.call.value(_amount)()) {
            _amount;
        }
        balances[msg.sender] -= _amount;
        }
    }
    
    function() payable {}
}