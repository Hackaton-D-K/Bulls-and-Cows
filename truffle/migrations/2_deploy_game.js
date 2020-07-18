const Game = artifacts.require("./bullsAndCows.sol");

module.exports = function(deployer, network, accounts) {
  console.log("deploying to network: " + network);
  
  deployer
    .then(() => {
      return Promise.all([deployer.deploy(Game)]);
    })
    .then(() => {
      console.log(">>>>>>>> contracts deployed by 2_deploy_game:");
      console.log("Game:", Game.address);
      console.log("");
    });
};
