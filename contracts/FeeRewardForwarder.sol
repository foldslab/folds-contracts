pragma solidity 0.5.16;

import "./Governable.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./hardworkInterface/IRewardPool.sol";
import "./uniswap/interfaces/IUniswapV2Router02.sol";

contract FeeRewardForwarder is Governable {
  using SafeERC20 for IERC20;
  // todo
  address constant public husd = address(0x0298c2b32eaE4da002a15f36fdf7615BEa3DA047);
  address constant public usdt = address(0xa71EdC38d189767582C38A3145b5873052c3e47a);
  address constant public sushi = address(0x25D2e80cB6B86881Fd7e07dd263Fb79f4AbE033c);  // MDX
  address constant public wht = address(0x5545153CCFcA01fbd7Dd11C0b23ba694D9509A6F);  // wrapped HT

  mapping (address => mapping (address => address[])) public uniswapRoutes;

  // the targeted reward token to convert everything to
  address public targetToken;
  address public profitSharingPool;

  address public uniswapRouterV2;

  event TokenPoolSet(address token, address pool);

  constructor(address _storage, address _uniswapRouterV2) public Governable(_storage) {
    require(_uniswapRouterV2 != address(0), "uniswapRouterV2 not defined");
    uniswapRouterV2 = _uniswapRouterV2;
    // these are for mainnet, but they won't impact Ropsten
    uniswapRoutes[husd][usdt] = [husd, usdt];
    uniswapRoutes[usdt][husd] = [usdt, husd];

    uniswapRoutes[sushi][usdt] = [sushi, usdt];
    uniswapRoutes[sushi][husd] = [sushi, wht, husd];
  }

  /*
  *   Set the pool that will receive the reward token
  *   based on the address of the reward Token
  */
  function setTokenPool(address _pool) public onlyGovernance {
    targetToken = IRewardPool(_pool).rewardToken();
    profitSharingPool = _pool;
    emit TokenPoolSet(targetToken, _pool);
  }

  function setProfitSharingPool(address _pool) public onlyGovernance {
    profitSharingPool = _pool;
  }

  /**
  * Sets the path for swapping tokens to the to address
  * The to address is not validated to match the targetToken,
  * so that we could first update the paths, and then,
  * set the new target
  */
  function setConversionPath(address from, address to, address[] memory _uniswapRoute)
  public onlyGovernance {
    require(from == _uniswapRoute[0],
      "The first token of the Uniswap route must be the from token");
    require(to == _uniswapRoute[_uniswapRoute.length - 1],
      "The last token of the Uniswap route must be the to token");
    uniswapRoutes[from][to] = _uniswapRoute;
  }

  // Transfers the funds from the msg.sender to the pool
  // under normal circumstances, msg.sender is the strategy
  function poolNotifyFixedTarget(address _token, uint256 _amount) external {
    if (_amount == 0) {
      return;
    }
    // this is already the right token
    IERC20(_token).safeTransferFrom(msg.sender, profitSharingPool, _amount);
  }
}