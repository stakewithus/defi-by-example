// SPDX-License-Identifier: MIT
pragma solidity ^0.7;

interface WETH10 {
  function flashLoan(
    address receiver,
    address token,
    uint256 value,
    bytes calldata data
  ) external returns (bool);
}
