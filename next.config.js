/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['ipfs.infura.io', 'next-nft-polygon.infura-ipfs.io']
  },
  env: {
    POLYGONSCAN_API_KEY: process.env.POLYGONSCAN_API_KEY,
    METAMASK_PRIVATE_KEY: process.env.METAMASK_PRIVATE_KEY,
    INFURA_PROJECT_ID: process.env.INFURA_PROJECT_ID,
    IPFS_GATEWAY_DOMAIN: process.env.IPFS_GATEWAY_DOMAIN,
    IPFS_PROJECT_ID: process.env.IPFS_PROJECT_ID,
    IPFS_API_SECRET: process.env.IPFS_API_SECRET
  }
}

module.exports = nextConfig
