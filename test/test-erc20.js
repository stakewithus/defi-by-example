const BN = require("bn.js");
const { DAI, DAI_WHALE } = require("./config");

const IERC20 = artifacts.require("IERC20");

contract("IERC20", (accounts) => {
  const TOKEN = DAI;
  const WHALE = DAI_WHALE;

  let token;
  beforeEach(async () => {
    token = await IERC20.at(TOKEN);
  });

  it("should pass", async () => {
    const bal = await token.balanceOf(WHALE);
    console.log(`bal: ${bal}`);
  });

  it("should transfer", async () => {
    const bal = await token.balanceOf(WHALE);
    await token.transfer(accounts[0], bal, { from: WHALE });
  });
});
