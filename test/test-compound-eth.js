const { time } = require("@openzeppelin/test-helpers")
const assert = require("assert")
const BN = require("bn.js")
const { sendEther, pow } = require("./util")
const { CETH } = require("./config")
const { web3 } = require("@openzeppelin/test-helpers/src/setup")

const IERC20 = artifacts.require("IERC20")
const CErc20 = artifacts.require("CErc20")
const TestCompoundEth = artifacts.require("TestCompoundEth")

const DEPOSIT_AMOUNT = pow(10, 18).mul(new BN(1))

contract("TestCompoundEth", (accounts) => {
  const WHALE = accounts[0]
  const C_TOKEN = CETH

  let testCompound
  let cToken
  beforeEach(async () => {
    testCompound = await TestCompoundEth.new(C_TOKEN)
    cToken = await CErc20.at(C_TOKEN)
  })

  const snapshot = async (testCompound, web3, cToken) => {
    const { exchangeRate, supplyRate } = await testCompound.getInfo.call()

    return {
      exchangeRate,
      supplyRate,
      estimateBalance: await testCompound.estimateBalanceOfUnderlying.call(),
      balanceOfUnderlying: await testCompound.balanceOfUnderlying.call(),
      eth: await web3.eth.getBalance(testCompound.address),
      cToken: await cToken.balanceOf(testCompound.address),
    }
  }

  it("should supply and redeem", async () => {
    let tx = await testCompound.supply({
      from: WHALE,
      value: DEPOSIT_AMOUNT,
    })

    let after = await snapshot(testCompound, web3, cToken)

    // for (const log of tx.logs) {
    //   console.log(log.event, log.args.message, log.args.val.toString())
    // }

    console.log("--- supply ---")
    console.log(`exchange rate ${after.exchangeRate}`)
    console.log(`supply rate ${after.supplyRate}`)
    console.log(`estimate balance ${after.estimateBalance}`)
    console.log(`balance of undelrying ${after.balanceOfUnderlying}`)
    console.log(`eth balance ${after.eth}`)
    console.log(`c token balance ${after.cToken}`)

    // accrue interest on supply
    const block = await web3.eth.getBlockNumber()
    await time.advanceBlockTo(block + 100)

    after = await snapshot(testCompound, web3, cToken)

    console.log(`--- after some blocks... ---`)
    console.log(`balance of undelrying ${after.balanceOfUnderlying}`)

    // test redeem
    const cTokenAmount = await cToken.balanceOf(testCompound.address)
    tx = await testCompound.redeem(cTokenAmount, {
      from: WHALE,
    })

    after = await snapshot(testCompound, web3, cToken)

    console.log(`--- redeem ---`)
    console.log(`balance of undelrying ${after.balanceOfUnderlying}`)
    console.log(`eth balance ${after.eth}`)
    console.log(`c token balance ${after.cToken}`)
  })
})
