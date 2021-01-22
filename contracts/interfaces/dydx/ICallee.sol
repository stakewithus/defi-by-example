// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.7.1;
pragma experimental ABIEncoderV2;

import {Account} from "./ISoloMargin.sol";

/**
 * @title ICallee
 * @author dYdX
 *
 * Interface that Callees for Solo must implement in order to ingest data.
 */
interface ICallee {
    // ============ Public Functions ============

    /**
     * Allows users to send this contract arbitrary data.
     *
     * @param  sender       The msg.sender to Solo
     * @param  accountInfo  The account from which the data is being sent
     * @param  data         Arbitrary data given by the sender
     */
    function callFunction (
        address sender,
        Account.Info calldata accountInfo,
        bytes calldata data
    ) external;
}
