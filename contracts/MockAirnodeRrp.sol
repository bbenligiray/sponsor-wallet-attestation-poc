//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract MockAirnodeRrp {
  using ECDSA for bytes32;

  bytes32 domainSeparator = keccak256(abi.encode(keccak256("EIP712Domain(string name,string version)"), keccak256("Airnode"), keccak256("1")));
  bytes32 structHashHashedType = keccak256("Response(bytes32 requestId,bytes data)");

  function fulfill(
        bytes32 requestId,
        address airnode,
        // address fulfillAddress,
        // bytes4 fulfillFunctionId,
        bytes calldata data,
        bytes calldata signature
    ) external {
      bytes32 structHash = keccak256(abi.encode(structHashHashedType, requestId, keccak256(data)));
      bytes32 typedDataHash = domainSeparator.toTypedDataHash(structHash);

        require(
            typedDataHash.recover(signature) == airnode,
            "Invalid signature"
          );
        // Continue as usual...
    }
}
