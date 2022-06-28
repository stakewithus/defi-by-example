const { expect } = require("chai")
const { ethers, network } = require("hardhat")

const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F"
// DAI_WHALE must be an account, not contract
const DAI_WHALE = "0x2FAF487A4414Fe77e2327F0bf4AE2a264a776AD2"

describe("Test unlock accounts", () => {
  let accounts
  let dai
  let whale

  before(async () => {
    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [DAI_WHALE],
    })

    whale = await ethers.getSigner(DAI_WHALE)
    dai = await ethers.getContractAt("IERC20", DAI)

    accounts = await ethers.getSigners()
  })

  it("unlock account", async () => {
    const amount = 100n * 10n ** 18n

    console.log("DAI balance of whale", await dai.balanceOf(DAI_WHALE))
    expect(await dai.balanceOf(DAI_WHALE)).to.gte(amount)

    await dai.connect(whale).transfer(accounts[0].address, amount)

    console.log(
      "DAI balance of account",
      await dai.balanceOf(accounts[0].address)
    )
  })
})
