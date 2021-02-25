const fs = require('fs');

const SushiMasterChefLPStrategy = artifacts.require("SushiMasterChefLPStrategy");

const hecoAddresses = require('../constants/hecoAddresses')

const deployedContracts = require('../constants/deployedContracts')
console.log('deployedContracts: ', deployedContracts);

const utils = require('../utils/address')

const vaultKeys = [
    // 'HBTC_USDT',
    // 'ETH_USDT',
    // 'HUSD_USDT',
    // 'HLTC_USDT',
    // 'HBCH_USDT',
    // 'HDOT_USDT',
    // 'HFIL_USDT',
    // 'WHT_HUSD',
    'MDX_USDT',
    // 'WHT_USDT',
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
    // 'ETH_WHT',
    // 'HBTC_ETH',
    // 'HBTC_MDX',
    // 'ETH_MDX',
];

// Make sure Ganache is running beforehand
module.exports = async function (deployer, network, accounts) {
    if (network === 'development') return;
    if (vaultKeys.length === 0) return;

    async function deployVaultAndStrategy(vaultKey) {
        console.log(`===== DEPLOY ${vaultKey} CONTRACTS =====`);

        // deploy and set up the strategy
        await deployer.deploy(SushiMasterChefLPStrategy);
        const strategyImpl = await SushiMasterChefLPStrategy.deployed();

        const strategy = await SushiMasterChefLPStrategy.at(deployedContracts[vaultKey].STRATEGY_ADDRESS);

        await strategy.scheduleUpgrade(strategyImpl.address, {from: governance});

        // after 12 hours, call this
        // await strategy.upgrade({from: governance});

        return {
            STRATEGY_IMPL_ADDRESS: strategyImpl.address,    // implementation
        };
    }

    for (const vaultKey of vaultKeys) {
        const vaultContracts = await deployVaultAndStrategy(vaultKey);
        deployedContracts[vaultKey].STRATEGY_IMPL_ADDRESS = vaultContracts.STRATEGY_IMPL_ADDRESS;

        console.log('New contracts added, deployedContracts: ', deployedContracts)
    }

    // write contract addresses to json file
    const path = __dirname + '/../constants/deployedContracts.js';
    fs.writeFileSync(path, 'module.exports = ' + JSON.stringify(deployedContracts));
}

