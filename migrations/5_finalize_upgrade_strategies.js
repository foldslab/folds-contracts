const fs = require('fs');

const SushiMasterChefLPStrategy = artifacts.require("SushiMasterChefLPStrategy");
const StrategyProxy = artifacts.require("StrategyProxy");

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

    async function finalizeUpgradeStrategy(vaultKey) {
        console.log(`===== SETUP ${vaultKey} CONTRACTS =====`);
        const strategyAddress = deployedContracts[vaultKey].STRATEGY_ADDRESS;
        const strategyImplAddress = deployedContracts[vaultKey].STRATEGY_IMPL_ADDRESS;

        const strategy = await SushiMasterChefLPStrategy.at(strategyAddress);
        const strategyProxy = await StrategyProxy.at(strategyAddress);

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
        await strategyProxy.upgrade();

        await strategy.setLiquidationPathsOnUni(
            token0Path,
            token1Path
        );

        await strategy.setLiquidationPathsOnSushi(
            token0Path,
            token1Path
        );

        const strategyImplAddressNew = await strategyProxy.implementation();
        console.log('strategyImplAddress, strategyImplAddressNew', strategyImplAddress, strategyImplAddressNew)
        return {
            STRATEGY_IMPL_ADDRESS: strategyImplAddressNew,    // implementation
        };
    }

    for (const vaultKey of vaultKeys) {
        await finalizeUpgradeStrategy(vaultKey);
    }
}

