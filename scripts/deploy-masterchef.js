/**
 * @dev Interactive script to deploy a MasterChef contract
 */

const { promisify } = require("util");

const addresses = require('./common/addresses');
const { getGasPrice } = require('./common/eth-gas');
const rl = require("./common/rl");

const MasterChef = artifacts.require("MasterChef");
const Proxy = artifacts.require("Proxy");
const ERC20 = artifacts.require("ERC20");

module.exports = async (callback) => {
  try {
    let world = {};
    world.web3 = web3;

    let network = await web3.eth.net.getNetworkType();
    network = network === 'main' ? 'mainnet' : network;

    const contractAddresses = addresses[network];

    let accounts = await web3.eth.getAccounts();
    console.log(`\nUsing account: ${accounts[0]}\n`);

    let latestBlock = await web3.eth.getBlock('latest');
    console.log(`\nLatest Block: ${latestBlock.number}\n`);

    let rewardToken = await promisify(rl.question)("Provide Reward Token address: ") || contractAddresses.RewardToken;
    let devAddress = await promisify(rl.question)("Provide Dev Address: ") || accounts[0];
    let perBlockReward = await promisify(rl.question)("Provide per block reward amount(not in Wei): ") || '100';

    let startBlock = await promisify(rl.question)("Provide reward distribution start block: ");
    if (!startBlock) {
      startBlock = latestBlock.number;
    }

    let bonusEndBlock = await promisify(rl.question)("Provide reward distribution bonus end block: ") || startBlock;

    if (!rewardToken || !devAddress || !perBlockReward || !startBlock || !bonusEndBlock) {
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
    console.log(`\nMasterChef Logic deployed at: ${logic.address}`);
    console.log(`\nDeploying MasterChef Proxy...`);

    // Deploy MasterChef itself as proxy
    // Get the init code for MasterChef
    const masterChefConstructCode = logic.contract.methods.initialize(rewardToken, devAddress, perBlockReward, startBlock, bonusEndBlock)
      .encodeABI();

    txParams = {
      gasPrice: await setGasPrice(world, network)
    }
    // Deploy the Proxy, using the init code for MasterChef
    const proxy = await Proxy.new(masterChefConstructCode, logic.address, txParams);
    console.log(`\nMasterChef proxy deployed at: ${proxy.address}`);

    const RewardToken = await ERC20.at(rewardToken);
    let rewardTokenBalance = await RewardToken.balanceOf(accounts[0]);
    const decimals = await RewardToken.decimals();
    rewardTokenBalance = parseFloat(rewardTokenBalance) / (10 ** parseFloat(decimals));

    const symbol = await RewardToken.symbol();

    console.log(`\nAccount's Reward Token (${symbol}) balance: ${rewardTokenBalance}`);

    const amount = await promisify(rl.question)(`Provide amount of ${symbol} to transfer to MasterChef: `);
    if (!(parseFloat(amount) > 0)) {
      console.log('\nTranfer Aborted');
      callback();
    }

    let amountInDec = parseFloat(amount) * (10 ** parseFloat(decimals));
    amountInDec = amountInDec.toLocaleString('fullwide', { useGrouping: false });
    await RewardToken.transfer(proxy.address, amountInDec);
    console.log(`\nTransferred ${amount} ${symbol} to Proxy at ${proxy.address}`);

    callback();
  } catch (err) {
    callback(err);
  }
};

// TODO: should move it to 'utils'?
const setGasPrice = async (world, network) => {
  let gasPrice = await getGasPrice(world);
  if (network === 'mainnet' && process.env.MAINNET_GAS_PRICE) {
    gasPrice = process.env.MAINNET_GAS_PRICE;
  }
  return gasPrice;
}