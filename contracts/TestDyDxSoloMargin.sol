// SPDX-License-Identifier: MIT
pragma solidity ^0.8;
pragma experimental ABIEncoderV2;

import "./interfaces/dydx/DydxFlashloanBase.sol";
import "./interfaces/dydx/ICallee.sol";

contract TestDyDxSoloMargin is ICallee, DydxFlashloanBase {
  address private constant SOLO = 0x1E0447b19BB6EcFdAe1e4AE1694b0C3659614e4e;

  // JUST FOR TESTING - ITS OKAY TO REMOVE ALL OF THESE VARS
  address public flashUser;
  address public tokenBorrow;
  uint public repayAmount;

  struct MyCustomData {
    address token;
    uint repayAmount;
  }

  function initiateFlashLoan(address _token, uint _amount) external {
    ISoloMargin solo = ISoloMargin(SOLO);

    // Get marketId from token address
    /*
    0	WETH
    1	SAI
    2	USDC
    3	DAI
    */
    uint marketId = _getMarketIdFromTokenAddress(SOLO, _token);

    // Calculate repay amount (_amount + (2 wei))
    uint _repayAmount = _getRepaymentAmountInternal(_amount);
    IERC20(_token).approve(SOLO, _repayAmount);

    /*
    1. Withdraw
    2. Call callFunction()
    3. Deposit back
    */

    Actions.ActionArgs[] memory operations = new Actions.ActionArgs[](3);

    operations[0] = _getWithdrawAction(marketId, _amount);
    operations[1] = _getCallAction(
      abi.encode(MyCustomData({token: _token, repayAmount: _repayAmount}))
    );
    operations[2] = _getDepositAction(marketId, repayAmount);

    Account.Info[] memory accountInfos = new Account.Info[](1);
    accountInfos[0] = _getAccountInfo();

    solo.operate(accountInfos, operations);
  }

  function callFunction(
    address sender,
    Account.Info memory account,
    bytes memory data
  ) public override {
    require(msg.sender == SOLO, "!solo");
    require(sender == address(this), "!this contract");

    MyCustomData memory mcd = abi.decode(data, (MyCustomData));

    uint bal = IERC20(mcd.token).balanceOf(address(this));
    require(bal >= mcd.repayAmount, "bal < repay");

    // More code here...

    flashUser = sender;
    tokenBorrow = mcd.token;
    repayAmount = mcd.repayAmount;
  }
}
// Solo margin contract mainnet - 0x1e0447b19bb6ecfdae1e4ae1694b0c3659614e4e
// payable proxy - 0xa8b39829cE2246f89B31C013b8Cde15506Fb9A76

// https://etherscan.io/tx/0xda79adea5cdd8cb069feb43952ea0fc510e4b6df4a270edc8130d8118d19e3f4
