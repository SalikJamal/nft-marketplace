// SPDX-License-Identifier: MIT

pragma solidity >= 0.8.4;


import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/utils/Counters.sol';
// Security against transactions for multiple requests
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';
import 'hardhat/console.sol';


contract DPMarket is ReentrancyGuard {

    using Counters for Counters.Counter;

    /* Number of items minting, number of transactions, tokens that have not been sold
        Keep track of tokens total number - tokenId
        Arrays need to know the length - helps to keep tract for arrays 
    */

    Counters.Counter private _tokenIds;
    Counters.Counter private _tokensSold;

    // Determine who is the owner of the contract
    // Charge a listing fee so the owner makes a comission

    address payable owner;
    // We are deploying to matic, the API is the same so you can use ether the same way as matic
    // They both have 18 decimals
    // 0.045 is in the cents for Matic
    uint listingPrice = 0.045 ether;

    constructor() {
        // Set the owner of the contract
        owner = payable(msg.sender);
    }

    // Structs can act like objects
    struct MarketToken {
        uint itemId;
        address nftContract;
        uint tokenId;
        address payable seller;
        address payable owner;
        uint price;
        bool sold;
    }

    // tokenId return which MarketToken - fetch which one it is
    mapping(uint => MarketToken) private idToMarketToken;

    // Listen to events from front end apps
    event MarketTokenMinted(
        uint indexed itemId, 
        address indexed nftContract, 
        uint indexed tokenId, 
        address seller, 
        address owner, 
        uint price, 
        bool sold
    );

    // Get the listing price
    function getListingPrice() public view returns(uint) {
        return listingPrice;
    }

    // Two functions to interact with contract
    // 1. Create a market item to put it up for sale
    // 2. Create a market sale for buying and selling between different parties

    function mintMarketItem(address nftContract, uint tokenId, uint price) public payable nonReentrant {

        // nonReentrant is a modifier to prevent reentry attack
        require(price > 0, 'Price must be at least one wei');
        require(msg.value == listingPrice, 'Price must be equal to listing price');

        _tokenIds.increment();
        uint itemId = _tokenIds.current();

        // Putting it up for sale - bool - no owner
        idToMarketToken[itemId] = MarketToken(itemId, nftContract, tokenId, payable(msg.sender), payable(address(0)), price, false);

    }

    // NFT transaction

}