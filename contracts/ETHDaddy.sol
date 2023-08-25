// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

/**
 * List Domains
 * Track Domains - Sell Domains 
 *  Get Paid 
 */

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

error ETHDaddy__InvalidTokenId();
error ETHDaddy__InsufficientFundsSent();
error ETHDaddy__AlreadyMinted();
error ETHDaddy__NotValidOwner();
error ETHDaddy__WithdrawFailed();
error ETHDaddy__DomainNotMinted();


contract ETHDaddy is ERC721{

    address private immutable i_owner;
    uint256 private s_DomainCounter;
    uint256 private s_MintedDomains;
    mapping(uint256 => Domain) private s_Domains;
    mapping(address => uint256) private s_ListingOwnersCost;

    struct Domain {
        string name;
        uint256 cost;
        bool isOwned;
    }

    constructor () ERC721("ETH Daddy","DAD") {
        i_owner = msg.sender;
        s_DomainCounter = 0;
        s_MintedDomains = 0;
    }

    // The nft will minted only when purchased, not when it is listed 
    function List(string memory _name, uint256 _cost) public {

        s_Domains[s_DomainCounter] = Domain(_name,_cost,false);

        unchecked {
            ++s_DomainCounter;
        }
        s_ListingOwnersCost[msg.sender] = s_ListingOwnersCost[msg.sender] + _cost;

    }

    function Mint(uint256 _Id) public payable{
        if (_Id >= s_DomainCounter) {
            revert ETHDaddy__InvalidTokenId();
        }
        
        if (s_Domains[_Id].cost > msg.value) {
            revert ETHDaddy__InsufficientFundsSent();
        }

        if (s_Domains[_Id].isOwned == true) {
            revert ETHDaddy__AlreadyMinted();
        }

        unchecked{
            ++s_MintedDomains;
        }
        
        s_Domains[_Id].isOwned = true;

        _safeMint(msg.sender,_Id,"0x");
 
    }

    function Withdraw() public {
        if (s_ListingOwnersCost[msg.sender] == 0) {
            revert ETHDaddy__NotValidOwner();
        }

        if (getBalance() < s_ListingOwnersCost[msg.sender]) {
            revert ETHDaddy__DomainNotMinted();
        }

        uint256 balance = s_ListingOwnersCost[msg.sender];
        s_ListingOwnersCost[msg.sender] = 0;

        (bool success, ) = msg.sender.call{value : balance }("");
        if (!success) {
            revert ETHDaddy__WithdrawFailed();
        }
    }

    function getOwner() public view returns (address){
        return i_owner;
    }

    function getDomainMapping(uint256 DomainId) public view returns (Domain memory){
        return s_Domains[DomainId];
    }
    
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function getMintedDomainsCount() public view returns (uint256) {
        return s_MintedDomains;
    }

    function getListedDomainsCount() public view returns (uint256) {
        return s_DomainCounter;
    }

    function getListingOwnersCost(address _listee) public view returns (uint256) {
        return s_ListingOwnersCost[_listee];
    }
}
