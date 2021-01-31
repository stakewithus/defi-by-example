// SPDX-License-Identifier: MIT
pragma solidity ^0.7;

interface IFlashLoanReceiver {
  function executeOperation(
    address reserve,
    uint256 amount,
    uint256 fee,
    bytes calldata params
  ) external;
}
