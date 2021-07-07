// SPDX-License-Identifier: MIT
pragma solidity ^0.8;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/compound.sol";

contract TestCompoundErc20 {
  IERC20 public token;
  CErc20 public cToken;

  constructor(address _token, address _cToken) {
    token = IERC20(_token);
    cToken = CErc20(_cToken);
  }

  function supply(uint _amount) external {
    token.transferFrom(msg.sender, address(this), _amount);
    token.approve(address(cToken), _amount);
    require(cToken.mint(_amount) == 0, "mint failed");
  }

  function getCTokenBalance() external view returns (uint) {
    return cToken.balanceOf(address(this));
  }

  // not view function
  function getInfo() external returns (uint exchangeRate, uint supplyRate) {
    // Amount of current exchange rate from cToken to underlying
    exchangeRate = cToken.exchangeRateCurrent();
    // Amount added to you supply balance this block
    supplyRate = cToken.supplyRatePerBlock();
  }

  // not view function
  function estimateBalanceOfUnderlying() external returns (uint) {
    uint cTokenBal = cToken.balanceOf(address(this));
    uint exchangeRate = cToken.exchangeRateCurrent();
    uint decimals = 8; // WBTC = 8 decimals
    uint cTokenDecimals = 8;

    return (cTokenBal * exchangeRate) / 10**(18 + decimals - cTokenDecimals);
  }

  // not view function
  function balanceOfUnderlying() external returns (uint) {
    return cToken.balanceOfUnderlying(address(this));
  }

  function redeem(uint _cTokenAmount) external {
    require(cToken.redeem(_cTokenAmount) == 0, "redeem failed");
    // cToken.redeemUnderlying(underlying amount);
  }
}
