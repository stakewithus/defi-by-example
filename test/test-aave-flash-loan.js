const BN = require("bn.js")
const { sendEther, pow } = require("./util")
const { DAI, DAI_WHALE, USDC, USDC_WHALE, USDT, USDT_WHALE } = require("./config")

const IERC20 = artifacts.require("IERC20")
const TestAaveFlashLoan = artifacts.require("TestAaveFlashLoan")

contract("TestAaveFlashLoan", (accounts) => {
  const WHALE = USDC_WHALE
  const TOKEN_BORROW = USDC
  const DECIMALS = 6
  const FUND_AMOUNT = pow(10, DECIMALS).mul(new BN(2000))
  const BORROW_AMOUNT = pow(10, DECIMALS).mul(new BN(1000))

  const ADDRESS_PROVIDER = "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5"

  let testAaveFlashLoan
  let token
  beforeEach(async () => {
    token = await IERC20.at(TOKEN_BORROW)
    testAaveFlashLoan = await TestAaveFlashLoan.new(ADDRESS_PROVIDER)

    await sendEther(web3, accounts[0], WHALE, 1)

    // send enough token to cover fee
    const bal = await token.balanceOf(WHALE)
    assert(bal.gte(FUND_AMOUNT), "balance < FUND")
    await token.transfer(testAaveFlashLoan.address, FUND_AMOUNT, {
      from: WHALE,
    })
  })

  it("flash loan", async () => {
    const tx = await testAaveFlashLoan.testFlashLoan(token.address, BORROW_AMOUNT, {
      from: WHALE,
    })
    for (const log of tx.logs) {
      console.log(log.args.message, log.args.val.toString())
    }
  })
})
