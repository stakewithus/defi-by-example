const BN = require("bn.js")
const { sendEther, pow } = require("./util")
const { DAI, DAI_WHALE, USDC, USDC_WHALE, USDT, USDT_WHALE } = require("./config")

const IERC20 = artifacts.require("IERC20")
const TestCurveLiquidity = artifacts.require("TestCurveLiquidity")

contract("TestCurveLiquidity", (accounts) => {
  const WHALE = USDC_WHALE
  const TOKEN = USDC
  const TOKEN_INDEX = 1
  const DECIMALS = 6
  const TOKEN_AMOUNT = pow(10, DECIMALS).mul(new BN(1000))

  let testContract
  let token
  beforeEach(async () => {
    token = await IERC20.at(TOKEN)
    testContract = await TestCurveLiquidity.new()

    await sendEther(web3, accounts[0], WHALE, 1)

    const bal = await token.balanceOf(WHALE)
    assert(bal.gte(TOKEN_AMOUNT), "balance < TOKEN_AMOUNT")

    await token.transfer(testContract.address, TOKEN_AMOUNT, {
      from: WHALE,
    })
  })

  it("add / remove liquidity", async () => {
    // add liquidity
    await testContract.addLiquidity()
    let shares = await testContract.getShares()

    console.log(`--- add liquidity ---`)
    console.log(`shares: ${shares}`)

    // remove liquidity
    await testContract.removeLiquidity()
    let bals = await testContract.getBalances()

    console.log(`--- remove liquidity ---`)
    console.log(`DAI: ${bals[0]}`)
    console.log(`USDC: ${bals[1]}`)
    console.log(`USDT: ${bals[2]}`)

    // add liquidity
    await testContract.addLiquidity()
    shares = await testContract.getShares()

    console.log(`--- add liquidity ---`)
    console.log(`shares: ${shares}`)

    const calc = await testContract.calcWithdrawOneCoin(TOKEN_INDEX)

    console.log(`--- calc withdraw one coin ---`)
    console.log(`calc_withdraw_one_coin: ${calc[0]}`)
    console.log(`shares * virtual price: ${calc[1]}`)

    // remove liquidity one coin
    await testContract.removeLiquidityOneCoin(TOKEN_INDEX)
    bals = await testContract.getBalances()

    console.log(`--- remove liquidity one coin ---`)
    console.log(`DAI: ${bals[0]}`)
    console.log(`USDC: ${bals[1]}`)
    console.log(`USDT: ${bals[2]}`)
  })
})
