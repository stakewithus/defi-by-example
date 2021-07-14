const { time } = require("@openzeppelin/test-helpers")
const assert = require("assert")
const BN = require("bn.js")
const { sendEther, pow } = require("./util")
const { DAI, DAI_WHALE, CDAI, WBTC, WBTC_WHALE, CWBTC } = require("./config")
const { web3 } = require("@openzeppelin/test-helpers/src/setup")

const IERC20 = artifacts.require("IERC20")
const CErc20 = artifacts.require("CErc20")
const TestCompoundErc20 = artifacts.require("TestCompoundErc20")

const SUPPLY_DECIMALS = 8
const SUPPLY_AMOUNT = pow(10, SUPPLY_DECIMALS).mul(new BN(1))
const BORROW_DECIMALS = 18
const BORROW_INTEREST = pow(10, BORROW_DECIMALS).mul(new BN(1000))

contract("TestCompoundErc20", (accounts) => {
  const WHALE = WBTC_WHALE
  const TOKEN = WBTC
  const C_TOKEN = CWBTC
  const TOKEN_TO_BORROW = DAI
  const C_TOKEN_TO_BORROW = CDAI
  const REPAY_WHALE = DAI_WHALE // used to repay interest on borrow

  let testCompound
  let token
  let cToken
  let tokenToBorrow
  let cTokenToBorrow
  beforeEach(async () => {
    await sendEther(web3, accounts[0], WHALE, 1)

    testCompound = await TestCompoundErc20.new(TOKEN, C_TOKEN)
    token = await IERC20.at(TOKEN)
    cToken = await CErc20.at(C_TOKEN)
    tokenToBorrow = await IERC20.at(TOKEN_TO_BORROW)
    cTokenToBorrow = await CErc20.at(C_TOKEN_TO_BORROW)

    const supplyBal = await token.balanceOf(WHALE)
    console.log(`suuply whale balance: ${supplyBal.div(pow(10, SUPPLY_DECIMALS))}`)
    assert(supplyBal.gte(SUPPLY_AMOUNT), "bal < supply")

    const borrowBal = await tokenToBorrow.balanceOf(REPAY_WHALE)
    console.log(`repay whale balance: ${borrowBal.div(pow(10, BORROW_DECIMALS))}`)
    assert(borrowBal.gte(BORROW_INTEREST), "bal < borrow interest")
  })

  const snapshot = async (testCompound, tokenToBorrow) => {
    const { liquidity } = await testCompound.getAccountLiquidity()
    const colFactor = await testCompound.getCollateralFactor()
    const supplied = await testCompound.balanceOfUnderlying.call()
    const price = await testCompound.getPriceFeed(C_TOKEN_TO_BORROW)
    const maxBorrow = liquidity.div(price)
    const borrowedBalance = await testCompound.getBorrowedBalance.call(C_TOKEN_TO_BORROW)
    const tokenToBorrowBal = await tokenToBorrow.balanceOf(testCompound.address)
    const borrowRate = await testCompound.getBorrowRatePerBlock.call(C_TOKEN_TO_BORROW)

    return {
      colFactor: colFactor.div(pow(10, 18 - 2)) / 100,
      supplied: supplied.div(pow(10, SUPPLY_DECIMALS - 2)) / 100,
      price: price.div(pow(10, 18 - 2)) / 100,
      liquidity: liquidity.div(pow(10, 18)),
      maxBorrow,
      borrowedBalance: borrowedBalance.div(pow(10, BORROW_DECIMALS - 2)) / 100,
      tokenToBorrowBal: tokenToBorrowBal.div(pow(10, BORROW_DECIMALS - 2)) / 100,
      borrowRate,
    }
  }

  it("should supply, borrow and repay", async () => {
    // used for debugging
    let tx
    let snap

    // supply
    await token.approve(testCompound.address, SUPPLY_AMOUNT, { from: WHALE })
    tx = await testCompound.supply(SUPPLY_AMOUNT, {
      from: WHALE,
    })

    // borrow
    snap = await snapshot(testCompound, tokenToBorrow)
    console.log(`--- borrow (before) ---`)
    console.log(`col factor: ${snap.colFactor} %`)
    console.log(`supplied: ${snap.supplied}`)
    console.log(`liquidity: $ ${snap.liquidity}`)
    console.log(`price: $ ${snap.price}`)
    console.log(`max borrow: ${snap.maxBorrow}`)
    console.log(`borrowed balance (compound): ${snap.borrowedBalance}`)
    console.log(`borrowed balance (erc20): ${snap.tokenToBorrowBal}`)
    console.log(`borrow rate: ${snap.borrowRate}`)

    tx = await testCompound.borrow(C_TOKEN_TO_BORROW, BORROW_DECIMALS, { from: WHALE })
    // for (const log of tx.logs) {
    //   console.log(log.event, log.args.message, log.args.val.toString())
    // }

    snap = await snapshot(testCompound, tokenToBorrow)
    console.log(`--- borrow (after) ---`)
    console.log(`liquidity: $ ${snap.liquidity}`)
    console.log(`max borrow: ${snap.maxBorrow}`)
    console.log(`borrowed balance (compound): ${snap.borrowedBalance}`)
    console.log(`borrowed balance (erc20): ${snap.tokenToBorrowBal}`)

    // accrue interest on borrow
    const block = await web3.eth.getBlockNumber()
    await time.advanceBlockTo(block + 100)

    snap = await snapshot(testCompound, tokenToBorrow)
    console.log(`--- after some blocks... ---`)
    console.log(`liquidity: $ ${snap.liquidity}`)
    console.log(`max borrow: ${snap.maxBorrow}`)
    console.log(`borrowed balance (compound): ${snap.borrowedBalance}`)
    console.log(`borrowed balance (erc20): ${snap.tokenToBorrowBal}`)

    // repay
    await tokenToBorrow.transfer(testCompound.address, BORROW_INTEREST, { from: REPAY_WHALE })
    const MAX_UINT = pow(2, 256).sub(new BN(1))
    tx = await testCompound.repay(TOKEN_TO_BORROW, C_TOKEN_TO_BORROW, MAX_UINT, {
      from: REPAY_WHALE,
    })

    snap = await snapshot(testCompound, tokenToBorrow)
    console.log(`--- repay ---`)
    console.log(`liquidity: $ ${snap.liquidity}`)
    console.log(`max borrow: ${snap.maxBorrow}`)
    console.log(`borrowed balance (compound): ${snap.borrowedBalance}`)
    console.log(`borrowed balance (erc20): ${snap.tokenToBorrowBal}`)
  })
})
