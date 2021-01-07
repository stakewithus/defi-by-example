const BN = require("bn.js");
const { sendEther, pow } = require("./util");
const { DAI, WBTC, WBTC_WHALE } = require("./config");

const IERC20 = artifacts.require("IERC20");
const TestUniswap = artifacts.require("TestUniswap");

contract("TestUniswap", (accounts) => {
  const WHALE = WBTC_WHALE;
  const AMOUNT = pow(10, 8).mul(new BN(1));
  const FROM = WBTC;
  const TO = DAI;

  let testUniswap;
  let fromToken;
  let toToken;
  beforeEach(async () => {
    fromToken = await IERC20.at(FROM);
    toToken = await IERC20.at(TO);
    testUniswap = await TestUniswap.new();

    await sendEther(web3, accounts[0], WHALE, 1);
    await fromToken.approve(testUniswap.address, AMOUNT, { from: WHALE });
  });

  const snapshot = async () => {
    return {
      fromToken: {
        testUniswap: await fromToken.balanceOf(testUniswap.address),
      },
      toToken: {
        testUniswap: await toToken.balanceOf(testUniswap.address),
      },
    };
  };

  it("should pass", async () => {
    await fromToken.approve(testUniswap.address, AMOUNT, { from: WHALE });

    const before = await snapshot();
    await testUniswap.swap(fromToken.address, toToken.address, AMOUNT, {
      from: WHALE,
    });
    const after = await snapshot();
    console.log("from", AMOUNT.toString());
    console.log("to", after.toToken.testUniswap.toString());
  });
});
