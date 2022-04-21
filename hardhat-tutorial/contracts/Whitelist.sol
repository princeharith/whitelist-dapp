//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract Whitelist {
    //max number of whitelisted addresses
    uint8 public maxWhitelistedAddresses;

    //mapping of addresses to bools
    mapping(address => bool) public whitelistedAddresses;

    //keeping track of how many addresses whitelisted
    uint8 public numAddressesWhitelisted;

    //setting up max num of whitelisted addresses

    constructor(uint8 _maxWhiteListedAddresses) {
        maxWhitelistedAddresses = _maxWhiteListedAddresses;
    }

    function addAddressToWhitelist() public {
        //check if user whitelisted, same as = false
        require(
            whitelistedAddresses[msg.sender] == false,
            "Sender already whitelisted"
        );
        require(
            numAddressesWhitelisted < maxWhitelistedAddresses,
            "More addresses can't be whitelisted"
        );

        whitelistedAddresses[msg.sender] = true;
        numAddressesWhitelisted += 1;
    }
}
