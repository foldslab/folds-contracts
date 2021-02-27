pragma solidity 0.5.16;

import "./WETHCreamNoFoldStrategy.sol";

contract CreamNoFoldStrategyWETHMainnet is WETHCreamNoFoldStrategy {

  // todo: token addresses
  address constant public __underlying = address(0x5545153CCFcA01fbd7Dd11C0b23ba694D9509A6F);
  address constant public __ctoken = address(0xD06527D5e56A3495252A528C4987003b712860eE);
  address constant public __comptroller = address(0x3d5BC3c8d13dcB8bF317092d84783c2697AE9258);
  address constant public __comp = address(0x2ba592F78dB6436527729929AAf6c908497cB200);
  address constant public __uniswap = address(0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D);

  constructor(
    address _storage,
    address _vault
  )
  WETHCreamNoFoldStrategy(
    _storage,
    __underlying,
    __ctoken,
    _vault,
    __comptroller,
    __comp,
    __uniswap
  )
  public {
  }

}
