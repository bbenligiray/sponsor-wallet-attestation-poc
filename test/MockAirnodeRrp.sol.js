const { expect } = require("chai");
const { ethers } = require("hardhat");

function generateRandomAirnodeWallet() {
  const airnodeWallet = ethers.Wallet.createRandom();
  const airnodeHdNode = ethers.utils.HDNode.fromMnemonic(airnodeWallet.mnemonic.phrase);
  const airnodeXpub = airnodeHdNode.neuter().extendedKey;
  return { airnodeAddress: airnodeWallet.address, airnodeMnemonic: airnodeWallet.mnemonic.phrase, airnodeXpub };
}

function generateRandomBytes32() {
  return ethers.utils.hexlify(ethers.utils.randomBytes(32));
};

function generateRandomAddress() {
  return ethers.utils.getAddress(ethers.utils.hexlify(ethers.utils.randomBytes(20)));
}

function generateRandomBytes() {
  return ethers.utils.hexlify(ethers.utils.randomBytes(256));
}

describe("MockAirnodeRrp", function () {
  it("does not revert only with the correct signature", async function () {
    const MockAirnodeRrp = await ethers.getContractFactory("MockAirnodeRrp");
    const airnodeRrp = await MockAirnodeRrp.deploy();

    const { airnodeAddress, airnodeMnemonic } = generateRandomAirnodeWallet();
    const requestId = generateRandomBytes32();
    const data = generateRandomBytes();

    // Derving the wallet with the explicit path just because
    const airnodeWallet = hre.ethers.Wallet.fromMnemonic(airnodeMnemonic, "m/44'/60'/0'/0/0");
    // Uses EIP-191
    // https://eips.ethereum.org/EIPS/eip-191
    const signature = await airnodeWallet.signMessage(ethers.utils.arrayify(ethers.utils.keccak256(ethers.utils.solidityPack(['bytes32', 'bytes'], [requestId, data]))));

    // Does not revert if the signature matches airnode, requestId and data
    await expect(
      airnodeRrp.fulfill(requestId, airnodeAddress, data, signature)
    ).to.not.be.reverted;

    // Reverts otherwise
    await expect(
      airnodeRrp.fulfill(generateRandomBytes32(), airnodeAddress, data, signature)
    ).to.be.reverted;
    await expect(
      airnodeRrp.fulfill(requestId, generateRandomAddress(), data, signature)
    ).to.be.reverted;
    await expect(
      airnodeRrp.fulfill(requestId, airnodeAddress, generateRandomBytes(), signature)
    ).to.be.reverted;
    await expect(
      airnodeRrp.fulfill(requestId, airnodeAddress, data, await airnodeWallet.signMessage(ethers.utils.arrayify(generateRandomBytes32())))
    ).to.be.reverted;

    // Also do this for the gas test
    await expect(
      airnodeRrp.fulfillBare(requestId, airnodeAddress, data)
    ).to.not.be.reverted;
  });
});
