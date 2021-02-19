// This test is only invoked if MAINNET_E2E is set
if ( process.env.MAINNET_E2E ) {
  // todo: load contracts from json 
  
  // configurations and test helpers
  const hecoAddresses = require("../constants/hecoAddresses.js");
  const deployedContracts = require("../constants/deployedContracts.js");
  const {assertBNGt, advanceNBlock, gasLog, printGasLog} = require("../Utils.js");
  const makeVault = require("../make-vault.js");
  const { expectRevert, send, time } = require('@openzeppelin/test-helpers');
  const BigNumber = require('bignumber.js');

  // General interface
  const IERC20 = artifacts.require("IERC20");

  // Core Protocol
  const Controller = artifacts.require("Controller");
  const Vault = artifacts.require("Vault");
  const Storage = artifacts.require("Storage");
  const FeeRewardForwarder = artifacts.require("FeeRewardForwarder");

  // UX improver
  const DepositHelper = artifacts.require("DepositHelper");

  // Strategies
  // MDEX(sushi) strategy
  const SushiMasterChefLPStrategy = artifacts.require("SushiMasterChefLPStrategy");
  const StrategyProxy = artifacts.require("StrategyProxy");
  const IMasterChef = artifacts.require("IMasterChef");
  // SNX strategy
  const SNXRewardStrategy = artifacts.require("SNXRewardStrategy");
  const SNXRewardInterface = artifacts.require("SNXRewardInterface");
  // CRV strategy
  const CRVStrategyStable = artifacts.require("CRVStrategyStableMainnet");
  const CRVStrategyYCRV = artifacts.require("CRVStrategyYCRVMainnet");
  const PriceConvertor = artifacts.require("PriceConvertor");

  // Emission related
  const RewardToken = artifacts.require("RewardToken");
  const NoMintRewardPool = artifacts.require("NoMintRewardPool");
  const DelayMinter = artifacts.require("DelayMinter");
  const HardRewards = artifacts.require("HardRewards");


  BigNumber.config({DECIMAL_PLACES: 0});

  contract("Mainnet End-to-end test for heco", function(accounts){
    describe("basic settings", function (){

      // external contracts
      let dai;

      // external setup
      // todo: only need lp
      let mdxBusdUsdtLPWhale = hecoAddresses.MDX_BUSD_USDT_WHALE_ADDRESS;
      let existingRoute;

      // parties in the protocol
      let governance = accounts[1];
      let farmer1 = accounts[3];
      let farmer2 = accounts[4];
      let farmer3 = accounts[5];
      let farmer4 = accounts[6];
      let farmer5 = accounts[7];

      let team = accounts[8];
      let operator = accounts[9];

      // numbers used in tests
      const mdxBusdUsdtLPBalance18 = "1500000" + "000000000000000000";
      const farmerBalance18 = "3000" + "000000000000000000";
      const farmerBalance6 = "3000" + "000000";
      const rewardDuration = 7 * 86400; // 7 days
      const delayDuration = 86400; // 1 day
      let hardworkReward = "1000";

      // only used for ether distribution
      let etherGiver = accounts[9];

      // Core protocol contracts
      let storage;
      let controller;
      let feeRewardForwarder;

      let mdxBusdUsdtLPVault;
      let mdxBusdUsdtLPStrategy;

      // emission related
      let farm;
      let delayMinter;
      let hardRewards;

      // profit sharing related
      let daiProfitPool;

      /*
          System setup helper functions
          the full system setup can be traced by reading the "beforeEach()" code
      */

      async function resetBalance(underlying, whale, farmer, balance) {
        // Give whale some ether to make sure the following actions are good
        await send.ether(etherGiver, whale, "500000000000000000");

        // reset token balance
        await underlying.transfer(whale, await underlying.balanceOf(farmer), {
          from: farmer,
        });
        await underlying.transfer(farmer, balance, { from: whale });
        assert.equal(balance, await underlying.balanceOf(farmer));
      }

      async function setupMdxBusdUsdtLPVault() {
        // external setup
        const underlying = mdxBusdUsdtLP;
        const tokenLiquidationPaths = [
            [hecoAddresses.SUSHI_ADDRESS, hecoAddresses.HUSD_ADDRESS],
            [hecoAddresses.SUSHI_ADDRESS, hecoAddresses.USDT_ADDRESS]
        ];
        const poolID = hecoAddresses.SUSHISWAP_HUSD_USDT_POOL_ID;
        const cropToken = await IERC20.at(hecoAddresses.SUSHI_ADDRESS);
        const cropPool = await IMasterChef.at(hecoAddresses.SUSHISWAP_MASTER_CHEF);
        const token0Path = tokenLiquidationPaths[0]; // [hecoAddresses.SUSHI_ADDRESS, hecoAddresses.HUSD_ADDRESS];
        const token1Path = tokenLiquidationPaths[1]; // [hecoAddresses.SUSHI_ADDRESS, hecoAddresses.USDT_ADDRESS];

        console.log('underlying poolID cropToken cropPool: ', underlying, poolID, cropToken, cropPool);

        // set up the vault with 100% investment
        const vault = await makeVault(storage.address, underlying.address, 100, 100, {from: governance});
        mdxBusdUsdtLPVault = vault;

        const strategy = await SushiMasterChefLPStrategy.at(deployedContracts.SUSHI_STRATEGY_ADDRESS);
        // const strategy = await SushiMasterChefLPStrategy.at(deployedContracts.SUSHI_STRATEGY_PROXY_ADDRESS);

        console.log('**** strategy: ', strategy.address);

        await strategy.initializeStrategy(
          storage.address,
          underlying.address,
          vault.address,
          cropPool.address,
          cropToken.address,
          poolID,
          { from: governance }
        );

        await strategy.setLiquidationPathsOnUni(
          token0Path,
          token1Path,
          {from: governance}
        );

        await strategy.setLiquidationPathsOnSushi(
          token0Path,
          token1Path,
          {from: governance}
        );

        await strategy.setUseUni(
          false,
          {from: governance}
        );

        // link vault with strategy
        await controller.addVaultAndStrategy(vault.address, strategy.address, {from: governance});
      }


      async function setupRewardPools() {
        mdxBusdUsdtLPRewardPool = await NoMintRewardPool.at(deployedContracts.REWARD_POOL);
        console.log('**** mdxBusdUsdtLPRewardPool: ', mdxBusdUsdtLPRewardPool.address);
      }

      async function setupDelayMinter() {
        // todo: use address from json
        delayMinter = await DelayMinter.at(/* to be deployed */);
        console.log('**** delayMinter: ', delayMinter.address);

        // authorize the delayMinter to mint
        await farm.addMinter(delayMinter.address, {
          from: governance,
        });
      }

      async function setupHardRewards() {
        // todo: use address from json
        hardRewards = await HardRewards.at(/* to be deployed */);
        await hardRewards.addVault(mdxBusdUsdtLP.address, {from: governance});

        await controller.setHardRewards(hardRewards.address, {from: governance});
      }

      async function setupExternalContracts() {
        mdxBusdUsdtLP = await IERC20.at(hecoAddresses.SUSHISWAP_HUSD_USDT_LP_ADDRESS);
        dai = await IERC20.at(hecoAddresses.DAI_ADDRESS);
      }

      async function setupCoreProtocol() {
        // deploy storage
        // todo: use address from json
        storage = await Storage.at(deployedContracts.STORAGE);

        // todo: use address from json
        feeRewardForwarder = await FeeRewardForwarder.at(deployedContracts.FEE_REWARD_FORWARDER);
        // set up controller
        // todo: use address from json
        controller = await Controller.at(deployedContracts.CONTROLLER);

        await storage.setController(controller.address, { from: governance });
      }

      async function setupVaultsAndStrategies() {
        await setupMdxBusdUsdtLPVault();
      }

      async function setupIncentives() {
        // todo: use address from json
        farm = await RewardToken.at(deployedContracts.REWARD_TOKEN);

        await setupRewardPools();
        // await setupDelayMinter();
        // await setupHardRewards();
      }

      /*
        Note:
          Currently Dai/USDT/USDC that uses the internal yCRV vault would contribute to the DAI profit pool
          Other vaults would harvest whatever the underlying token is and contribute to that speicifc pool
          (e.g. yCRV vault would contribute to yCRV)

          We are changing this later so that all rewards are converted into one.
      */

      // todo: do we need this???
      async function setupProfitSharing() {
        // Dai, USDC, and yCRV Vaults all use Dai to share profit
        // todo: use address from json
        daiProfitPool = await NoMintRewardPool.at(deployedContracts.REWARD_POOL);

        await feeRewardForwarder.setConversionPath(
          ycrv.address,
          dai.address,
          [hecoAddresses.YCRV_ADDRESS, hecoAddresses.WETH_ADDRESS, hecoAddresses.DAI_ADDRESS],
          {from: governance}
        );

        // Let the feeRewardForwarder know that we are sharing all our profit in this
        // Dai profit pool
        await feeRewardForwarder.setTokenPool(daiProfitPool.address, { from: governance });
      }

      async function distributeBalance() {
        // mdx lp to farmer 1 and farmer 2
        await resetBalance(mdxBusdUsdtLP, mdxBusdUsdtLPWhale, farmer1, farmerBalance18);
        await resetBalance(mdxBusdUsdtLP, mdxBusdUsdtLPWhale, farmer2, farmerBalance18);
      }

      async function renouncePower() {
        await farm.renounceMinter({from: governance});
      }

      // Setting up the whole system
      beforeEach(async function () {
        await setupExternalContracts();
        await setupCoreProtocol();
        await setupVaultsAndStrategies();
        await setupIncentives();
        // todo
        // await setupProfitSharing();
        await distributeBalance();
        // await renouncePower();
      });

      /*
        Now, the whole system should have been properly set up.
        Also, priviledge to minting renounced by the governance.
        Minting has to go through the delay minter from now on

        The functions below are all used "AFTER" the system has finished setup
      */

      /*
        Note:
          Currently loading Hardrewards requires that the money is minted to some address first,
          then have that address approve, then have hardreward load from that specific address.
          this would typically be the governance for now.

          We could consider implement a notifier as in the reward pools, this way, the funds would
          not need to go through governance and the announcement of delayMinter would be more clear
          as we would be able to announceMint to the hardReward.
      */

      async function passDelayMintTime(){
        // time passes
        await time.advanceBlock();
        await time.increase(2 * delayDuration);
        await time.advanceBlock();
      }

      async function loadHardReward() {
        // mint some token to governance so that it can be transferred to hardRewards
        let delayId = await delayMinter.nextId();
        await delayMinter.announceMint(governance, 100 * hardworkReward, { from: governance });
        await passDelayMintTime();
        await delayMinter.executeMint(delayId, { from: governance });

        // Delay minter will mint 70% to the target, 10% to the operator, 20% to the team
        await farm.approve(hardRewards.address, 70 * hardworkReward, {
          from: governance,
        });

        await hardRewards.load(farm.address, hardworkReward, 70 * hardworkReward, {
          from: governance,
        });
      }

      // Farmer's perspective
      async function printBalance( msg, _token, _account){
        console.log(msg, " : " , (await _token.balanceOf(_account)).toString());
      }

      async function depositVault(_farmer, _underlying, _vault, _amount) {
        await _underlying.approve(_vault.address, _amount, { from: _farmer });
        await gasLog("Vault Deposit(" + await _vault.symbol() + ")", _vault.deposit(_amount, { from: _farmer }));
      }

      async function _stakePool(_farmer, _stakeToken, _pool, _amount) {
        await _stakeToken.approve(_pool.address, _amount, {from: _farmer});
        await gasLog("PoolStake:", _pool.stake(_amount, {from: _farmer}));
      }

      async function stakeRewardPool(_farmer, _vault, _pool, _amount) {
        await _stakePool(_farmer, _vault, _pool, _amount);
      }

      async function stakeProfitPool(_farmer, _pool) {
        // although we can simplify to just use `farm` for `_farm`, for uniformity, we require that to be passed in
        printBalance("stakeProfitPool", farm, _farmer);
        await _stakePool(_farmer, farm, _pool, await farm.balanceOf(_farmer));
      }

      async function withdrawVault(_farmer, _vault, _pool, _amount) {
        // get back vault token and claim reward
        await _pool.withdraw(_amount, {from: _farmer});
        await gasLog("Vault Small Withdraw(" + await _vault.symbol() + ")", _vault.withdraw( _amount, {from: _farmer}));
      }

      async function exitVault(_farmer, _vault, _pool) {
        // get back vault token and claim reward
        await _pool.exit({from: _farmer});
        await gasLog("Vault Withdraw(" + await _vault.symbol() + ")", _vault.withdraw( await _vault.balanceOf(_farmer), {from: _farmer}));
      }

      // Governance's perspective

      async function mintFarmToPoolAndNotify(_pool, _amount) {
        let _amountToMint = _amount / 7 * 10;  // delay minter always mints 70% to the target
        let delayId = await delayMinter.nextId();
        await delayMinter.announceMint(_pool.address, _amountToMint, { from: governance });
        await passDelayMintTime();
        await delayMinter.executeMint(delayId, { from: governance });

        await _pool.notifyRewardAmount(_amount, {
          from: governance,
        });
      }

      async function doHardWorkOnAllVaults(n){
        // Note: For this end to end test, printing is intentional,
        // otherwise the test takes too long and would be hard to track the progress
        console.log("doHardWorkOnAllVaults: ", n, "hrs");
        for (let i = 0; i < n; i++) {
          let blocksPerHour = 240 * 3;
          await advanceNBlock(blocksPerHour);

          await gasLog("Vault doHardWork(" + await mdxBusdUsdtLPVault.symbol() + ")", controller.doHardWork(mdxBusdUsdtLPVault.address, {from: governance}));
        }
      }

      /*

      What is happiness?
      Happiness is:
        * The whole system connects and functions properly for all party
        * farmers are able to stake, withdraw, and earn interest on this system.
        * Profit sharing pool actually getting profit and distributes to stakers
        * farmers make money
        * Hard workers get reward for doing hard work

      */

      it("Happy Path", async function () {
        await loadHardReward();

        await depositVault(farmer1, mdxBusdUsdtLP, mdxBusdUsdtLPVault, farmerBalance18);
        await stakeRewardPool(farmer1, mdxBusdUsdtLPVault, mdxBusdUsdtLPRewardPool, farmerBalance18);

        let beforeHardWork = await farm.balanceOf(governance);
        await doHardWorkOnAllVaults(1);

        assertBNGt(await farm.balanceOf(governance), beforeHardWork);

        await exitVault(farmer1, mdxBusdUsdtLPVault, mdxBusdUsdtLPRewardPool);

        // Farmer1 made money -- note that the reward pool is not activated yet
        assertBNGt(await mdxBusdUsdtLP.balanceOf(farmer1), farmerBalance18);
        assert.equal(await farm.balanceOf(farmer1), 0);

        // Basic case complete
        // now everyone invests into the vaults
        // mdxBusdUsdtLP to farmer 1 and farmer 2
        // YCRV to farmer 1 and farmer 2
        // DAI to farmer 2 and farmer 3
        // USDC to farmer 4 and farmer 5
        await depositVault(farmer1, mdxBusdUsdtLP, mdxBusdUsdtLPVault, farmerBalance18);
        await stakeRewardPool(farmer1, mdxBusdUsdtLPVault, mdxBusdUsdtLPRewardPool, farmerBalance18);

        // let's start all the reward pools
        await mintFarmToPoolAndNotify(mdxBusdUsdtLPRewardPool, 700000000);

        await doHardWorkOnAllVaults(1);

        await depositVault(farmer2, mdxBusdUsdtLP, mdxBusdUsdtLPVault, farmerBalance18);
        await stakeRewardPool(farmer2, mdxBusdUsdtLPVault, mdxBusdUsdtLPRewardPool, await mdxBusdUsdtLPVault.balanceOf(farmer2));

        // Everyone staked. Let's get the time passing and do some hard work
        await doHardWorkOnAllVaults(6);

        // Let's get some rewards and stake to the profit sharing pool
        await mdxBusdUsdtLPRewardPool.getReward({from: farmer1});
        await mdxBusdUsdtLPRewardPool.getReward({from: farmer2});

        // mdxBusdUsdtLP vault yields mdxBusdUsdtLP profit pool
        // dai & usdc vault yields dai profit pool
        // await stakeProfitPool(farmer1, daiProfitPool);
        // await stakeProfitPool(farmer2, daiProfitPool);

        // pass some time!
        await doHardWorkOnAllVaults(12);

        // withdraw a little bit
        await withdrawVault(farmer1, mdxBusdUsdtLPVault, mdxBusdUsdtLPRewardPool, "1");

        // await daiProfitPool.exit({from:farmer1});
        // await daiProfitPool.exit({from:farmer2});

        await exitVault(farmer1, mdxBusdUsdtLPVault, mdxBusdUsdtLPRewardPool);
        await exitVault(farmer2, mdxBusdUsdtLPVault, mdxBusdUsdtLPRewardPool);

        // Made money just from vault
        assertBNGt(await mdxBusdUsdtLP.balanceOf(farmer1), farmerBalance18);
        assertBNGt(await mdxBusdUsdtLP.balanceOf(farmer2), farmerBalance18);

        // Made money from profit sharing
        // await printBalance("dai farmer1", dai, farmer1);
        // await printBalance("dai farmer2", dai, farmer2);

        // assertBNGt(await dai.balanceOf(farmer1), 0);
        // assertBNGt(await dai.balanceOf(farmer2), 0);

        // earned reward token from reward pools
        await printBalance("farm farmer1", farm, farmer1);
        await printBalance("farm farmer2", farm, farmer2);

        assertBNGt(await farm.balanceOf(farmer1), 0);
        assertBNGt(await farm.balanceOf(farmer2), 0);

        await printGasLog();
      });

    });
  });
}
