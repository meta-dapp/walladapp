// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


contract MetaDappTokenSale {

    address public owner;
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
        owner = msg.sender;
        token = IERC20(_token);
        buyPrice = 0.000005 * 10**18;
        currentPhaseIndex = 0;
        sold = 0;
        toSold = __amount(500000);

        for(uint i=1; i<=10; i++){
            phases.push(Phase(50000, i*buyPrice, i));
        }
    }

    function buy(uint tokens) public payable {
        require(msg.value / phase(currentPhaseIndex).price == tokens, 'Error value not match');
        require(phase(currentPhaseIndex).total <= __amount(tokens), 'Error low balance');
        require(token.balanceOf(address(this)) >= __amount(tokens), 'Sold out');
        require(token.transfer(msg.sender, __amount(tokens)));

        sold += tokens;
        phases[currentPhaseIndex].total -= tokens;
        if(phase(currentPhaseIndex).total <= 0)
            currentPhaseIndex++;

        buyPrice = phase(currentPhaseIndex).price;

        emit Sell(msg.sender, tokens);
    }

    function __unAmount(uint256 _amount, uint decimals) private pure returns(uint){
        return _amount / (10**decimals);
    }

    function __tokens() public view returns(uint){
        return __unAmount(token.balanceOf(msg.sender), 18);
    }

    function __tokenPrice() public view returns(uint){
        return buyPrice;
    }

    function endSale() public isOwner {
        require(token.transfer(owner, token.balanceOf(address(this))));
        payable(owner).transfer(address(this).balance);
    }

    function tokensSold() public view returns(uint){
        return sold;
    }

    function totalTokens() public view returns(uint){
        return __unAmount(token.totalSupply(), 18);
    }

    function __phases() public view returns(Phase [] memory) {
        return phases;
    }

    function currentPhase() public view returns(Phase memory){
        return phase(currentPhaseIndex);
    }

    function __isOwner() public view returns(bool){
        return msg.sender == owner;
    }

    function phase(uint phase_id) public view returns(Phase memory){
        return phases[phase_id];
    }

    function __amount(uint _amount) private pure returns(uint){
        return _amount * (10 ** 18);
    }


     modifier isOwner(){
        require(msg.sender == owner);
        _;
    }
}

