pragma solidity >=0.4.0 <0.9.0;
import "./Token.sol";

contract EthSwap {
    string public name = "EthSwap Instanct Exchange";
    Token public token;
    uint256 public rate = 100;

    event TokenPurchased(
        address account,
        address token,
        uint256 amount,
        uint256 rate
    );

    event TokenSold(
        address account,
        address token,
        uint256 amount,
        uint256 rate
    );

    constructor(Token _token) public {
        // _token是address
        token = _token;
    }

    function buyTokens() public payable {
        // calculate the number of tokens to buy
        uint256 tokenAmount = msg.value * rate;

        // Make sure EthSwap has enough tokens equal to the tokenAmount
        require(token.balanceOf(address(this)) >= tokenAmount); // address(this)是EthSwap合约的地址

        // Transfer tokens to the user
        token.transfer(msg.sender, tokenAmount);

        emit TokenPurchased(msg.sender, address(token), tokenAmount, rate);
    }

    function sellTokens(uint256 _amount) public {
        require(token.balanceOf(msg.sender) >= _amount);

        uint256 etherAmount = _amount / rate;

        // 确保合约上有足够的ether让用户redeem
        require(address(this).balance >= etherAmount);

        // 本合约收回_amount数量的token
        // token.transfer(address(this), _amount); // 理论上这样可以，但是实际不行。只有给用户的才能是transfer。给合约自己的transfer行为要用transferFrom
        token.transferFrom(msg.sender, address(this), _amount);

        // 本合约给用户etherAmount数量的eth
        msg.sender.transfer(etherAmount); // This function allows to send ether from the smart contract to the sender address.

        emit TokenSold(msg.sender, address(token), _amount, rate);
    }
}
