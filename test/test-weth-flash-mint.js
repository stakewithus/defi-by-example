const BN = require("bn.js");
const { WETH_10 } = require("./config");

const IERC20 = artifacts.require("IERC20");
const TestWethFlashMint = artifacts.require("TestWethFlashMint");

contract("TestWethFlashMint", (accounts) => {
  let testWethFlashMint;
  let weth;
  beforeEach(async () => {
    weth = await IERC20.at(WETH_10);
    testWethFlashMint = await TestWethFlashMint.new();
  });

  it("flash", async () => {
    const tx = await testWethFlashMint.flash();

    for (const log of tx.logs) {
      console.log(`${log.args.name} ${log.args.val}`);
    }
  });
});
