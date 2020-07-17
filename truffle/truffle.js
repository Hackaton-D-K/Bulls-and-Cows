require('@babel/register');
require('core-js');
require('regenerator-runtime/runtime');
require('dotenv').config();

const HDWalletProvider = require('@truffle/hdwallet-provider');

module.exports = {
  plugins: [
    'solidity-coverage',
    'truffle-plugin-verify',
  ],
  networks: {
    development: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '*',
      gas: 6000000,
      gasPrice: 1100000000,
      gasLimit: 10000000,
    }
  },
  compilers: {
    solc: {
      version: '0.5.11',
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },
      },
    },
  }
};
