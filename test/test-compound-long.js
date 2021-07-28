const { time } = require("@openzeppelin/test-helpers")
const assert = require("assert")
const BN = require("bn.js")
const { sendEther, pow, frac } = require("./util")
const { DAI, DAI_WHALE, CDAI, WBTC, WBTC_WHALE, CWBTC, CETH } = require("./config")
const { web3 } = require("@openzeppelin/test-helpers/src/setup")

const IERC20 = artifacts.require("IERC20")
const CErc20 = artifacts.require("CErc20")
const TestCompoundLong = artifacts.require("TestCompoundLong")

contract("TestCompoundLong", (accounts) => {
  const ETH_WHALE = accounts[0]
  const TOKEN_BORROW = DAI
  const C_TOKEN_BORROW = CDAI
  const REPAY_WHALE = DAI_WHALE // used to repay interest on borrow

  const ETH_AMOUNT = pow(10, 18).mul(new BN(10))
  const BORROW_DECIMALS = 18
  const BORROW_INTEREST = pow(10, BORROW_DECIMALS).mul(new BN(1000))

  let testCompound
  let tokenBorrow
  beforeEach(async () => {
    testCompound = await TestCompoundLong.new(CETH, C_TOKEN_BORROW, TOKEN_BORROW, 18)
    tokenBorrow = await IERC20.at(TOKEN_BORROW)

    const borrowBal = await tokenBorrow.balanceOf(REPAY_WHALE)
    console.log(`repay whale balance: ${borrowBal.div(pow(10, BORROW_DECIMALS))}`)
    assert(borrowBal.gte(BORROW_INTEREST), "bal < borrow interest")
  })

  const snapshot = async (testCompound, tokenBorrow) => {
    const maxBorrow = await testCompound.getMaxBorrow()
    const ethBal = await web3.eth.getBalance(testCompound.address)
    const tokenBorrowBal = await tokenBorrow.balanceOf(testCompound.address)
    const supplied = await testCompound.getSuppliedBalance.call()
    const borrowed = await testCompound.getBorrowBalance.call()
    const { liquidity } = await testCompound.getAccountLiquidity()

    return {
      maxBorrow,
      eth: new BN(ethBal),
      tokenBorrow: tokenBorrowBal,
      supplied,
      borrowed,
      liquidity,
    }
  }

  it("should long", async () => {
    // used for debugging
    let tx
    let snap
    // supply
    tx = await testCompound.supply({
      from: ETH_WHALE,
      value: ETH_AMOUNT,
    })

    // long
    snap = await snapshot(testCompound, tokenBorrow)
    console.log(`--- supplied ---`)
    console.log(`liquidity: ${snap.liquidity.div(pow(10, 18))}`)
    console.log(`max borrow: ${snap.maxBorrow.div(pow(10, BORROW_DECIMALS))}`)

    const maxBorrow = await testCompound.getMaxBorrow()
    const borrowAmount = frac(maxBorrow, 50, 100)
    console.log(`borrow amount: ${borrowAmount.div(pow(10, BORROW_DECIMALS))}`)
    tx = await testCompound.long(borrowAmount, { from: ETH_WHALE })

    // update borrowed balance
    // await testCompound.getBorrowBalance()

    snap = await snapshot(testCompound, tokenBorrow)
    console.log(`--- long ---`)
    console.log(`liquidity: ${snap.liquidity.div(pow(10, 18))}`)
    console.log(`borrowed: ${snap.borrowed.div(pow(10, BORROW_DECIMALS))}`)
    console.log(`eth: ${snap.eth.div(pow(10, 18))}`)

    // accrue interest on borrow
    const block = await web3.eth.getBlockNumber()
    await time.advanceBlockTo(block + 100)

    // repay
    await tokenBorrow.transfer(testCompound.address, BORROW_INTEREST, { from: REPAY_WHALE })
    const MAX_UINT = pow(2, 256).sub(new BN(1))
    tx = await testCompound.repay({
      from: ETH_WHALE,
    })

    snap = await snapshot(testCompound, tokenBorrow)
    console.log(`--- repay ---`)
    console.log(`liquidity: ${snap.liquidity.div(pow(10, 18))}`)
    console.log(`borrowed: ${snap.borrowed.div(pow(10, BORROW_DECIMALS))}`)
    console.log(`eth: ${snap.eth.div(pow(10, 18))}`)
    console.log(`token borrow: ${snap.tokenBorrow.div(pow(10, BORROW_DECIMALS))}`)
  })
})
