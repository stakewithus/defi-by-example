const BN = require("bn.js");
const { sendEther, pow } = require("./util");
const { WETH, DAI, WETH_WHALE, DAI_WHALE } = require("./config");

const IERC20 = artifacts.require("IERC20");
const TestUniswapLiquidity = artifacts.require("TestUniswapLiquidity");

contract("TestUniswapLiquidity", (accounts) => {
  const CALLER = accounts[0];
  const TOKEN_A = WETH;
  const TOKEN_A_WHALE = WETH_WHALE;
  const TOKEN_B = DAI;
  const TOKEN_B_WHALE = DAI_WHALE;
  const TOKEN_A_AMOUNT = pow(10, 18);
  const TOKEN_B_AMOUNT = pow(10, 18);

  let contract;
  let tokenA;
  let tokenB;
  beforeEach(async () => {
    tokenA = await IERC20.at(TOKEN_A);
    tokenB = await IERC20.at(TOKEN_B);
    contract = await TestUniswapLiquidity.new();

    // send ETH to cover tx fee
    await sendEther(web3, accounts[0], TOKEN_A_WHALE, 1);
    await sendEther(web3, accounts[0], TOKEN_B_WHALE, 1);

    await tokenA.transfer(CALLER, TOKEN_A_AMOUNT, { from: TOKEN_A_WHALE });
    await tokenB.transfer(CALLER, TOKEN_B_AMOUNT, { from: TOKEN_B_WHALE });

    await tokenA.approve(contract.address, TOKEN_A_AMOUNT, { from: CALLER });
    await tokenB.approve(contract.address, TOKEN_B_AMOUNT, { from: CALLER });
  });

  it("add liquidity and remove liquidity", async () => {
    let tx = await contract.addLiquidity(
      tokenA.address,
      tokenB.address,
      TOKEN_A_AMOUNT,
      TOKEN_B_AMOUNT,
      {
        from: CALLER,
      }
    );
    console.log("=== add liquidity ===");
    for (const log of tx.logs) {
      console.log(`${log.args.message} ${log.args.val}`);
    }

    tx = await contract.removeLiquidity(tokenA.address, tokenB.address, {
      from: CALLER,
    });
    console.log("=== remove liquidity ===");
    for (const log of tx.logs) {
      console.log(`${log.args.message} ${log.args.val}`);
    }
  });
});
