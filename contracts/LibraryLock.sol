pragma solidity ^0.5.0;

// Inheritance
import { MasterChefStorage } from "./MasterChefStorage.sol";

contract LibraryLock is MasterChefStorage {
    // Ensures no one can manipulate the Logic Contract once it is deployed.
    // PARITY WALLET HACK PREVENTION

    modifier delegatedOnly() {
        require(
            initialized == true,
            "The library is locked. No direct 'call' is allowed."
        );
        _;
    }
    function initialize() internal {
        initialized = true;
    }
}
