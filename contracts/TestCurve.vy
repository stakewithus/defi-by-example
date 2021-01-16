# @version ^0.2
from vyper.interfaces import ERC20

# https://github.com/curvefi/curve-contract/tree/master/contracts/pools/y
interface StableSwap:
  def exchange_underlying(i: int128, j: int128, dx: uint256, min_dy: uint256): nonpayable

# StableSwapY
STABLE_SWAP: constant(address) = 0x45F783CCE6B7FF23B2ab2D70e416cdb7D6055f51

DAI: constant(address) = 0x6B175474E89094C44Da98b954EedeAC495271d0F
USDC: constant(address) = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48
USDT: constant(address) = 0xdAC17F958D2ee523a2206206994597C13D831ec7

TOKENS: constant(address[3]) = [
  DAI,
  USDC,
  USDT
] 

@external
def swap(i: uint256, j: uint256):
  tokens: address[3] = TOKENS
  bal: uint256 = ERC20(tokens[i]).balanceOf(self)

  ERC20(tokens[i]).approve(STABLE_SWAP, bal)

  StableSwap(STABLE_SWAP).exchange_underlying(
    convert(i, int128), convert(j, int128), bal, 0
  )