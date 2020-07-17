import expectThrow from "./helpers/expectThrow";
import Artifacts from "./helpers/artifacts";

contract("Game", (accounts) => {
  const contracts = new Artifacts(artifacts);
  let Game;
  const host = accounts[1];
  const player = accounts[2];

  before(async () => {
    [Game] = await Promise.all([
      contracts.Game.deployed()
    ]);
  });

  describe("Testing game", function () {
    describe("First game - host delete game", () => {
      it("should be able to create game", async () => {
        await Game.newGame(
          10000000000, 
          8, 
          1, 
          "12048674544441852656868311305490442987772597802062623141864854638649259028048",
          {
            from: host,
            value: 10000000000
          }
        );
      });
      it("should be able to delete game", async () => {
        await Game.deleteGame(
          0,
          {
            from: host
          }
        );
      });
    });

    describe("Second game - incorrect proof, player wins", () => {
      it("should be able to create second game", async () => {
        await Game.newGame(
          10000000000, 
          8, 
          1, 
          "12048674544441852656868311305490442987772597802062623141864854638649259028048",
          {
            from: host,
            value: 10000000000
          }
        );
      });
      it("should be able to start game", async () => {
        await Game.startGame(
          1, 
          {
            from: player,
            value: 10000000000
          }
        );
      });
      it("should be able to guess", async () => {
        await Game.newGuess(
          1, 
          [6,6,6,6,6,1,6,6],
          {
            from: player
          }
        );
      });
      it("should be able to respond guess", async () => {
        await Game.guessResult(
          1,
          0,
          0,
          2,
          [[0,0],[[0,0],[0,0]],[0,0]],
          {
            from: host
          }
        );
      });
      it("should be able to chalenge proof", async () => {
        const playerOldBalance = parseInt(await web3.eth.getBalance(player), 10);
        await Game.chalengeResult(
          1,
          0
        );
        expect(parseInt(await web3.eth.getBalance(player), 10))
          .to.be.equal(playerOldBalance + 2*10000000000);
      });
    });

    describe("Third game - correct proof, host wins", () => {
      it("should be able to create third game", async () => {
        await Game.newGame(
          10000000000, 
          8, 
          1, 
          "12048674544441852656868311305490442987772597802062623141864854638649259028048",
          {
            from: host,
            value: 10000000000
          }
        );
      });
      it("should be able to start game", async () => {
        await Game.startGame(
          2, 
          {
            from: player,
            value: 10000000000
          }
        );
      });
      it("should be able to guess", async () => {
        await Game.newGuess(
          2, 
          [6,6,6,6,6,1,6,6],
          {
            from: player
          }
        );
      });
      it("should be able to respond guess", async () => {
        await Game.guessResult(
          2,
          0,
          0,
          2,
          [
            [
              "1523762195473910772796460277026112400176307333600302242418580748154619991865",
              "20574809095187601102081550710736552913529092356069160420496864063225281781639"
            ],
            [
              [
                "4497314930617460551115474152055470758921537737444915159358720205649202085774",
                "11127370540242013807700937463391408105403475790766140279975172789949998542472"
              ],
              [
                "3382742635010460731429827169301884830036167533824367492333156348235454272326",
                "18829730326575737828283225633544994088541280836054080226833258110299794870135"
              ]
            ],
            [
              "6939541911116578110064094289736072389068135202515259453552187413101919201939",
              "14979615201661839718838997637471331133999484383789780932015050131654278375363"
            ]
          ],
          {
            from: host
          }
        );
      });
      it("should be able to chalenge proof", async () => {
        const playerOldBalance = parseInt(await web3.eth.getBalance(player), 10);
        await Game.chalengeResult(
          2,
          0
        );
        expect(parseInt(await web3.eth.getBalance(player), 10))
          .to.be.equal(playerOldBalance);
      });
      it("should be able to finalize game", async () => {
        const hostOldBalance = parseInt(await web3.eth.getBalance(host), 10);
        await Game.finalizeGame(
          2,
          {
            from: accounts[3]
          }
        );
        expect(parseInt(await web3.eth.getBalance(host), 10))
          .to.be.equal(hostOldBalance + 2*10000000000);
      });
    });
  });
});
