pragma solidity 0.5.16;

// MDEX interfaces
interface IMasterChef {
    function deposit(uint256 _pid, uint256 _amount) external;

    function withdraw(uint256 _pid, uint256 _amount) external;

    function userInfo(uint256 _pid, address _user) external view returns (uint256 amount, uint256 rewardDebt, uint256 multLpRewardDebt);

    function poolInfo(uint256 _pid) external view returns (address lpToken, uint256 allocPoint, uint256 lastRewardBlock, uint256 accMdxPerShare, uint256 accMultLpPerShare, uint256 totalAmount);

    function pending(uint256 _pid, address _user) external view returns (uint256 mdxAmount, uint256 tokenAmount);

    function emergencyWithdraw(uint256 _pid) external;

    function massUpdatePools() external;
}