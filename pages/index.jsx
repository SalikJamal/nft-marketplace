import React from 'react'
import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import axios from 'axios'
import Web3Modal from 'web3modal'
import Image from 'next/image'
import Loader from './components/Loader'

import { nftAddress, nftMarketAddress } from '../config'

import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import DPMarket from '../artifacts/contracts/DPMarket.sol/DPMarket.json'


const Home = () => {

  const [nfts, setNfts] = useState([])
  const [loading, setLoading] = useState(true)  

  const renderLoading = () => (
    <div className='loader-container'>
        <Loader />
    </div>
  )

  const loadNFTs = async () => {

    // What we want to load:
    // Provider, tokenContract, maretkContract, data for our marketItems
    const provider = new ethers.providers.JsonRpcProvider(`https://polygon-mumbai.infura.io/v3/${process.env.INFURA_PROJECT_ID}`)
    const tokenContract = new ethers.Contract(nftAddress, NFT.abi, provider)
    const marketContract = new ethers.Contract(nftMarketAddress, DPMarket.abi, provider)
    const data = await marketContract.fetchMarketTokens()

    const items = await Promise.all(data.map(async i => {
    
      const tokenURI = await tokenContract.tokenURI(i.tokenId)
      // We want the token metadata
      const meta = await axios.get(tokenURI)
      let price = ethers.utils.formatUnits(i.price.toString(), 'ether')

      let item = {
        price,
        tokenId: i.tokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        image: meta.data.image,
        name: meta.data.name,
        description: meta.data.description
      }
      return item

    }))

    setNfts(items)
    setLoading(false)

  }

  // Function to buy NFTs for market
  const buyNFT = async (nft) => {

    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(nftMarketAddress, DPMarket.abi, signer)

    const price = ethers.utils.parseUnits(nft.price.toString(), 'ether')
    const transaction = await contract.createMarketSale(nftAddress, nft.tokenId, { value: price })

    await transaction.wait()
    loadNFTs()

  }

  useEffect(() => {
    loadNFTs()
  }, [])

  if(!loading && !nfts.length) return (<h1 className='px-20 ml-12 py-36 text-3xl text-funky-green'>No NFTs in the marketplace</h1>)

  return (
    <div className='p-4'>
      <div className='px-4'>
        {loading ? renderLoading() : 
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 pb-4'>
            {nfts.map((nft, i) => (
              <div key={i} className='border shadow rounded-x1 overflow-hidden'>
                <div style={{ position: "relative", width: "100%", height: 400 }}><Image src={nft.image} alt={nft.name} layout='fill' objectFit='cover' /></div>
                <div className='p-4 bg-black'>
                  <p style={{ height: 64 }} className='text-3xl text-funky-green font-semibold'>{nft.name}</p>
                  <div style={{ height: 72, overflow: 'hidden' }}>
                    <p className='text-funky-green'>{nft.description}</p>
                  </div>
                </div>
                <div className='p-4 bg-black'>
                  <p className='text-3x-l mb-4 font-bold text-funky-green'>{nft.price} MATIC</p>
                  <button className='w-full bg-primary text-funky-green font-bold py-3 px-12 rounded' onClick={() => buyNFT(nft)}>Buy</button>
                </div>
              </div>
            ))}
          </div>
        }
      </div>
    </div>
  )

}


export default Home