const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MockAirnodeRrp", function () {
  it("works", async function () {
    const accounts = await hre.ethers.getSigners();
    const airnodeWallet = accounts[1];
    const MockAirnodeRrp = await ethers.getContractFactory("MockAirnodeRrp");
    const mockAirnodeRrp = await MockAirnodeRrp.deploy();

    const domain = {
      name: 'Airnode',
      version: '1'
    };

    const types = {
      Response: [
        {name: 'requestId', type: 'bytes32'},
        {name: 'data', type: 'bytes'}
      ]
    };

    const requestId = '0x1234567890123456789012345678901234567890123456789012345678901234';
    const data = '0x12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678';
    const value = {
      requestId: requestId,
      data: data
    };
    
    // If you want to do the same locally
    // const domainSeparatorHashedType = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('EIP712Domain(string name,string version)'));
    // const domainSeparator = ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(['bytes32', 'bytes32', 'bytes32'], [domainSeparatorHashedType, ethers.utils.keccak256(ethers.utils.toUtf8Bytes(domain.name)), ethers.utils.keccak256(ethers.utils.toUtf8Bytes(domain.version))]));

    // const structHashHashedType = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('Response(bytes32 requestId,bytes data)'));
    // const structHash = ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(['bytes32', 'bytes32', 'bytes32'], [structHashHashedType, requestId, ethers.utils.keccak256(ethers.utils.arrayify(data))]));

    const signature = await airnodeWallet._signTypedData(domain, types, value);
    await mockAirnodeRrp.fulfill(requestId, airnodeWallet.address, data, signature);
  });
});
