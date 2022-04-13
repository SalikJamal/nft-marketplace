const hre = require("hardhat")
const fs = require('fs')

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const NFTMarket = await hre.ethers.getContractFactory("DPMarket")
  const nftMarket = await NFTMarket.deploy()
  await nftMarket.deployed()
  console.log("nftMarket contract deployed to:", nftMarket.address)

  const NFT = await hre.ethers.getContractFactory("NFT")
  const nft = await NFT.deploy(nftMarket.address)
  await nft.deployed()
  console.log("NFT contract deployed to:", nft.address)

  let config = `
  export const nftMarketAddress = '${nftMarket.address}'
  export const nftAddress = '${nft.address}'`

  let data = JSON.stringify(config)
  fs.writeFileSync('config.js', JSON.parse(data))
  
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
