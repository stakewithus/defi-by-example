# @version ^0.2
from vyper.interfaces import ERC20

interface StableSwap:
  def add_liquidity(amounts: uint256[3], min_lp: uint256): nonpayable
  def remove_liquidity(lp: uint256, min_amounts: uint256[3]): nonpayable
  def remove_liquidity_one_coin(lp: uint256, i: int128, min_amount: uint256): nonpayable
  def calc_withdraw_one_coin(lp: uint256, i: int128) -> uint256: view
  def get_virtual_price() -> uint256: view

interface CurveToken:
  def balanceOf(account: address) -> uint256: view

# StableSwap3Pool
SWAP: constant(address) = 0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7
LP: constant(address) = 0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490

DAI: constant(address) = 0x6B175474E89094C44Da98b954EedeAC495271d0F
USDC: constant(address) = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48
USDT: constant(address) = 0xdAC17F958D2ee523a2206206994597C13D831ec7

TOKENS: constant(address[3]) = [
  DAI,
  USDC,
  USDT
]


@external
def addLiquidity():
  tokens: address[3] = TOKENS
  balances: uint256[3] = [0, 0, 0]
  for i in range(3):
    balances[i] = ERC20(tokens[i]).balanceOf(self)
    ERC20(tokens[i]).approve(SWAP, balances[i])
  StableSwap(SWAP).add_liquidity(balances, 1)


@external
@view
def getShares() -> uint256:
  return CurveToken(LP).balanceOf(self)


@external
def removeLiquidity():
  shares: uint256 = CurveToken(LP).balanceOf(self)
  minAmounts: uint256[3] = [0, 0, 0]
  StableSwap(SWAP).remove_liquidity(shares, minAmounts)


@external
@view
def calcWithdrawOneCoin(i: int128) -> (uint256, uint256):
  shares: uint256 = CurveToken(LP).balanceOf(self)
  w: uint256 = StableSwap(SWAP).calc_withdraw_one_coin(shares, i)
  vp: uint256 = StableSwap(SWAP).get_virtual_price()
  return (w, vp * shares / 10 ** 18)


@external
def removeLiquidityOneCoin(i: int128):
  shares: uint256 = CurveToken(LP).balanceOf(self)
  minAmount: uint256 = 1
  StableSwap(SWAP).remove_liquidity_one_coin(shares, i, 1)


@external
@view
def getBalances() -> uint256[3]:
  tokens: address[3] = TOKENS
  balances: uint256[3] = [0, 0, 0]
  for i in range(3):
    balances[i] = ERC20(tokens[i]).balanceOf(self)
  return balances