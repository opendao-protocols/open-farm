pragma solidity ^0.5.12;

import "./ERC20.sol";

contract MockERC20 is ERC20 {
    constructor(
        string memory name,
        string memory symbol,
        uint256 supply
    ) public ERC20(name, symbol) {
        _mint(msg.sender, supply);
    }

    function allocateTo(address account, uint256 amount) public returns (bool) {
        _mint(account, amount);
        return true;
    }
}