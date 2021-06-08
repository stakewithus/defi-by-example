// SPDX-License-Identifier: MIT
pragma solidity ^0.8;

import "./interfaces/WETH10.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract TestWethFlashMint {
  address private WETH = 0xf4BB2e28688e89fCcE3c0580D37d36A7672E8A9F;
  bytes32 public immutable CALLBACK_SUCCESS =
    keccak256("ERC3156FlashBorrower.onFlashLoan");

  event Log(string name, uint val);

  function flash() external {
    uint amount = 10**18;
    IERC20(WETH).approve(WETH, amount);
    WETH10(WETH).flashLoan(address(this), WETH, amount, "");
  }

  // called by WETH10
  function onFlashLoan(
    address sender,
    address token,
    uint amount,
    uint fee,
    bytes calldata data
  ) external returns (bytes32) {
    uint bal = IERC20(WETH).balanceOf(address(this));
    emit Log("balance", bal);

    return CALLBACK_SUCCESS;
  }
}
