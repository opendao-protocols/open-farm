pragma solidity ^0.5.12;

// Reference
import { IERC20 } from "./IERC20.sol";
import { IMigratorChef } from "./IMigratorChef.sol";

// Inheritance
import { MasterChefStructs } from "./MasterChefStructs.sol";

contract MasterChefStorage is MasterChefStructs {
    /** WARNING: NEVER RE-ORDER VARIABLES! 
     *  Always double-check that new variables are added APPEND-ONLY.
     *  Re-ordering variables can permanently BREAK the deployed proxy contract.
     */
    address public _owner;
    bool public initialized;

    // The SUSHI TOKEN!
    IERC20 public sushi;
    // Dev address.
    address public devaddr;
    // Block number when bonus SUSHI period ends.
    uint256 public bonusEndBlock;
    // SUSHI tokens created per block.
    uint256 public sushiPerBlock;
    // Bonus muliplier for early sushi makers.
    uint256 public constant BONUS_MULTIPLIER = 10;
    // The migrator contract. It has a lot of power. Can only be set through governance (owner).
    IMigratorChef public migrator;

    // Info of each pool.
    PoolInfo[] public poolInfo;
    // Info of each user that stakes LP tokens.
    mapping (uint256 => mapping (address => UserInfo)) public userInfo;
    // Total allocation poitns. Must be the sum of all allocation points in all pools.
    uint256 public totalAllocPoint = 0;
    // The block number when SUSHI mining starts.
    uint256 public startBlock;

}
