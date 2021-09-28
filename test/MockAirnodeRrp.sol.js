const { expect } = require("chai");
const { ethers } = require("hardhat");

function generateRandomAirnodeWallet() {
  const airnodeWallet = ethers.Wallet.createRandom();
  const airnodeHdNode = ethers.utils.HDNode.fromMnemonic(airnodeWallet.mnemonic.phrase);
  const airnodeXpub = airnodeHdNode.neuter().extendedKey;
  return { airnodeAddress: airnodeWallet.address, airnodeMnemonic: airnodeWallet.mnemonic.phrase, airnodeXpub };
}

function generateRandomAddress() {
  return ethers.utils.getAddress(ethers.utils.hexlify(ethers.utils.randomBytes(20)));
}

describe("MockAirnodeRrp", function () {
  it("does not revert only with the correct signature", async function () {
    const accounts = await hre.ethers.getSigners();
    const sponsorWallet = accounts[1];
    const randomPerson = accounts[2];

    const MockAirnodeRrp = await ethers.getContractFactory("MockAirnodeRrp");
    const airnodeRrp = await MockAirnodeRrp.deploy();

    const { airnodeAddress, airnodeMnemonic } = generateRandomAirnodeWallet();

    // Derving the wallet with the explicit path just because
    const airnodeWallet = hre.ethers.Wallet.fromMnemonic(airnodeMnemonic, "m/44'/60'/0'/0/0");
    // Uses EIP-191
    // https://eips.ethereum.org/EIPS/eip-191
    const signature = await airnodeWallet.signMessage(ethers.utils.arrayify(ethers.utils.defaultAbiCoder.encode(['address'], [sponsorWallet.address])));

    // Does not revert if the signature matches airnode and requestId
    await expect(
      airnodeRrp.connect(sponsorWallet).fulfill(airnodeAddress, signature)
    ).to.not.be.reverted;

    // This next call will be a ~5000 gas cheaper because it doesn't need to confirm the signature
    await expect(
      airnodeRrp.connect(sponsorWallet).fulfill(airnodeAddress, signature)
    ).to.not.be.reverted;

    // Does not revert if the signature was confirmed before even if the signature is not correct
    await expect(
      airnodeRrp.connect(sponsorWallet).fulfill(airnodeAddress, "0x123456")
    ).to.not.be.reverted;

    // The sponsor wallet is allowed to update the associated Airnode address with another signature
    const { airnodeAddress: anotherAirnodeAddress, airnodeMnemonic: anotherAirnodeMnemonic } = generateRandomAirnodeWallet();
    const anotherAirnodeWallet = hre.ethers.Wallet.fromMnemonic(anotherAirnodeMnemonic, "m/44'/60'/0'/0/0");
    await expect(
      airnodeRrp.connect(sponsorWallet).fulfill(anotherAirnodeAddress, await anotherAirnodeWallet.signMessage(ethers.utils.arrayify(ethers.utils.defaultAbiCoder.encode(['address'], [sponsorWallet.address]))))
    ).to.not.be.reverted;
    // But then it will no longer be able to fulfill requests for the initial Airnode with an invalid signature
    await expect(
      airnodeRrp.connect(sponsorWallet).fulfill(airnodeAddress, "0x123456")
    ).to.be.reverted;

    // Others can't use the signature to fulfill the request themselves
    await expect(
      airnodeRrp.connect(randomPerson).fulfill(airnodeAddress, signature)
    ).to.be.reverted;

    // This is to create a reference for the gas costs
    await expect(
      airnodeRrp.fulfillBare(airnodeAddress)
    ).to.not.be.reverted;
  });
});
