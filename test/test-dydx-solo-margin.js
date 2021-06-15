const BN = require("bn.js")
const { sendEther, pow } = require("./util")
const { DAI, DAI_WHALE, USDC, USDC_WHALE, USDT, USDT_WHALE } = require("./config")

const IERC20 = artifacts.require("IERC20")
const TestDyDxSoloMargin = artifacts.require("TestDyDxSoloMargin")

const SOLO = "0x1E0447b19BB6EcFdAe1e4AE1694b0C3659614e4e"

contract("TestDyDxSoloMargin", (accounts) => {
  const WHALE = USDC_WHALE
  const TOKEN = USDC
  const DECIMALS = 6
  const FUND_AMOUNT = pow(10, DECIMALS).mul(new BN(2000000))
  const BORROW_AMOUNT = pow(10, DECIMALS).mul(new BN(1000000))

  let testDyDxSoloMargin
  let token
  beforeEach(async () => {
    token = await IERC20.at(TOKEN)
    testDyDxSoloMargin = await TestDyDxSoloMargin.new()

    await sendEther(web3, accounts[0], WHALE, 1)

    // send enough token to cover fee
    const bal = await token.balanceOf(WHALE)
    assert(bal.gte(FUND_AMOUNT), "balance < fund")
    await token.transfer(testDyDxSoloMargin.address, FUND_AMOUNT, {
      from: WHALE,
    })

    const soloBal = await token.balanceOf(SOLO)
    console.log(`solo balance: ${soloBal}`)
    assert(soloBal.gte(BORROW_AMOUNT), "solo < borrow")
  })

  it("flash loan", async () => {
    const tx = await testDyDxSoloMargin.initiateFlashLoan(token.address, BORROW_AMOUNT, {
      from: WHALE,
    })

    console.log(`${await testDyDxSoloMargin.flashUser()}`)

    for (const log of tx.logs) {
      console.log(log.args.message, log.args.val.toString())
    }
  })
})
