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

    function makeMarketItem(address nftContract, uint tokenId, uint price) public payable nonReentrant {

        // nonReentrant is a modifier to prevent reentry attack
        require(price > 0, 'Price must be at least one wei');
        require(msg.value == listingPrice, 'Price must be equal to listing price');

        _tokenIds.increment();
        uint itemId = _tokenIds.current();

        // Putting it up for sale - bool - no owner
        idToMarketToken[itemId] = MarketToken(itemId, nftContract, tokenId, payable(msg.sender), payable(address(0)), price, false);

        // NFT transaction
        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);
        emit MarketTokenMinted(itemId, nftContract, tokenId, msg.sender, address(0), price, false);
    }

    // Function to conduct transactions and market sales
    function createMarketSale(address nftContract, uint itemId) public payable nonReentrant {

        uint price = idToMarketToken[itemId].price;
        uint tokenId = idToMarketToken[itemId].tokenId;
        require(msg.value == price, 'Please submit the asking price in order to continue');

        // Transfer the amount to the seller
        idToMarketToken[itemId].seller.transfer(msg.value);

        // Transfer thetoken from contract address to the buyer
        IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);

        // Update the item to be sold
        idToMarketToken[itemId].owner = payable(msg.sender);
        idToMarketToken[itemId].sold = true;

        // Update the tokensSold count
        _tokensSold.increment();

        payable(owner).transfer(listingPrice);

    }
    
    // Function to fetchMarket Items - minting, buying and selling
    // Returns the number of unsold items
    function fetchMarketTokens() public view returns(MarketToken[] memory) {

        uint itemCount = _tokenIds.current();
        uint unsoldItemCount = _tokenIds.current() - _tokensSold.current();
        uint currentIndex = 0;

        // Looping over the number of items created (if number has not been sold populate the array)
        MarketToken[] memory items = new MarketToken[](unsoldItemCount);
        for(uint i = 0; i < itemCount; i++) {
            if(idToMarketToken[i + 1].owner == address(0)) {
                uint currentId = i + 1;
                MarketToken storage currentItem = idToMarketToken[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }

        return items;

    }

    // Return NFTs that the user has purchased
    function fetchMyNFTs() public view returns(MarketToken[] memory) {

        uint totalItemCount = _tokenIds.current();

        // Second counter for each individual user
        uint itemCount = 0;
        uint currentIndex = 0;

        for(uint i = 0; i < totalItemCount; i++) {
            if(idToMarketToken[i + 1].owner == msg.sender) {
                itemCount += 1;
            }
        }

        // Second loop to loop through the amoount you have purchased with itemCount
        // Check to see if the owner address is equal to msg.sender
        MarketToken[] memory items = new MarketToken[](itemCount);

        for(uint i = 0; i < totalItemCount; i++) {
            if(idToMarketToken[i + 1].owner == msg.sender) {
                uint currentId = idToMarketToken[i + 1].itemId;
                // Current Array
                MarketToken storage currentItem = idToMarketToken[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    // Function for returning an array of minted NFTs
    function fetchItemsCreated() public view returns(MarketToken[] memory) {
        // instead of .owner it will be the .seller
        uint totalItemCount = _tokenIds.current();
        uint itemCount = 0;
        uint currentIndex = 0;

        for(uint i = 0; i < totalItemCount; i++) {
            if(idToMarketToken[i + 1].seller == msg.sender) {
                itemCount += 1;
            }
        }

        // Second loop to loop through the amoount you have purchased with itemCount
        // Check to see if the owner address is equal to msg.sender
        MarketToken[] memory items = new MarketToken[](itemCount);

        for(uint i = 0; i < totalItemCount; i++) {
            if(idToMarketToken[i + 1].seller == msg.sender) {
                uint currentId = idToMarketToken[i + 1].itemId;
                MarketToken storage currentItem = idToMarketToken[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }
    
}