pragma solidity 0.5.16;

import "./Governable.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract FeeRewardForwarder is Governable {
  using SafeERC20 for IERC20;

  address public profitSharingPool;

  event ProfitSharingPoolSet(address pool);

  constructor(address _storage) public Governable(_storage) {
  }

  /*
  *   Set the pool that will receive the reward token
  *   based on the address of the reward Token
  */
  function setProfitSharingPool(address _pool) public onlyGovernance {
    profitSharingPool = _pool;
    emit ProfitSharingPoolSet(_pool);
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