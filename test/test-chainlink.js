const TestChainlink = artifacts.require("TestChainlink")

contract("TestChainlink", () => {
  let testChainlink
  beforeEach(async () => {
    testChainlink = await TestChainlink.new()
  })

  it("getLatestPrice", async () => {
    const price = await testChainlink.getLatestPrice()
    console.log(`price: ${price}`)
  })
})
