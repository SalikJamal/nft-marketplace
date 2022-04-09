const fs = require('fs')
require("@nomiclabs/hardhat-waffle")


const projectId = '2f794f05c64e4911932e87eb84d78501'
const keyData = fs.readFileSync('./p-key.txt', {
  encoding: 'utf8',
  flag: 'r'
})

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 1337 // Configuration standard for the hardhat network
    },
    mumbai: {
      url: `https://polygon-mumbai.infura.io/v3/${projectId}` ,
      accounts: [keyData]
    },
    mainnet: {
      urL: `https://mainnet.infura.io/v3/${projectId}`,
      accounts: [keyData]
    }
  },
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
}