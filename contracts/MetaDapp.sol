// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Address.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MetaDapp is Ownable {

    using Address for address;
    using SafeMath for uint;
    using SafeMath for uint256;

    uint private secureAddPercent = 5;
    address private noOne = address(0);
    IERC20 private token;

    struct User {
        string dataHash;
        bool updated;
        uint total_products;
        uint[] products;
    }

    struct Product {
        string name;
        string dataHash;
        string section;
        uint price;
        address owner;
        address reserved_by;
    }

    Product[] private products;
    mapping(address => User) public users;

    uint private _totalUsers;

    event ProductPurchased(address indexed user, address owner, uint price);
    event ProductAdded(address indexed owner, string name, uint price);

    constructor(address _token){
        token = IERC20(_token);
        _totalUsers = 0;
    }

    function setSecureAddPercent(uint percent) external onlyOwner {
        secureAddPercent = percent;
    }

    function getSecureAddPercent() private onlyOwner view returns(uint){
        return secureAddPercent;
    }

    function __percentValue(uint _amount) public view returns(uint){
        return (secureAddPercent * _amount) / 100;
    }

    function __amount(uint _amount) private pure returns(uint){
        return _amount * (10 ** 18);
    }

    function addProduct(string memory name, 
                        string memory dataHash, 
                        string memory section, uint price) external {

        transferTokens(address(this), __amount(__percentValue(price)), _msgSender());

        products.push(Product(name, dataHash, section, __amount(price), _msgSender(), noOne));
        emit ProductAdded(_msgSender(), name, __amount(price));
    }

    function transferTokens(address _owner, uint _price, address _buyer) private {
        require(_price <= token.balanceOf(_buyer), 'Insuficent tokens to make transfer');
        require(token.allowance(_buyer, address(this)) >= _price, 'Insuficent allowence to make reserve');

        bool sent = token.transferFrom(_buyer, _owner, _price);
        require(sent, 'Not sent');
    }

    function updateProductPrice(uint product_id, uint price) external {
        require(_msgSender() != noOne);
        Product storage product = products[product_id];
        require(_msgSender() == product.owner);
        require(product.reserved_by == noOne);
        product.price = __amount(price);
    }

    function updateUserContact(string memory dataHash) external {
        require(_msgSender() != noOne);
        User storage user = users[_msgSender()];
        user.dataHash = dataHash;

        if(!user.updated)
            _totalUsers++;

        user.updated = true;
    }

    function buyProduct(uint product_id) external {
        Product storage product = products[product_id];
        require(_msgSender() != product.owner, 'You cannot buy your own products');
        transferTokens(product.owner, product.price, _msgSender());
        User storage buyer = users[_msgSender()];
        buyer.total_products += 1;
        buyer.products.push(product_id);
        product.reserved_by = _msgSender();

        emit ProductPurchased(_msgSender(), product.owner, product.price);
    }

    function totalUsers() external view returns (uint){
        return _totalUsers;
    }

    function getProducts() external view returns(Product[] memory){
      return products;
    }

    function getProduct(uint product_id) external view returns(Product memory){
      return products[product_id];
    }

    function getUser(address userAddress) external view returns(User memory){
      return users[userAddress];
    }

    function withdrawBNB(address payable account) external onlyOwner {
        (bool success, ) = account.call{value: address(this).balance}("");
        require(success);
    }

    function withdraw(address to, uint256 amount) external onlyOwner{
        require(token.transfer(to, amount));
    }
}