// SPDX-License-Identifier: MIT
pragma solidity ^0.7;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "./interfaces/IERC20.sol";
import "./interfaces/aave/IFlashLoanReceiver.sol";
import "./interfaces/aave/ILendingPoolAddressProvider.sol";
import "./interfaces/aave/ILendingPool.sol";

/** 
    !!!
    Never keep funds permanently on your flash loan receiver contract as they could be 
    exposed to a 'griefing' attack, where the stored funds are used by an attacker.
    !!!
 */
contract TestAaveFlashLoan is IFlashLoanReceiver {
  using SafeMath for uint256;

  address public override ADDRESSES_PROVIDER;
  address public override LENDING_POOL;

  ILendingPoolAddressesProvider private provider;
  ILendingPool private pool;

  event Log(string message, uint256 val);

  constructor() {
    ADDRESSES_PROVIDER = 0x24a42fD28C976A61Df5D00D0599C34c4f90748c8;
    provider = ILendingPoolAddressesProvider(ADDRESSES_PROVIDER);

    LENDING_POOL = provider.getLendingPool();
    pool = ILendingPool(LENDING_POOL);
  }

  /**
  This function is called after your contract has received the flash loaned amount
  */
  function executeOperation(
    address[] calldata assets,
    uint256[] calldata amounts,
    uint256[] calldata premiums,
    address initiator,
    bytes calldata params
  ) external override returns (bool) {
    // This contract now has the funds requested.

    // Your logic goes here.
    for (uint256 i = 0; i < assets.length; i++) {
      emit Log("fee", premiums[i]);
    }

    // At the end of your logic above, this contract owes
    // the flashloaned amounts + premiums.
    // Therefore ensure your contract has enough to repay
    // these amounts.
    // Approve the LendingPool contract allowance to *pull* the owed amount
    for (uint256 i = 0; i < assets.length; i++) {
      uint256 amountToRepay = amounts[i].add(premiums[i]);
      IERC20(assets[i]).approve(LENDING_POOL, amountToRepay);
    }

    return true;
  }

  function loan(address[] calldata assets, uint256[] calldata amounts)
    external
  {
    address receiverAddress = address(this);

    // check balance
    for (uint256 i = 0; i < assets.length; i++) {
      uint256 bal = IERC20(assets[i]).balanceOf(address(this));
      require(bal > amounts[i], "bal <= amount");
    }

    // 0 = no debt, 1 = stable, 2 = variable
    uint256[] memory modes;
    // modes[0] = 0;
    // modes[1] = 0;

    address onBehalfOf = address(this);
    bytes memory params = "";
    uint16 referralCode = 0;

    pool.flashLoan(
      receiverAddress,
      assets,
      amounts,
      modes,
      onBehalfOf,
      params,
      referralCode
    );
  }
}
