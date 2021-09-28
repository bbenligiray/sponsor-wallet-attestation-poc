//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract MockAirnodeRrp {
    using ECDSA for bytes32;

    mapping(address => address) private sponsorWalletToAirnode;

    function fulfill(
        //bytes32 requestId,
        address airnode,
        // bytes calldata data,
        // address fulfillAddress,
        // bytes4 fulfillFunctionId,
        bytes calldata signature
    ) external {
        if (sponsorWalletToAirnode[msg.sender] != airnode) {
          require(
            (bytes32(abi.encode(msg.sender)).toEthSignedMessageHash()).recover(signature) == airnode,
            "Invalid signature"
          );
          sponsorWalletToAirnode[msg.sender] = airnode;
        }
        // Continue as usual...
    }

    function fulfillBare(
        //bytes32 requestId,
        address airnode
        // bytes calldata data,
        // address fulfillAddress,
        // bytes4 fulfillFunctionId
    ) external {
        // Continue as usual...
    }
}
