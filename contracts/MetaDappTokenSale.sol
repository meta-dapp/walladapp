// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Address.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract MetaDappTokenSale is Ownable {

    using Address for address;
    using SafeMath for uint;
    using SafeMath for uint256;

    uint private buyPrice;
    uint private sold;
    uint private toSold;
    address private noOne = address(0);
    IERC20 private token;
    uint private currentPhaseIndex;

    struct Phase {
        uint total;
        uint price;
        uint phase;
    }

    Phase [] private phases;

    event Sell(address _buyer, uint _amount);

    constructor(address _token) {
        token = IERC20(_token);
        buyPrice = 0.000005 * 10**18;
        currentPhaseIndex = 0;
        sold = 0;
        toSold = __amount(500000);

        for(uint i=1; i<=10; i++){
            phases.push(Phase(50000, i*buyPrice, i));
        }
    }

    function buy(uint tokens) external payable {
        require(msg.value / phase(currentPhaseIndex).price == tokens, 'Error value not match');
        require(phase(currentPhaseIndex).total <= __amount(tokens), 'Error low balance');
        require(token.balanceOf(address(this)) >= __amount(tokens), 'Sold out');
        require(token.transfer(_msgSender(), __amount(tokens)));

        sold += tokens;
        phases[currentPhaseIndex].total -= tokens;
        if(phase(currentPhaseIndex).total <= 0)
            currentPhaseIndex++;

        buyPrice = phase(currentPhaseIndex).price;

        emit Sell(_msgSender(), tokens);
    }

    function __unAmount(uint256 _amount, uint decimals) private pure returns(uint){
        return _amount / (10**decimals);
    }

    function __tokens() external view returns(uint){
        return __unAmount(token.balanceOf(_msgSender()), 18);
    }

    function __tokenPrice() external view returns(uint){
        return buyPrice;
    }

    function endSale() external onlyOwner {
        require(token.transfer(owner(), token.balanceOf(address(this))));
        payable(owner()).transfer(address(this).balance);
    }

    function tokensSold() external view returns(uint){
        return sold;
    }

    function totalTokens() external view returns(uint){
        return __unAmount(token.totalSupply(), 18);
    }

    function __phases() external view returns(Phase [] memory) {
        return phases;
    }

    function currentPhase() external view returns(Phase memory){
        return phase(currentPhaseIndex);
    }

    function isOwner() external view returns(bool){
        return _msgSender() == owner();
    }

    function phase(uint phase_id) public view returns(Phase memory){
        return phases[phase_id];
    }

    function __amount(uint _amount) private pure returns(uint){
        return _amount * (10 ** 18);
    }
}

