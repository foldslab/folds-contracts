const fs = require('fs');

const Storage = artifacts.require("Storage");
const FeeRewardForwarder = artifacts.require("FeeRewardForwarder");
const Controller = artifacts.require("Controller");
const Vault = artifacts.require("Vault");
const VaultProxy = artifacts.require("VaultProxy");
const StrategyProxy = artifacts.require("StrategyProxy");
const SushiMasterChefLPStrategy = artifacts.require("SushiMasterChefLPStrategy");
const IERC20 = artifacts.require("IERC20");
const IMasterChef = artifacts.require("IMasterChef");
const RewardToken = artifacts.require("RewardToken");
const NoMintRewardPool = artifacts.require("NoMintRewardPool");

const hecoAddresses = require('../constants/hecoAddresses')
const secret = require("../secret.json");

// Make sure Ganache is running beforehand
module.exports = async function (deployer, network, accounts) {
    const governance = accounts[0]
    // ======== Deploy most of the contracts ========
    console.log('===== DEPLOY MOST OF THE CONTRACTS =====');

    // storage
    await deployer.deploy(Storage);
    const storage = await Storage.deployed();

    // FeeRewardForwarder
    await deployer.deploy(FeeRewardForwarder, storage.address);
    const feeRewardForwarder = await FeeRewardForwarder.deployed();

    // set governance as the reward fee receiver
    await feeRewardForwarder.setProfitSharingPool(governance);

    // deploy farm token
    // await deployer.deploy(RewardToken, storage.address);
    // const rewardToken = await RewardToken.deployed();

    // deploy reward pool
    // const rewardDuration = 7 * 86400; // 7 days
    // const rewardDistribution = feeRewardForwarder.address

    // await deployer.deploy(
    //     NoMintRewardPool,
    //     rewardToken.address, // rewardToken should be FOLDS
    //     hecoAddresses.SUSHISWAP_HUSD_USDT_LP_ADDRESS, // lpToken
    //     rewardDuration,     // duration
    //     rewardDistribution, // reward distribution
    //     storage.address,    // storage
    //     governance, // sourceVault
    //     governance  // migrationStrategy
    // );
    // const rewardPool = await NoMintRewardPool.deployed();

    // console.log('****** rewardPool: ', rewardPool.address);

    // Controller
    await deployer.deploy(Controller, storage.address, feeRewardForwarder.address);
    const controller = await Controller.deployed();

    controller.addHardWorker(secret.hardWorkerAddress);

    // Storage setting
    await storage.setController(controller.address);

    const deployedContracts = {
        GOVERNANCE: governance,
        STORAGE: storage.address,
        CONTROLLER: controller.address,
        // REWARD_TOKEN: rewardToken.address, // FOLDS
        // REWARD_POOL: rewardPool.address,
        FEE_REWARD_FORWARDER: feeRewardForwarder.address,
    };

    console.log('Will save contracts, deployedContracts: ', deployedContracts)

    // write contract addresses to json file
    const path = __dirname + '/../constants/deployedContracts.js';
    fs.writeFileSync(path, 'module.exports = ' + JSON.stringify(deployedContracts));
}

