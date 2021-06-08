// SPDX-License-Identifier: MIT
pragma solidity ^0.8;

interface StableSwapY {
  function get_virtual_price() external view returns (uint);

  function exchange_underlying(
    int128 i,
    int128 j,
    uint dx,
    uint min_dy
  ) external;
}
