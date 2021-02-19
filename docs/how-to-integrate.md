#  Integration guide

## 1. user deposit LP token to vault, will get our fLP token

Contract name: ERC20.sol
```
await _lpToken.approve(_vault.address, _amount, { from: _farmer });
```
Contract name: Vault.sol
```
await _vault.deposit(_amount, { from: _farmer }));
```

## 2. stake his fLp token to stake pool to get FOLDS token rewards

Contract name: RewardToken.sol
```
await _stakeToken.approve(_pool.address, _amount, {from: _farmer});
```
Contract name: NoMintRewardPool.sol
```
await _pool.stake(_amount, {from: _farmer});
```

## 3. **Governance** do hard work for vault to invest and get reward (frontend do not need to integrate)

Contract name: Controller.sol
```
await controller.doHardWork(_vault.address, {from: governance});
```

## 4. user check earned FOLDS token

Contract name: NoMintRewardPool.sol
```
await _pool.earned(address);
```

## 5. exit from vault

Contract name: NoMintRewardPool.sol
```
await _pool.exit({from: _farmer});
```
Contract name: Vault.sol
```
await _vault.withdraw(await _vault.balanceOf(_farmer), {from: _farmer}));
```
