
const BigNumber = require('bignumber.js');
const addresses = require('./common/addresses');

const MasterChef = artifacts.require("MasterChef");
const ERC20 = artifacts.require("ERC20");

module.exports = async (callback) => {
  try {
    let world = {};
    world.web3 = web3;

    let network = await web3.eth.net.getNetworkType();
    network = network === 'main' ? 'mainnet' : network;

    const contractAddresses = addresses[network];

    let MasterChefC = await MasterChef.at(contractAddresses.MasterChefProxy);
    const totalAllocPoint = BigNumber(await MasterChefC.totalAllocPoint());
    console.log(`Total Allocation Point: ${totalAllocPoint.toFixed()}\n`)
    const poolLength = await MasterChefC.poolLength();

    let poolData = [];
    let count = 0;
    for (let i = 0; i < poolLength; i++) {
      let pool = [];
      MasterChefC.poolInfo(i).then(async (poolInfo) => {
        pool.push(poolInfo.lpToken);

        const Erc20C = await ERC20.at(poolInfo.lpToken);
        const name = await Erc20C.name();
        pool.push(name);

        let allocPoint = new BigNumber(poolInfo.allocPoint);
        let allocPercentage = allocPoint.times(100).div(totalAllocPoint);
        pool.push(allocPercentage.toFixed());
        pool.push(allocPoint.toFixed());

        poolData.push(pool);
        count++;

        if (count == poolLength) {
          printData(poolData);
          callback();
        }
      });
    }

  } catch (err) {
    console.error(err);
    callback(err);
  }
}

const printData = (poolData) => {
  let sortedArr = poolData.sort((a, b) => {
    return b[2] - a[2]
  });
  console.table(sortedArr);
}
