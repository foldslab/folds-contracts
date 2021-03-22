# Folds Finance

Folds are custom yield farming strategies that enable users to earn from multiple incentive mechanisms simultaneously.

What Folds does is simple,  is to help investors find the most profitable Defi protocol to invest, and then return the profits back.

Investors use the investment strategies provided by Folds to get the best returns in the market, and all investors need to do is to hand over the token to us, and we are responsible for helping investors make money!

Folds to the universe!

Website: https://folds.finance/

Twitter: https://twitter.com/FoldsFinance

Telegram: https://t.me/joinchat/Y1tguR2CsYs3MTY1

## Contract addresses(Heco)

| Vault             | Receipt     | Underlying  | Vault Contract Address                     | Underlying Address                         | Strategy Address                           |
|:------------------|:------------|:------------|:-------------------------------------------|:-------------------------------------------|:-------------------------------------------|
| HUSD-USDT         | fdHMDX      | HMDX        | 0x300eB803BDFEa0A50ff0Ad1915510E1d1fe1D666 | 0xdff86b408284dff30a7cad7688fedb465734501c | 0x4a74800C503678f655Be60af28778aCDECF90a5d |
| HBTC-USDT         | fdHMDX      | HMDX        | 0x8c14932801d3570CAcb456ce58a91c93999FD637 | 0xfbe7b74623e4be82279027a286fa3a5b5280f77c | 0xaC385B049Ee675A0CFA1A73072B6630f5B7eCFa9 |
| ETH-USDT          | fdHMDX      | HMDX        | 0x4DA2C2eeF95085754Ca396778e0d69F21Ce79466 | 0x78c90d3f8a64474982417cdb490e840c01e516d4 | 0xD0373B13444C425a6208d147F9D7E8ea621E582D |
| MDX-USDT          | fdHMDX      | HMDX        | 0xEa5fB3519a96bEf353D3c6505054C4EcbEEb8ed7 | 0x615e6285c5944540fd8bd921c9c8c56739fd1e13 | 0xd73E2BCaf1Bd5759C1f412a35a5Fb1bD98a2d053 |
| MDX-WHT           | fdHMDX      | HMDX        | 0xeeD22B839a99c9A74ECbC13B91Fb8a5C89d318af | 0x6dd2993b50b365c707718b0807fc4e344c072ec2 | 0xDfaBA9036aDc9ffA5A0e5452D590ED5618A7F8F5 |
| WHT-ETH           | fdHMDX      | HMDX        | 0x155D633DA0ABEe490828787686E37a3432Dc3D80 | 0x53e458ad1cfeb9582736db6bde9af89948e3bc3d | 0xbDF728A7c2A7a819EaA91c82DCdA17970F5f7C98 |
| WHT-USDT          | fdHMDX      | HMDX        | 0xbc6040A290c1a340BDDBA1020CbADEB0de53A61A | 0x499b6e03749b4baf95f9e70eed5355b138ea6c31 | 0xAf93016432E3f753391421552be8E3755e9DF8eC |
| WHT-HUSD          | fdHMDX      | HMDX        | 0xDe9DdCa06659e890f1BDCDCCE422Aa2725954e36 | 0x3375aff2cacf683b8fc34807b9443eb32e7afff6 | 0xc45bF0621270d39Ff354a6291268379082Ad4e2f |
| HLTC-USDT         | fdHMDX      | HMDX        | 0x1815568518Eb5F75D289eAA3c7B8e77E75288928 | 0x060b4bfce16d15a943ec83c56c87940613e162eb | 0x680Cd668F3C1b7432EDd25fFEDF1a3EDe2bDc63C |
| HDOT-USDT         | fdHMDX      | HMDX        | 0x0DEe1855E53A31A82c3AB66a723c16b600e24647 | 0x5484ab0df3e51187f83f7f6b1a13f7a7ee98c368 | 0xBbcB5FE9A23039b9362294Be0c54594A616DC54c |
| HBCH-USDT         | fdHMDX      | HMDX        | 0x6Daf5eB2b4BCa84014a5059C507C244f99d89296 | 0x1f0ec8e0096e145f2bf2cb4950ed7b52d1cbd35f | 0x2BEbAE15C4429309b6EB7828FdD1d139cE732744 |
| HUSD              | fdHUSD      | HUSD        | 0x44bfb4DF41BA59b29F5B08F8c5045F1A8325F7AD | 0x0298c2b32eaE4da002a15f36fdf7615BEa3DA047 | 0xA3a9c9C0317B0dE642C3C0C9A12e9ee5F51106a0 |
| USDT              | fdUSDT      | USDT        | 0x348199e800FFA5e6a57344A6Da27BB9E9aeADcD0 | 0xa71EdC38d189767582C38A3145b5873052c3e47a | 0x2b7D8fb2c237DCF47c89187717a3eb24121A5A3D |


## Deploy

0. Install packages

```bash
npm install
```

1. Copy setting file

```bash
cp secret.json.example secret.json
```

2. Add priviate key

Replace `xxx` in secret.json with private key, it's the deployment + governance address

3. Deploy

```bash
yarn deploy:heco
```
