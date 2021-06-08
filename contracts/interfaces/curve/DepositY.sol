// SPDX-License-Identifier: MIT
pragma solidity ^0.8;

interface DepositY {
  function calc_withdraw_one_coin(uint _token_amount, int128 i)
    external
    view
    returns (uint);
}
