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
              "0x035e6b39138cda379ca476ad4b1dcb31dd627c6449272312169d4a89569e9739", 
              "0x2d7cede4736dc181bb35f3a39aeb7ede2e774dd131258133dccdde7a9ea61f87"
            ],
            [
              [
                // TODO just remove last digit to chit: player can't chalange with invalid opcode error
                "0x1899de587d0a33ce7ad2eeb098349108099020dda2e9d5e676149dbd28a7ae88", 
                "0x09f163da05b1f3c03df33d27a9f76d2b2657a68d629fe7645efd3a3f4c237f8e"
              ],
              [
                "0x29a13feb6e63402c11a64640b90e688de22a7f8a74afad564463a909b1c88f77", 
                "0x077a9081e1363b4b9f95e83e1b9139a4386b65a4488fb45cba2ca00eb316d346"
              ]
            ],
            [
              "0x0f57a43b658c011147df55427d438b1833fec852d22473772362228a21e5ea93", 
              "0x211e296868cb179397ffc2d7e6afe24c4f52f3e07df8681f633ff769f69fe7c3"
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
