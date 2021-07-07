const { time } = require("@openzeppelin/test-helpers")
const assert = require("assert")
const BN = require("bn.js")
const { sendEther, pow } = require("./util")
const { DAI, DAI_WHALE, CDAI, WBTC, WBTC_WHALE, CWBTC } = require("./config")
const { web3 } = require("@openzeppelin/test-helpers/src/setup")

const IERC20 = artifacts.require("IERC20")
const CErc20 = artifacts.require("CErc20")
const TestCompoundErc20 = artifacts.require("TestCompoundErc20")

const DEPOSIT_AMOUNT = pow(10, 8).mul(new BN(1))

contract("TestCompoundErc20", (accounts) => {
  const WHALE = WBTC_WHALE
  const TOKEN = WBTC
  const C_TOKEN = CWBTC

  let testCompound
  let token
  let cToken
  beforeEach(async () => {
    await sendEther(web3, accounts[0], WHALE, 1)

    testCompound = await TestCompoundErc20.new(TOKEN, C_TOKEN)
    token = await IERC20.at(TOKEN)
    cToken = await CErc20.at(C_TOKEN)

    const bal = await token.balanceOf(WHALE)
    console.log(`whale balance: ${bal}`)
    assert(bal.gte(DEPOSIT_AMOUNT), "bal < deposit")
  })

  const snapshot = async (testCompound, token, cToken) => {
    const { exchangeRate, supplyRate } = await testCompound.getInfo.call()

    return {
      exchangeRate,
      supplyRate,
      estimateBalance: await testCompound.estimateBalanceOfUnderlying.call(),
      balanceOfUnderlying: await testCompound.balanceOfUnderlying.call(),
      token: await token.balanceOf(testCompound.address),
      cToken: await cToken.balanceOf(testCompound.address),
    }
  }

  it("should supply and redeem", async () => {
    await token.approve(testCompound.address, DEPOSIT_AMOUNT, { from: WHALE })

    let tx = await testCompound.supply(DEPOSIT_AMOUNT, {
      from: WHALE,
    })

    let after = await snapshot(testCompound, token, cToken)

    // for (const log of tx.logs) {
    //   console.log(log.event, log.args.message, log.args.val.toString())
    // }

    console.log("--- supply ---")
    console.log(`exchange rate ${after.exchangeRate}`)
    console.log(`supply rate ${after.supplyRate}`)
    console.log(`estimate balance ${after.estimateBalance}`)
    console.log(`balance of undelrying ${after.balanceOfUnderlying}`)
    console.log(`token balance ${after.token}`)
    console.log(`c token balance ${after.cToken}`)

    // accrue interest on supply
    const block = await web3.eth.getBlockNumber()
    await time.advanceBlockTo(block + 100)

    after = await snapshot(testCompound, token, cToken)

    console.log(`--- after some blocks... ---`)
    console.log(`balance of undelrying ${after.balanceOfUnderlying}`)

    // test redeem
    const cTokenAmount = await cToken.balanceOf(testCompound.address)
    tx = await testCompound.redeem(cTokenAmount, {
      from: WHALE,
    })

    after = await snapshot(testCompound, token, cToken)

    console.log(`--- redeem ---`)
    console.log(`balance of undelrying ${after.balanceOfUnderlying}`)
    console.log(`token balance ${after.token}`)
    console.log(`c token balance ${after.cToken}`)
  })
})
