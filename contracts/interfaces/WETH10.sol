// SPDX-License-Identifier: MIT
pragma solidity ^0.8;

interface WETH10 {
  function flashLoan(
    address receiver,
    address token,
    uint value,
    bytes calldata data
  ) external returns (bool);
}
