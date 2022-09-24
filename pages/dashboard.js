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

const POLYGON_MUMBAI_CHAINID = 80001


const Dashboard = () => {

  const [nfts, setNfts] = useState([])
  const [sold, setSold] = useState([])
  const [loading, setLoading] = useState(false)

  const renderLoading = () => (
    <div className='loader-container'>
        <Loader />
    </div>
  )

  const loadNFTs = async () => {

    // What we want to load:
    // We want to get the msg.sender and hook up to the signer to display the owner's NFTs

    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()
    console.log("HI!")

    const { chainId } = await provider.getNetwork()
      
    if(chainId !== POLYGON_MUMBAI_CHAINID) {
      alert('Please switch to Polygon Mumbai Test network and refresh the page')
      return
    } 

    setLoading(true)

    const tokenContract = new ethers.Contract(nftAddress, NFT.abi, provider)
    const marketContract = new ethers.Contract(nftMarketAddress, DPMarket.abi, signer)
    const data = await marketContract.fetchItemsCreated()

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

    // Create a filtered array of items that have been sold
    const soldItems = items.filter(i => i.sold)
    setSold(soldItems)
    setNfts(items)
    setLoading(false)

  }

  useEffect(() => {
    loadNFTs()
  }, [])

  if(!loading && !nfts.length) return (<h1 className='px-20 ml-12 py-36 text-3xl text-funky-green'>You have not minted any NFTs!</h1>)

  return (
    <div className='p-4'>
        <h1 style={{ fontSize: 20, fontWeight: 'bold' }} className='text-funky-green'>Tokens Minted</h1>
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
                  </div>
                  </div>
              ))}
            </div>
          }
      </div>
    </div>
  )

}


export default Dashboard