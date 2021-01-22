// SPDX-License-Identifier: MIT
pragma solidity ^0.7.1;
pragma experimental ABIEncoderV2;

import "./interfaces/dydx/DydxFlashloanBase.sol";
import "./interfaces/dydx/ICallee.sol";
contract TestDydxSoloMargin is ICallee, DydxFlashloanBase {
    address internal _solo = 0x1E0447b19BB6EcFdAe1e4AE1694b0C3659614e4e;

    // JUST FOR TESTING - ITS OKAY TO REMOVE ALL OF THESE VARS
    address public lastTokenBorrow;
    uint public lastAmount;
    address public lastTokenPay;
    uint public lastamountToRepay;
    bytes public lastUserData;
    address public flashUser;


    constructor() public payable {
    }

    struct MyCustomData {
        address token;
        uint256 repayAmount;
    }

    // This is the function that will be called postLoan
    // i.e. Encode the logic to handle your flashloaned funds here
    function callFunction(
        address sender,
        Account.Info memory account,
        bytes memory data
    ) public override {
        MyCustomData memory mcd = abi.decode(data, (MyCustomData));
        uint256 balOfLoanedToken = IERC20(mcd.token).balanceOf(address(this));

        // Note that you can ignore the line below
        // if your dydx account (this contract in this case)
        // has deposited at least ~2 Wei of assets into the account
        // to balance out the collaterization ratio
        require(
            balOfLoanedToken >= mcd.repayAmount,
            "Not enough funds to repay dydx loan!"
        );

        // TODO: Encode your logic here
        // E.g. arbitrage, liquidate accounts, etc
        //revert("Hello, you haven't encoded your logic");

        /*
        
        ACTION HERE

        */ 

        flashUser = sender; // just for testing
        lastTokenBorrow = mcd.token; // just for testing
        lastAmount = mcd.repayAmount-2; // just for testing
        lastTokenPay = mcd.token; // just for testing
        lastamountToRepay = mcd.repayAmount; // just for testing
    }

    function initiateFlashLoan(address _token, uint256 _amount) external {
        ISoloMargin solo = ISoloMargin(_solo);

        // Get marketId from token address
        uint256 marketId = _getMarketIdFromTokenAddress(_solo, _token);

        // Calculate repay amount (_amount + (2 wei))
        uint256 repayAmount = _getRepaymentAmountInternal(_amount);
        // Approve transfer from
        IERC20(_token).approve(_solo, repayAmount);

        // Create operations
        Actions.ActionArgs[] memory operations = new Actions.ActionArgs[](3);
        //Borrow x amount of tokens. (Withdraw)
        operations[0] = _getWithdrawAction(marketId, _amount);
        //Call a function (i.e. Logic to handle flashloaned funds). (Call)
        operations[1] = _getCallAction(
            // Encode MyCustomData for callFunction
            abi.encode(MyCustomData({token: _token, repayAmount: repayAmount}))
        );
        //Deposit back x (+2 wei) amount of tokens. (Deposit)
        operations[2] = _getDepositAction(marketId, repayAmount);

        Account.Info[] memory accountInfos = new Account.Info[](1);
        accountInfos[0] = _getAccountInfo();
        // Call this to start flashloan.
        solo.operate(accountInfos, operations);
    }
}
// Solo margin contract mainnet - 0x1e0447b19bb6ecfdae1e4ae1694b0c3659614e4e
// payable proxy - 0xa8b39829cE2246f89B31C013b8Cde15506Fb9A76

// https://etherscan.io/tx/0xda79adea5cdd8cb069feb43952ea0fc510e4b6df4a270edc8130d8118d19e3f4
