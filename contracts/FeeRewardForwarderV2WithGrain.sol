pragma solidity 0.5.16;

import "./Governable.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Burnable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

import "./hardworkInterface/IRewardPool.sol";
import "./uniswap/interfaces/IUniswapV2Router02.sol";

contract FeeRewardForwarderWithGrain is Governable {
  using SafeERC20 for IERC20;
  using SafeMath for uint256;

  address public farm;

  // todo
  address constant public husd = address(0x0298c2b32eaE4da002a15f36fdf7615BEa3DA047);
  address constant public usdt = address(0xa71EdC38d189767582C38A3145b5873052c3e47a);
  address constant public sushi = address(0x25D2e80cB6B86881Fd7e07dd263Fb79f4AbE033c);  // MDX
  address constant public wht = address(0x5545153CCFcA01fbd7Dd11C0b23ba694D9509A6F);  // wrapped HT

  mapping (address => mapping (address => address[])) public uniswapRoutes;

  // grain 
  // grain is a burnable ERC20 token that is deployed by Harvest
  // we sell crops to buy back grain and burn it
  address public grain;
  uint256 public grainShareNumerator;
  uint256 public grainShareDenominator;

  // In case we're not buying back grain immediately,
  // we liquidate the crops into the grainBackerToken
  // and send it to an EOA `grainBuybackReserve`
  bool public grainImmediateBuyback;
  address public grainBackerToken;
  address public grainBuybackReserve;
  
  // the targeted reward token to convert everything to
  address public targetToken;
  address public profitSharingPool;
  // todo
  address constant public uniswapRouterV2 = address(0xED7d5F38C79115ca12fe6C0041abb22F0A06C300);

  event TokenPoolSet(address token, address pool);
  // todo
  constructor(address _storage, address _farm, address _grain) public Governable(_storage) {
    require(_grain != address(0), "_grain not defined");
    require(_farm != address(0), "_farm not defined");
    grain = _grain;
    farm = _farm;
    // todo
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
    // To buy back grain, our `targetToken` needs to be FARM
    require(farm == IRewardPool(_pool).rewardToken(), "Rewardpool's token is not FARM");
    profitSharingPool = _pool;
    targetToken = farm;
    emit TokenPoolSet(targetToken, _pool);
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
    uint256 remainingAmount = _amount;
    // Note: targetToken could only be FARM or NULL. 
    // it is only used to check that the rewardPool is set.
    if (targetToken == address(0)) {
      return; // a No-op if target pool is not set yet
    }
    if (_token == farm) {
      // this is already the right token
      // Note: Under current structure, this would be FARM.
      // This would pass on the grain buy back as it would be the special case
      // designed for NotifyHelper calls
      // This is assuming that NO strategy would notify profits in FARM
      IERC20(_token).safeTransferFrom(msg.sender, profitSharingPool, _amount);
      IRewardPool(profitSharingPool).notifyRewardAmount(_amount);
    } else {
      // If grainImmediateBuyback is set to false, then funds to buy back grain needs to be sent to an address

      if (grainShareNumerator != 0 && !grainImmediateBuyback) {
        require(grainBuybackReserve != address(0), "grainBuybackReserve should not be empty");
        uint256 balanceToSend = _amount.mul(grainShareNumerator).div(grainShareDenominator);
        remainingAmount = _amount.sub(balanceToSend);
        // todo
        // If the liquidation path is set, liquidate to grainBackerToken and send it over
        // if not, send the crops immediately
        // this also covers the case when the _token is the grainBackerToken
        if(uniswapRoutes[_token][grainBackerToken].length > 1){
          IERC20(_token).safeTransferFrom(msg.sender, address(this), balanceToSend);
          // todo: only to grain
          liquidate(_token, grainBackerToken, balanceToSend);
          // send the grainBackerToken to the reserve
          IERC20(grainBackerToken).safeTransfer(grainBuybackReserve, IERC20(grainBackerToken).balanceOf(address(this)));
        } else {
          IERC20(_token).safeTransferFrom(msg.sender, grainBuybackReserve, balanceToSend);
        }
      }
      // todo
      // we need to convert _token to FARM
      if (uniswapRoutes[_token][farm].length > 1) {
        IERC20(_token).safeTransferFrom(msg.sender, address(this), remainingAmount);
        uint256 balanceToSwap = IERC20(_token).balanceOf(address(this));
        // todo: only to farm
        liquidate(_token, farm, balanceToSwap);
        // if grain buyback is activated, then sell some FARM to buy and burn grain
        if(grainShareNumerator != 0 && grainImmediateBuyback) {
          uint256 balanceToBuyback = (IERC20(farm).balanceOf(address(this))).mul(grainShareNumerator).div(grainShareDenominator);
          liquidate(farm, grain, balanceToBuyback);

          // burn all the grains in this contract
          ERC20Burnable(grain).burn(IERC20(grain).balanceOf(address(this)));
        }

        // now we can send this token forward
        uint256 convertedRewardAmount = IERC20(farm).balanceOf(address(this));
        IERC20(farm).safeTransfer(profitSharingPool, convertedRewardAmount);
        IRewardPool(profitSharingPool).notifyRewardAmount(convertedRewardAmount);
      } else { 
        // else the route does not exist for this token
        // do not take any fees and revert. 
        // It's better to set the liquidation path then perform it again, 
        // rather then leaving the funds in controller
        revert("FeeRewardForwarder: liquidation path doesn't exist"); 
      }
    }
  }

  function liquidate(address _from, address _to, uint256 balanceToSwap) internal {
    if(balanceToSwap > 0){
      IERC20(_from).safeApprove(uniswapRouterV2, 0);
      IERC20(_from).safeApprove(uniswapRouterV2, balanceToSwap);

      IUniswapV2Router02(uniswapRouterV2).swapExactTokensForTokens(
        balanceToSwap,
        1, // we will accept any amount
        uniswapRoutes[_from][_to],
        address(this),
        block.timestamp
      );
    }
  }

  function setGrainBuybackRatio(uint256 _grainShareNumerator, uint256 _grainShareDenominator) public onlyGovernance {
    require(_grainShareDenominator >= _grainShareNumerator, "numerator cannot be greater than denominator");
    require(_grainShareDenominator != 0, "_grainShareDenominator cannot be 0");
    
    grainShareNumerator = _grainShareNumerator;
    grainShareDenominator = _grainShareDenominator;
  }

  function setGrainConfig(
    uint256 _grainShareNumerator, 
    uint256 _grainShareDenominator, 
    bool _grainImmediateBuyback, 
    address _grainBackerToken,
    address _grainBuybackReserve
  ) external onlyGovernance {
    require(_grainBuybackReserve != address(0), "_grainBuybackReserve is empty");
    // grainBackerToken can be address(0), this way the forwarder will send the crops directly
    // since it cannot find a path.
    // grainShareNumerator can be 0, this means that no grain is being bought back
    setGrainBuybackRatio(_grainShareNumerator, _grainShareDenominator);

    grainImmediateBuyback = _grainImmediateBuyback;
    grainBackerToken = _grainBackerToken;
    grainBuybackReserve = _grainBuybackReserve;
  }

}
