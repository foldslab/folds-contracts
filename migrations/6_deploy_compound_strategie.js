const fs = require('fs');

const Storage = artifacts.require("Storage");
const FeeRewardForwarder = artifacts.require("FeeRewardForwarder");
const Controller = artifacts.require("Controller");
const Vault = artifacts.require("Vault");
const VaultProxy = artifacts.require("VaultProxy");
const StrategyProxy = artifacts.require("StrategyProxy");
const CompoundStrategy = artifacts.require("CompoundStrategy");
const IERC20 = artifacts.require("IERC20");
const IMasterChef = artifacts.require("IMasterChef");
const RewardToken = artifacts.require("RewardToken");
const NoMintRewardPool = artifacts.require("NoMintRewardPool");

const hecoAddresses = require('../constants/hecoAddresses')
const fildaAddresses = require('../constants/fildaAddresses')
const deployedContracts = require('../constants/deployedContracts')

const tokenNames = ['USDT', 'HUSD'];
const { comptroller, comp } = fildaAddresses.common;
const { UNISWAP_V2_ROUTER02_ADDRESS } = hecoAddresses;
// Make sure Ganache is running beforehand
module.exports = async function (deployer, network, accounts) {
    if (network === 'development') return;
    if (tokenNames.length === 0) return;

    async function deployVaultAndStrategy(tokenName) {
        console.log('===== DEPLOY COMPOUND CONTRACTS =====');
        const storageAddress = deployedContracts.STORAGE;
        const controller = await Controller.at(deployedContracts.CONTROLLER);

        console.log('======= will deploy vault: ', tokenName, '=========');

        const { underlying, ctoken } = fildaAddresses[tokenName];
        console.log('======= underlying token and address: ', tokenName, underlying, '=========');

        await deployer.deploy(Vault);
        const vaultImpl = await Vault.deployed();

        await deployer.deploy(VaultProxy, vaultImpl.address);
        const vaultProxy = await VaultProxy.deployed();

        const vault = await Vault.at(vaultProxy.address);

        const toInvestNumerator = 100;  // invest all
        const toInvestDenominator = 100;
        await vault.initializeVault(
            storageAddress,
            underlying,
            toInvestNumerator,
            toInvestDenominator
        );

        // deploy and set up the strategy
        await deployer.deploy(
            CompoundStrategy,
            storageAddress,
            underlying,
            ctoken,
            vault.address,
            comptroller,
            comp,
            UNISWAP_V2_ROUTER02_ADDRESS
        );
        const strategyImpl = await CompoundStrategy.deployed();

        await deployer.deploy(StrategyProxy, strategyImpl.address);
        const strategyProxy = await StrategyProxy.deployed();

        const strategy = await CompoundStrategy.at(strategyProxy.address);

        // targeting 50% collateral ratio
        let numerator = 50;
        let denominator = 100;
        let tolerance = 2;

        await strategy.setRatio(numerator, denominator, tolerance);

        console.log('vault.address, strategy.address: ', vault.address, strategy.address)
        // link vault with strategy
        await controller.addVaultAndStrategy(vault.address, strategy.address);

        return {
            STRATEGY_ADDRESS: strategy.address, // proxy, what we will use
            VAULT_ADDRESS: vault.address,   // proxy, what we will use
            STRATEGY_IMPL_ADDRESS: strategyImpl.address,    // implementation
            VAULT_IMPL_ADDRESS: vaultImpl.address,    // implementation
        };
    }
    const result = {};
    for (const tokenName of tokenNames) {
        const vaultContracts = await deployVaultAndStrategy(tokenName);
        result[tokenName] = vaultContracts;

        console.log('New contracts added, result: ', result)
    }

    // write contract addresses to json file
    const path = __dirname + '/../constants/compoundStrategyContracts.js';
    fs.writeFileSync(path, 'module.exports = ' + JSON.stringify(deployedContracts));
}

