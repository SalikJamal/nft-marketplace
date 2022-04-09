// SPDX-License-Identifier: MIT

pragma solidity >= 0.8.4;


// We will bring in the openZeppelin ERC721 NFT functionality
import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/utils/Counters.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';


contract NFT is ERC721URIStorage {

    // Counters allow us to keep track of tokenIds
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // OBJ: Give the NFT market the ability to transact with tokens or change ownership
    // setApprovalForAll allows us to do that with contract address
    // Address of marketplace for NFTs to interact
    address contractAddress;
    
    // Constructor to set up our address
    constructor(address marketplaceAddress) ERC721('DarkPhantoms', 'DPhantoms') {
        contractAddress = marketplaceAddress;
    }

    function mintToken(string memory tokenURI) public returns(uint) {

        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _mint(msg.sender, newItemId);
        // Set the tokenURI: Id and URI
        _setTokenURI(newItemId, tokenURI);
        // give the marketplace the approval to transact between users
        setApprovalForAll(contractAddress, true);
        
        // Mint the token and set it for sale - return the id to do so
        return newItemId; 

    }

}