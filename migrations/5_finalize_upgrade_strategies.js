const fs = require('fs');

const SushiMasterChefLPStrategy = artifacts.require("SushiMasterChefLPStrategy");

const hecoAddresses = require('../constants/hecoAddresses')

const deployedContracts = require('../constants/deployedContracts')
console.log('deployedContracts: ', deployedContracts);

import utils from '../utils/address'

const vaultsToBeDeployed = [
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

    async function finalizeUpgradeStrategy(vaultKey) {
        console.log(`===== SETUP ${vaultKey} CONTRACTS =====`);

        const strategy = await SushiMasterChefLPStrategy.at(deployedContracts[vaultKey].STRATEGY_ADDRESS);

        // external setup
        const tokenPairKeys = vaultKey.split('_');
        const token0Address = hecoAddresses[`${tokenPairKeys[0]}_ADDRESS`]
        const token1Address = hecoAddresses[`${tokenPairKeys[1]}_ADDRESS`]
        const sushiAddress = hecoAddresses.SUSHI_ADDRESS

        const isToken0Sushi = utils.isSameAddress(sushiAddress, token0Address);
        const isToken1Sushi = utils.isSameAddress(sushiAddress, token1Address);
        const token0Path = isToken0Sushi ? [] : [sushiAddress, token0Address];
        const token1Path = isToken1Sushi ? [] : [sushiAddress, token1Address];

        // after 12 hours, call this
        await strategy.upgrade({from: governance});

        await strategy.setLiquidationPathsOnUni(
            token0Path,
            token1Path
        );

        await strategy.setLiquidationPathsOnSushi(
            token0Path,
            token1Path
        );

        return {
            STRATEGY_IMPL_ADDRESS: strategyImpl.address,    // implementation
        };
    }

    for (const vaultKey of vaultsToBeDeployed) {
        await finalizeUpgradeStrategy(vaultKey);
    }
}
