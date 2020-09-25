
/**
 * @dev Interactive script to deploy a MasterChef implementation
 */

const { getGasPrice } = require('./common/eth-gas');

const MasterChef = artifacts.require("MasterChef");

module.exports = async (callback) => {
  try {
    let world = {};
    world.web3 = web3;

    let network = await web3.eth.net.getNetworkType();
    network = network === 'main' ? 'mainnet' : network;

    let accounts = await web3.eth.getAccounts();
    console.log(`\nUsing account: ${accounts[0]}\n`);

    let gasPrice = await getGasPrice(world);
    if (network === 'mainnet' && process.env.MAINNET_GAS_PRICE) {
      gasPrice = process.env.MAINNET_GAS_PRICE;
    }

    let txParams = {
      gasPrice
    }

    console.log(`\nDeploying MasterChef Logic...`);
    let logic = await MasterChef.new(txParams);
    console.log(`\nMasterChef Logic deployed at: `, logic.address);

    callback();
  } catch (err) {
    callback(err);
  }
};
