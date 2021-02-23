pragma solidity 0.5.16;

import "./CompoundNoFoldStrategy.sol";

contract CompoundNoFoldStrategyDAIMainnet is CompoundNoFoldStrategy {

  // token addresses
  address constant public __underlying = address(0x6B175474E89094C44Da98b954EedeAC495271d0F);
  address constant public __ctoken = address(0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643);
  address constant public __comptroller = address(0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B);
  address constant public __comp = address(0xc00e94Cb662C3520282E6f5717214004A7f26888);
  address constant public __uniswap = address(0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D);

  constructor(
    address _storage,
    address _vault
  )
  CompoundNoFoldStrategy(
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
