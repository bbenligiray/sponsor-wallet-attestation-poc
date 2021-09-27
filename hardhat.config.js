require("@nomiclabs/hardhat-waffle");
require('hardhat-gas-reporter');

module.exports = {
  gasReporter: {
    enabled: true,
    outputFile: 'gas_report',
    noColors: true,
  },
  solidity: "0.8.6",
};
