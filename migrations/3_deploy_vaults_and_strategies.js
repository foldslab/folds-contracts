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

const deployedContracts = require('../constants/deployedContracts')
console.log('deployedContracts: ', deployedContracts);

const vaultsToBeDeployed = [
    'HBTC_USDT',
    'ETH_USDT',
    'HUSD_USDT',
    'HLTC_USDT',
    'HBCH_USDT',
    'HDOT_USDT',
    // 'HFIL_USDT',
    'WHT_HUSD',
    'MDX_USDT',
    'WHT_USDT',
    // 'HPT_USDT',
    'MDX_WHT',
    // 'FILDA_HUSD',
    // 'LHB_USDT',
    // 'AAVE_USDT',
    // 'SNX_USDT',
    // 'UNI_USDT',
    // 'LINK_USDT',
    // 'BAL_USDT',
    // 'YFI_USDT',
    // 'HBTC_WHT',
    'ETH_WHT',
    // 'HBTC_ETH',
    // 'HBTC_MDX',
    // 'ETH_MDX',
];

// Make sure Ganache is running beforehand
module.exports = async function (deployer, network, accounts) {
    if (network === 'development') return;

    async function deployVaultAndStrategy(vaultKey) {
        console.log('===== DEPLOY VAULTS CONTRACTS =====');
        const storageAddress = deployedContracts.STORAGE;
        const controller = await Controller.at(deployedContracts.CONTROLLER);

        console.log('======= will deploy vault: ', vaultKey, '=========');

        const { LP_ADDRESS, POOL_ID } = hecoAddresses.POOLS[vaultKey];
        console.log('======= LP_ADDRESS, POOL_ID: ', LP_ADDRESS, POOL_ID, '=========');

        await deployer.deploy(Vault);
        const vaultImpl = await Vault.deployed();

        await deployer.deploy(VaultProxy, vaultImpl.address);
        const vaultProxy = await VaultProxy.deployed();

        const vault = await Vault.at(vaultProxy.address);

        const toInvestNumerator = 100;  // invest all
        const toInvestDenominator = 100;
        await vault.initializeVault(
            storageAddress,
            LP_ADDRESS,
            toInvestNumerator,
            toInvestDenominator
        );

        // deploy and set up the strategy
        await deployer.deploy(SushiMasterChefLPStrategy);
        const strategyImpl = await SushiMasterChefLPStrategy.deployed();

        await deployer.deploy(StrategyProxy, strategyImpl.address);
        const strategyProxy = await StrategyProxy.deployed();

        const strategy = await SushiMasterChefLPStrategy.at(strategyProxy.address);

        // external setup
        const tokenPairKeys = vaultKey.split('_');
        console.log('tokenPairKeys: ', tokenPairKeys);
        const token0Address = hecoAddresses[`${tokenPairKeys[0]}_ADDRESS`]
        const token1Address = hecoAddresses[`${tokenPairKeys[1]}_ADDRESS`]
        const sushiAddress = hecoAddresses.SUSHI_ADDRESS
        const sushiMasterChefAddress = hecoAddresses.SUSHISWAP_MASTER_CHEF

        console.log('token0Address, token1Address, sushiAddress, sushiMasterChefAddress: ', token0Address, token1Address, sushiAddress, sushiMasterChefAddress)

        const tokenLiquidationPaths = [
            [sushiAddress, token0Address],
            [sushiAddress, token1Address]
        ];

        const cropToken = await IERC20.at(sushiAddress);
        const cropPool = await IMasterChef.at(sushiMasterChefAddress);
        const token0Path = tokenLiquidationPaths[0];
        const token1Path = tokenLiquidationPaths[1];

        await strategy.initializeStrategy(
            storageAddress,
            LP_ADDRESS,
            vault.address,
            cropPool.address,
            cropToken.address,
            POOL_ID
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

        return {
            STRATEGY_ADDRESS: strategy.address, // proxy, what we will use
            VAULT_ADDRESS: vault.address,   // proxy, what we will use
            STRATEGY_IMPL_ADDRESS: strategyImpl.address,    // implementation
            VAULT_IMPL_ADDRESS: vaultImpl.address,    // implementation
        };
    }

    for (const vaultKey of vaultsToBeDeployed) {
        const vaultContracts = await deployVaultAndStrategy(vaultKey);
        deployedContracts[vaultKey] = vaultContracts;

        console.log('New contracts added, deployedContracts: ', deployedContracts)
    }

    // write contract addresses to json file
    const path = __dirname + '/../constants/deployedContracts.js';
    fs.writeFileSync(path, 'module.exports = ' + JSON.stringify(deployedContracts));
}

