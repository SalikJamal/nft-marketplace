import React from 'react'
import '../styles/globals.css'
import '../styles/app.css'
import Link from 'next/link'
import Head from 'next/head'

const DarkPhantomsMarketplace = ({ Component, pageProps }) => {

  return (
    <div>
      <Head><title>Dark Phantoms</title></Head>
      <nav className='border-b p-6 bg-primary'>
        <p className='text-4x1 font-bold text-funky-green'><Link href='/'><a>Dark Phantoms Marketplace</a></Link></p>
        <div className='flex mt-4 justify-center text-funky-green outline-none'>
          <Link href='/'><a className='mr-4'>Marketplace</a></Link>
          <Link href='/mint-item'><a className='mr-6'>Mint NFT</a></Link>
          <Link href='/my-nfts'><a className='mr-6'>My NFTs</a></Link>
          <Link href='/account-dashboard'><a className='mr-6'>Dashboard</a></Link>
        </div>
      </nav>
      <Component {...pageProps} />
    </div>
  )

}

export default DarkPhantomsMarketplace
