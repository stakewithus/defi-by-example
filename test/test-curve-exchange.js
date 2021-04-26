const BN = require("bn.js")
const { sendEther, pow } = require("./util")
const { DAI, DAI_WHALE, USDC, USDC_WHALE, USDT, USDT_WHALE } = require("./config")

const IERC20 = artifacts.require("IERC20")
const TestCurveExchange = artifacts.require("TestCurveExchange")

contract("TestCurveExchange", (accounts) => {
  const WHALE = USDC_WHALE
  const TOKEN_IN = USDC
  const TOKEN_IN_INDEX = 1
  const TOKEN_OUT = USDT
  const TOKEN_OUT_INDEX = 2
  const DECIMALS = 6
  const TOKEN_IN_AMOUNT = pow(10, DECIMALS).mul(new BN(1000000))

  let testContract
  let tokenIn
  let tokenOut
  beforeEach(async () => {
    tokenIn = await IERC20.at(TOKEN_IN)
    tokenOut = await IERC20.at(TOKEN_OUT)
    testContract = await TestCurveExchange.new()

    await sendEther(web3, accounts[0], WHALE, 1)

    const bal = await tokenIn.balanceOf(WHALE)
    assert(bal.gte(TOKEN_IN_AMOUNT), "balance < TOKEN_IN_AMOUNT")

    await tokenIn.transfer(testContract.address, TOKEN_IN_AMOUNT, {
      from: WHALE,
    })
  })

  it("exchange", async () => {
    const snapshot = async () => {
      return {
        tokenOut: await tokenOut.balanceOf(testContract.address),
      }
    }

    // const before = await snapshot()
    await testContract.swap(TOKEN_IN_INDEX, TOKEN_OUT_INDEX)
    const after = await snapshot()

    console.log(`Token out: ${after.tokenOut}`)
  })
})
