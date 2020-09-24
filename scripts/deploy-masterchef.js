/**
 * @dev Interactive script to deploy a MasterChef contract
 */

const { promisify } = require("util");

const addresses = require('./common/addresses');
const { getGasPrice } = require('./common/eth-gas');
const rl = require("./common/rl");
const defaults = require("./common/defaults");

const MasterChef = artifacts.require("MasterChef");
const Proxy = artifacts.require("Proxy");

module.exports = async (callback) => {
  try {
    let world = {};
    world.web3 = web3;

    let network = await web3.eth.net.getNetworkType();
    network = network === 'main' ? 'mainnet' : network;

    const contractAddresses = addresses[network];

    let accounts = await web3.eth.getAccounts();
    console.log(`\nUsing account: ${accounts[0]}\n`);

    let openToken = await promisify(rl.question)("Provide OPEN Token address: ") || contractAddresses.OPEN;
    let devAddress = await promisify(rl.question)("Provide Dev Address: ") || accounts[0];
    let perBlockReward = await promisify(rl.question)("Provide per block reward amount(not in Wei): ") || '100';
    
    let startBlock = await promisify(rl.question)("Provide reward distribution start block: ");
    if (!startBlock) {
      let latestBlock = await web3.eth.getBlock('latest');
      startBlock = latestBlock.number;
    }
    
    let bonusEndBlock = await promisify(rl.question)("Provide reward distribution bonus end block: ");
    if (!bonusEndBlock) {
      bonusEndBlock = parseFloat(startBlock) + 10000;
      bonusEndBlock = bonusEndBlock.toString();
    }

    if (!openToken || !devAddress || !perBlockReward || !startBlock || !bonusEndBlock) {
      console.log("Invalid Input!!! Returning");
      callback();
    }

    perBlockReward = web3.utils.toWei(perBlockReward);
  
    let txParams = {
      gasPrice: await setGasPrice(world, network)
    }

    console.log(`\nDeploying MasterChef Logic...`);
    // Deploy MasterChef logic/implementation
    let logic = await MasterChef.new(txParams);
    console.log(`\nMasterChef Logic deployed at: `, logic.address);
    console.log(`\nDeploying MasterChef Proxy...`);

    // Deploy MasterChef itself as proxy
    // Get the init code for MasterChef
    const masterChefConstructCode = logic.contract.methods.initialize(openToken, devAddress, perBlockReward, startBlock, bonusEndBlock)
      .encodeABI();

    txParams = {
      gasPrice: await setGasPrice(world, network)
    }
    // Deploy the Proxy, using the init code for MasterChef
    const proxy = await Proxy.new(masterChefConstructCode, logic.address, txParams);
    console.log(`\nMasterChef proxy deployed at: ${proxy.address}`);

    callback();
  } catch (err) {
    callback(err);
  }
};

const setGasPrice = async (world, network) => {
  let gasPrice = await getGasPrice(world);
  if (network === 'mainnet' && process.env.MAINNET_GAS_PRICE) {
    gasPrice = process.env.MAINNET_GAS_PRICE;
  }
  return gasPrice;
}
