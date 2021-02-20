const TOKENS = {
    HUSD_ADDRESS: '0x0298c2b32eaE4da002a15f36fdf7615BEa3DA047',
    USDT_ADDRESS: '0xa71EdC38d189767582C38A3145b5873052c3e47a',
    HBTC_ADDRESS: '0x66a79d23e58475d2738179ca52cd0b41d73f0bea',
    ETH_ADDRESS: '0x64ff637fb478863b7468bc97d30a5bf3a428a1fd',
    HLTC_ADDRESS: '0xecb56cf772b5c9a6907fb7d32387da2fcbfb63b4',
    HBCH_ADDRESS: '0xef3cebd77e0c52cb6f60875d9306397b5caca375',
    HDOT_ADDRESS: '0xa2c49cee16a5e5bdefde931107dc1fae9f7773e3',
    HFIL_ADDRESS: '0xae3a768f9ab104c69a7cd6041fe16ffa235d1810',
    WHT_ADDRESS: '0x5545153ccfca01fbd7dd11c0b23ba694d9509a6f',
    MDX_ADDRESS: '0x25D2e80cB6B86881Fd7e07dd263Fb79f4AbE033c',
    HPT_ADDRESS: '0xe499ef4616993730ced0f31fa2703b92b50bb536',
    FILDA_ADDRESS: '0xe36ffd17b2661eb57144ceaef942d95295e637f0',
    LHB_ADDRESS: '0x8f67854497218043e1f72908ffe38d0ed7f24721',
    AAVE_ADDRESS: '0x202b4936fe1a82a4965220860ae46d7d3939bb25',
    SNX_ADDRESS: '0x777850281719d5a96c29812ab72f822e0e09f3da',
    UNI_ADDRESS: '0x22c54ce8321a4015740ee1109d9cbc25815c46e6',
    LINK_ADDRESS: '0x9e004545c59d359f6b7bfb06a26390b087717b42',
    BAL_ADDRESS: '0x045de15ca76e76426e8fc7cba8392a3138078d0f',
    YFI_ADDRESS: '0xb4f019beac758abbee2f906033aaa2f0f6dacb35',
}
module.exports = {
    ...TOKENS,
    SUSHI_ADDRESS: TOKENS.MDX_ADDRESS,    // MDX
    SUSHISWAP_MASTER_CHEF: '0xFB03e11D93632D97a8981158A632Dd5986F5E909',    // HecoPool
    UNISWAP_V2_ROUTER02_ADDRESS: '0xED7d5F38C79115ca12fe6C0041abb22F0A06C300',
    POOLS: {
        HBTC_USDT: {
            LP_ADDRESS: '0xfbe7b74623e4be82279027a286fa3a5b5280f77c',
            POOL_ID: 8,
        },
        ETH_USDT: {
            LP_ADDRESS: '0x78c90d3f8a64474982417cdb490e840c01e516d4',
            POOL_ID: 9,
        },
        HUSD_USDT: {
            LP_ADDRESS: '0xdff86B408284dff30A7CAD7688fEdB465734501C',
            POOL_ID: 10,
        },
        HLTC_USDT: {
            LP_ADDRESS: '0x060b4bfce16d15a943ec83c56c87940613e162eb',
            POOL_ID: 11,
        },
        HBCH_USDT: {
            LP_ADDRESS: '0x1f0ec8e0096e145f2bf2cb4950ed7b52d1cbd35f',
            POOL_ID: 12,
        },
        HDOT_USDT: {
            LP_ADDRESS: '0x5484ab0df3e51187f83f7f6b1a13f7a7ee98c368',
            POOL_ID: 13,
        },
        HFIL_USDT: {
            LP_ADDRESS: '0x600072af0470d9ed1d83885d03d17368943ff22a',
            POOL_ID: 14,
        },
        WHT_HUSD: {
            LP_ADDRESS: '0x3375aff2cacf683b8fc34807b9443eb32e7afff6',
            POOL_ID: 15,
        },
        MDX_USDT: {
            LP_ADDRESS: '0x615e6285c5944540fd8bd921c9c8c56739fd1e13',   // https://info.mdex.com/#/pair/0x615e6285c5944540fd8bd921c9c8c56739fd1e13
            POOL_ID: 16,    // https://hpool.mdex.com/#/menu/pool/16,
        },
        WHT_USDT: {
            LP_ADDRESS: '0x499b6e03749b4baf95f9e70eed5355b138ea6c31',
            POOL_ID: 17,
        },
        HPT_USDT: {
            LP_ADDRESS: '0xde5b574925ee475c41b99a7591ec43e92dcd2fc1',
            POOL_ID: 18,
        },
        MDX_WHT: {
            LP_ADDRESS: '0x6dd2993b50b365c707718b0807fc4e344c072ec2',
            POOL_ID: 19,
        },
        FILDA_HUSD: {
            LP_ADDRESS: '0x7964e55bbdaecde48c2c8ef86e433ed47fecb519',
            POOL_ID: 21,
        },
        LHB_USDT: {
            LP_ADDRESS: '0x023f375a51af8645d7446ba5942baedc53b0582d',
            POOL_ID: 22,
        },
        AAVE_USDT: {
            LP_ADDRESS: '0xfafeaafefc5f92f22415506e78d9ab1e33c03257',
            POOL_ID: 23,
        },
        SNX_USDT: {
            LP_ADDRESS: '0xc7a4c808a29fc8cd3a8a6848f7f18bed9924c692',
            POOL_ID: 24,
        },
        UNI_USDT: {
            LP_ADDRESS: '0x84455d880af684eb29997b82832dd71ef29c1354',
            POOL_ID: 25,
        },
        LINK_USDT: {
            LP_ADDRESS: '0x52a342015baa2496a90a9bb6069d7692564132e6',
            POOL_ID: 26,
        },
        BAL_USDT: {
            LP_ADDRESS: '0xb6a77cdd31771a4f439622aa36b20cb53c19868c',
            POOL_ID: 27,
        },
        YFI_USDT: {
            LP_ADDRESS: '0x64af3564c6d6bec5883358c560211ecd0f8d1ac7',
            POOL_ID: 28,
        },
        HBTC_WHT: {
            LP_ADDRESS: '0xbfff969a85e355ee0851b019dba1e87c7780f40d',
            POOL_ID: 29,
        },
        ETH_WHT: {
            LP_ADDRESS: '0x53e458ad1cfeb9582736db6bde9af89948e3bc3d',
            POOL_ID: 30,
        },
        HBTC_ETH: {
            LP_ADDRESS: '0x793c2a814e23ee38ab46412be65e94fe47d4b397',
            POOL_ID: 31,
        },
        HBTC_MDX: {
            LP_ADDRESS: '0x2fb4be0f2785bd6009a383f3290cc97a4e3bd46b',
            POOL_ID: 32,
        },
        ETH_MDX: {
            LP_ADDRESS: '0xb55569893b397324c0d048c9709f40c23445540e',
            POOL_ID: 33,
        },
    }
};
