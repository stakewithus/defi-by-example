const BN = require("bn.js");
const { sendEther, pow } = require("./util");
const {
  DAI,
  DAI_WHALE,
  USDC,
  USDC_WHALE,
  USDT,
  USDT_WHALE,
} = require("./config");

const IERC20 = artifacts.require("IERC20");
const TestDydxSoloMargin = artifacts.require("TestDydxSoloMargin");

contract("TestDydxSoloMargin", (accounts) => {
  const WHALE = USDC_WHALE;
  const TOKEN_BORROW = USDC;
  const DECIMALS = 6;
  const FUND_AMOUNT = pow(10, DECIMALS).mul(new BN(2000000));
  const BORROW_AMOUNT = pow(10, DECIMALS).mul(new BN(1000000));

  let testDydxSoloMargin;
  let token;
  beforeEach(async () => {
    token = await IERC20.at(TOKEN_BORROW);
    testDydxSoloMargin = await TestDydxSoloMargin.new();

    await sendEther(web3, accounts[0], WHALE, 1);

    // send enough token to cover fee
    const bal = await token.balanceOf(WHALE);
    assert(bal.gte(FUND_AMOUNT), "balance < FUND");
    await token.transfer(testDydxSoloMargin.address, FUND_AMOUNT, {
      from: WHALE,
    });
  });

  it("dydx SoloMargin Flash loan", async () => {
    const tx = await testDydxSoloMargin.initiateFlashLoan(token.address, BORROW_AMOUNT, {
      from: WHALE,
    });

    for (const log of tx.logs) {
      console.log(log.args.message, log.args.val.toString());
    }
  });
});
