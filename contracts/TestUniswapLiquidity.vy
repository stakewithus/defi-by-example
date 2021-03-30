# @version ^0.2

from vyper.interfaces import ERC20

interface UniswapV2Router:
    def addLiquidity(
        tokenA: address,
        tokenB: address,
        amountA: uint256,
        amountB: uint256,
        amountAMin: uint256,
        amountBMin: uint256,
        to: address,
        deadline: uint256
    ) -> (uint256, uint256, uint256): nonpayable

    def removeLiquidity(
        tokenA: address,
        tokenB: address,
        liquidity: uint256,
        amountAMin: uint256,
        amountBMin: uint256,
        to: address,
        deadline: uint256
    ) -> (uint256, uint256): nonpayable

interface UniswapV2Factory:
    def getPair(tokenA: address, tokenB: address) -> address: view

FACTORY: constant(address) = 0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f
ROUTER: constant(address) = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D
WETH: constant(address) = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2

event Log:
    message: String[100]
    val: uint256

@external
def addLiquidity(_tokenA: address, _tokenB: address, _amountA: uint256, _amountB: uint256):
    ERC20(_tokenA).transferFrom(msg.sender, self, _amountA)
    ERC20(_tokenB).transferFrom(msg.sender, self, _amountB)

    ERC20(_tokenA).approve(ROUTER, _amountA)
    ERC20(_tokenB).approve(ROUTER, _amountB)

    amountA: uint256 = 0
    amountB: uint256 = 0
    liquidity: uint256 = 0
    (amountA, amountB, liquidity) = UniswapV2Router(ROUTER).addLiquidity(
        _tokenA,
        _tokenB,
        _amountA,
        _amountB,
        1,
        1,
        self,
        block.timestamp
    )

    log Log("amountA", amountA)
    log Log("amountB", amountB)
    log Log("liquidity", liquidity)

@external
def removeLiquidity(_tokenA: address, _tokenB: address):
    pair: address = UniswapV2Factory(FACTORY).getPair(_tokenA, _tokenB)

    liquidity: uint256 = ERC20(pair).balanceOf(self)
    ERC20(pair).approve(ROUTER, liquidity)

    amountA: uint256 = 0
    amountB: uint256 = 0
    (amountA, amountB) = UniswapV2Router(ROUTER).removeLiquidity(
        _tokenA,
        _tokenB,
        liquidity,
        1,
        1,
        self,
        block.timestamp
    )

    log Log("amountA", amountA)
    log Log("amountB", amountB)
