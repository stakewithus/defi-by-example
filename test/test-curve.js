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
const StableSwapY = artifacts.require("StableSwapY");
const DepositY = artifacts.require("DepositY");
const TestCurve = artifacts.require("TestCurve");

const DEPOSIT_Y = "0xbBC81d23Ea2c3ec7e56D39296F0cbB648873a5d3";
const STABLE_SWAP_Y = "0x45F783CCE6B7FF23B2ab2D70e416cdb7D6055f51";

contract("TestCurve", (accounts) => {
  const WHALE = USDC_WHALE;
  const TOKEN_IN = USDC;
  const TOKEN_IN_INDEX = 1;
  const TOKEN_OUT = USDT;
  const TOKEN_OUT_INDEX = 2;
  const DECIMALS = 6;
  const TOKEN_IN_AMOUNT = pow(10, DECIMALS).mul(new BN(1000000));

  let depositY;
  let stableSwapY;
  let testCurve;
  let tokenIn;
  let tokenOut;
  beforeEach(async () => {
    depositY = await DepositY.at(DEPOSIT_Y);
    stableSwapY = await StableSwapY.at(STABLE_SWAP_Y);
    tokenIn = await IERC20.at(TOKEN_IN);
    tokenOut = await IERC20.at(TOKEN_OUT);
    testCurve = await TestCurve.new();

    await sendEther(web3, accounts[0], WHALE, 1);

    const bal = await tokenIn.balanceOf(WHALE);
    assert(bal.gte(TOKEN_IN_AMOUNT), "balance < TOKEN_IN_AMOUNT");

    await tokenIn.transfer(testCurve.address, TOKEN_IN_AMOUNT, {
      from: WHALE,
    });
  });

  it("exchange underlying", async () => {
    // shares in Curve StableSwapY pool
    const LP_SHARES = pow(10, 18).mul(new BN(1000000));

    const snapshot = async () => {
      return {
        virtual_price: await stableSwapY.get_virtual_price(),
        calc_withdraw_token_in: await depositY.calc_withdraw_one_coin(
          LP_SHARES,
          TOKEN_IN_INDEX
        ),
        calc_withdraw_token_out: await depositY.calc_withdraw_one_coin(
          LP_SHARES,
          TOKEN_OUT_INDEX
        ),
      };
    };

    const debug = (snap) => {
      console.log(`virtual price ${snap.virtual_price}`);
      console.log(
        `virtual price x shares ${snap.virtual_price
          .mul(LP_SHARES)
          .div(pow(10, 18 - DECIMALS))
          .div(pow(10, 18))}`
      );
      console.log(`calc withdraw token in ${snap.calc_withdraw_token_in}`);
      console.log(`calc withdraw token out ${snap.calc_withdraw_token_out}`);
    };

    const before = await snapshot();
    await testCurve.swap(TOKEN_IN_INDEX, TOKEN_OUT_INDEX);
    const after = await snapshot();

    console.log("--- before ---");
    debug(before);
    console.log("--- after ---");
    debug(after);
    /*
    penalty for withdrawing coin with low balance (token out balance)

    --- before ---
    virtual price 1073786661936021155
    virtual price x shares 10737866619360
    calc withdraw token in 10732387653906
    calc withdraw token out 10742470759054
    --- after ---
    virtual price 1073802400302965496
    virtual price x shares 10738024003029
    calc withdraw token in 10737660606051
    calc withdraw token out 10739877158855
    */
  });
});
