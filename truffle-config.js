const HDWalletProvider = require('@truffle/hdwallet-provider');
const secret = require("./secret.json");

module.exports = {
  networks: {
    development: {
     host: "127.0.0.1",
     port: 8545,
     network_id: "*",
     gas: 6721975,
    },
    ropsten: {
      provider: function () {
        return new HDWalletProvider(secret.privateKey.ropsten, `https://ropsten.infura.io/v3/${secret.infuraKey}`, 1);
      },
      network_id: 3,
      gas: 4721975,
      skipDryRun: true,
      gasPrice: 23000000000,
    },
    heco: {
      provider: new HDWalletProvider(secret.privateKey.heco, `https://http-mainnet.hecochain.com`,0, 10),
      network_id: 128,
      gas: 8000000,      // Make sure this gas allocation isn't over 4M, which is the max
      gasPrice: 1000000000,
      confirmations: 4,    // # of confs to wait between deployments. (default: 0)
      // timeoutBlocks: 200,  // # of blocks before a deployment times out  (minimum/default: 50)
      // skipDryRun: true,
      networkCheckTimeout: 10000
    },
    mainnet: {
      provider: function () {
        const secret = require("./secret.json");
        return new HDWalletProvider(secret.privateKey.mainnet, `https://mainnet.infura.io/v3/${secret.infuraKey}`);
      },
      network_id: 1,
      gas: 6721975,
      skipDryRun: true,
      gasPrice: 75000000000,
    },
  },
  mocha: {
    timeout: 1200000
  },
  plugins: ["solidity-coverage"],
  compilers: {
    solc: {
      version: "0.5.16",
      settings: {
       optimizer: {
         enabled: true,
         runs: 150
       },
      }
    }
  }
}
