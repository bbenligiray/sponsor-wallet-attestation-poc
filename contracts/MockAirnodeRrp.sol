//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract MockAirnodeRrp {
    using ECDSA for bytes32;

    function fulfill(
        bytes32 requestId,
        address airnode,
        // bytes calldata data,
        // address fulfillAddress,
        // bytes4 fulfillFunctionId,
        bytes calldata signature
    ) external {
        require(
            (requestId.toEthSignedMessageHash()).recover(signature) == airnode,
            "Invalid signature"
        );
        // Continue as usual...
    }

    function fulfillBare(
        bytes32 requestId,
        address airnode
        // bytes calldata data,
        // address fulfillAddress,
        // bytes4 fulfillFunctionId
    ) external {
        // Continue as usual...
    }
}
