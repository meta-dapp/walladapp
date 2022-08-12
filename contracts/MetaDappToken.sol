// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MetaDappToken is ERC20 {
    constructor() ERC20("MetaDapp Token", "MDA"){
        _mint(msg.sender, 50000 * 10**18);
    }

    function burn(uint256 amount) public {
        _burn(_msgSender(), amount);
    }
}