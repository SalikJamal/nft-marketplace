import { useState } from 'react'
import { ethers } from 'ethers'
import Web3Modal from 'web3modal'
import { useRouter } from 'next/router'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import { nftAddress, nftMarketAddress } from '../config'
import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import DPMarket from '../artifacts/contracts/DPMarket.sol/DPMarket.json'


// In this component we set the IPFS up to hsot our NFT file storage
const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')

const mintItem = () => {

    const router = useRouter()
    const [fileURL, setFileURL] = useState(null)
    const [formInput, updateFormInput] = useState({
        price: '',
        name: '',
        description: ''
    })


    // Set up a function to fire when we update files in our form - we can add our NFT images - IPFS
    const onChange = async e => {

        const file = e.target.files[0]

        try {
            const added = await client.add(file, { progress: progress => console.log(`received: ${progress}`) })
            const url = `https://ipfs.infura.io/ipfs/${added.path}`
            setFileURL(url)
        } catch(error) {
            console.log('Error uploading file:', error)
        }
        
    }

    const createMarket = async () => {

        const { name, description, price } = formInput
        if(!name || !description || !price || !fileURL) return

        // Upload to IPFS
        const data = JSON.stringify({ name, description, image: fileURL })
        try {
            const added = await client.add(data)
            const url = `https://ipfs.infura.io/ipfs/${added.path}`
            // Run a function that creates a sale and passes in the URL
            createSale(url)
        } catch(error) {
            console.log('Error uploading file:', error)
        }

    }

    const createSale = async (url) => {

        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()

        // Create the token
        let contract = new ethers.Contract(nftAddress, NFT.abi, signer)
        let transaction = await contract.mintToken(url)
        let tx = await transaction.wait()
        let event = tx.events[0]
        let value = event.args[2]
        let tokenId = value.toNumber()
        const price = ethers.utils.parseUnits(formInput.price, 'ether')

        // List the item for sale on the marketplace
        contract = new ethers.Contract(nftMarketAddress, DPMarket.abi, signer)
        let listingPrice = await contract.getListingPrice()
        listingPrice = listingPrice.toString()

        transaction = await contract.makeMarketItem(nftAddress, tokenId, price, { value: listingPrice })
        await transaction.wait()

        router.push('./')

    }

    return (

        <div className='flex justify-center'>
            <div className='w-1/2 flex flex-col pb-12'>
                <input className='mt-8 border rounded p-4 outline-none' placeholder='Asset Name' onChange={e => updateFormInput({ ...formInput, name: e.target.value })}  />
                <textarea className='mt-2 border rounded p-4 outline-none' placeholder='Asset Description' onChange={e => updateFormInput({ ...formInput, description: e.target.value })}  />
                <input className='mt-2 border rounded p-4 outline-none' placeholder='Asset Price in Eth' onChange={e => updateFormInput({ ...formInput, price: e.target.value })}  />
                <input className='mt-4 outline-none' type='file' name='Asset' onChange={onChange}  /> {fileURL && <img className='rounded mt-4' src={fileURL} alt='Asset' width={350} />}
            
                <button className='font-bold mt-4 bg-primary text-funky-green rounded p-4 shadow-lg' onClick={createMarket}>Mint NFT</button>
            </div>
        </div>

    )

}


export default mintItem

// This is the first ever DarkPhantom NFT, with darkness and whatnot!
// DarkPhantom 001
// 100