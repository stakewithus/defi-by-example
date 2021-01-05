const BN = require("bn.js");
const TestVyper = artifacts.require("TestVyper");

contract("TestVyper", () => {
  it("...should store the value 89.", async () => {
    const storage = await TestVyper.new();

    // Set value of 89
    await storage.setData(new BN(89));

    // Get stored value
    const storedData = await storage.get();

    assert.equal(storedData, 89, "The value 89 was not stored.");
  });
});
