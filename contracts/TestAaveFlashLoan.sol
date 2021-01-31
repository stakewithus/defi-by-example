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

  address public ADDRESSES_PROVIDER;
  address public LENDING_POOL;
  address public CORE = 0x3dfd23A6c5E8BbcFc9581d2E864a68feb6a076d3;

  ILendingPoolAddressesProvider private provider;
  ILendingPool private pool;

  event Log(string message, uint256 val);

  constructor() {
    ADDRESSES_PROVIDER = 0x24a42fD28C976A61Df5D00D0599C34c4f90748c8;
    provider = ILendingPoolAddressesProvider(ADDRESSES_PROVIDER);

    // LENDING_POOL = provider.getLendingPool();
    LENDING_POOL = 0x398eC7346DcD622eDc5ae82352F02bE94C62d119;
    pool = ILendingPool(LENDING_POOL);
  }

  /**
  This function is called after your contract has received the flash loaned amount
  */
  function executeOperation(
    address reserve,
    uint256 amount,
    uint256 fee,
    bytes calldata params
  ) external override {
    // This contract now has the funds requested.

    // Your logic goes here.
    emit Log("fee", fee);

    uint256 amountToRepay = amount.add(fee);
    IERC20(reserve).transfer(CORE, amountToRepay);
  }

  function loan(address reserve, uint256 amount) external {
    // check balance
    uint256 bal = IERC20(reserve).balanceOf(address(this));
    require(bal > amount, "bal <= amount");

    bytes memory params = "";

    pool.flashLoan(address(this), reserve, amount, params);
  }
}
