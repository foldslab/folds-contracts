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
console.log('hecoAddresses: ', hecoAddresses);

// Make sure Ganache is running beforehand
module.exports = async function (deployer, network, accounts) {
    const governance = accounts[0]
    // ======== Deploy most of the contracts ========
    console.log('===== DEPLOY MOST OF THE CONTRACTS =====');

    // storage
    await deployer.deploy(Storage);
    const storage = await Storage.deployed();

    // FeeRewardForwarder
    await deployer.deploy(FeeRewardForwarder, storage.address, hecoAddresses.UNISWAP_V2_ROUTER02_ADDRESS);
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
    // Storage setting
    await storage.setController(controller.address);

    // Vault
    await deployer.deploy(Vault);
    const vaultImpl = await Vault.deployed();

    await deployer.deploy(VaultProxy, vaultImpl.address);
    const vaultProxy = await VaultProxy.deployed();

    const vault = await Vault.at(vaultProxy.address);

    await vault.initializeVault(
        storage.address,
        hecoAddresses.SUSHISWAP_HUSD_USDT_LP_ADDRESS,
        100,
        100
    );

    // set up the strategy
    await deployer.deploy(SushiMasterChefLPStrategy);
    const strategyImpl = await SushiMasterChefLPStrategy.deployed();

    await deployer.deploy(StrategyProxy, strategyImpl.address);
    const strategyProxy = await StrategyProxy.deployed();

    const strategy = await SushiMasterChefLPStrategy.at(strategyProxy.address);

    console.log('strategy: ', strategy.address);

    // external setup
    const tokenLiquidationPaths = [
        [hecoAddresses.SUSHI_ADDRESS, hecoAddresses.HUSD_ADDRESS],
        [hecoAddresses.SUSHI_ADDRESS, hecoAddresses.USDT_ADDRESS]
    ];
    const poolID = hecoAddresses.SUSHISWAP_HUSD_USDT_POOL_ID;

    let cropToken = await IERC20.at(hecoAddresses.SUSHI_ADDRESS);
    let cropPool = await IMasterChef.at(hecoAddresses.SUSHISWAP_MASTER_CHEF);
    let token0Path = tokenLiquidationPaths[0]; // [hecoAddresses.SUSHI_ADDRESS, hecoAddresses.HUSD_ADDRESS];
    let token1Path = tokenLiquidationPaths[1]; // [hecoAddresses.SUSHI_ADDRESS, hecoAddresses.USDT_ADDRESS];

    await strategy.initializeStrategy(
        storage.address,
        hecoAddresses.SUSHISWAP_HUSD_USDT_LP_ADDRESS,
        vault.address,
        cropPool.address,
        cropToken.address,
        poolID
    );

    await strategy.setLiquidationPathsOnUni(
        token0Path,
        token1Path
    );

    await strategy.setLiquidationPathsOnSushi(
        token0Path,
        token1Path
    );

    await strategy.setUseUni(
        false
    );

    // link vault with strategy
    await controller.addVaultAndStrategy(vault.address, strategy.address);

    const deployedContracts = {
        GOVERNANCE: governance,
        STORAGE: storage.address,
        CONTROLLER: controller.address,
        // REWARD_TOKEN: rewardToken.address, // FOLDS
        // REWARD_POOL: rewardPool.address,
        SUSHI_STRATEGY_ADDRESS: strategyImpl.address,
        SUSHI_STRATEGY_PROXY_ADDRESS: strategy.address,
        SUSHISWAP_HUSD_USDT_LP_VAULT_ADDRESS: vaultImpl.address,
        SUSHISWAP_HUSD_USDT_LP_VAULT_PROXY_ADDRESS: vault.address,
        FEE_REWARD_FORWARDER: feeRewardForwarder.address,
    };

    console.log('Will save contracts, deployedContracts: ', deployedContracts)

    // write contract addresses to json file
    const path = __dirname + '/../constants/deployedContracts.js';
    fs.writeFileSync(path, 'module.exports = ' + JSON.stringify(deployedContracts));
}

