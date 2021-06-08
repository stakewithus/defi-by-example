// SPDX-License-Identifier: MIT
pragma solidity ^0.8;

interface IFlashLoanReceiver {
  function executeOperation(
    address[] calldata assets,
    uint[] calldata amounts,
    uint[] calldata premiums,
    address initiator,
    bytes calldata params
  ) external returns (bool);
}
