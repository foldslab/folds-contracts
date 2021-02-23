const Migrations = artifacts.require("Util/Migrations");

module.exports = function(deployer, network, accounts) {
  if (network === 'development') return;

  deployer.deploy(Migrations);
};