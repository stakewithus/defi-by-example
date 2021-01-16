// SPDX-License-Identifier: MIT
pragma solidity ^0.7;

interface IUniswapV2Pair {
  function token0() external view returns (address);

  function token1() external view returns (address);

  function swap(
    uint256 amount0Out,
    uint256 amount1Out,
    address to,
    bytes calldata data
  ) external;
}

interface IUniswapV2Factory {
  function getPair(address token0, address token1) external returns (address);
}
