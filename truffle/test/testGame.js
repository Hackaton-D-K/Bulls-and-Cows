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
      it("should be able to get guess", async () => {
        let result = await Game.getGuess(1, 0);
        expect(result[0][0]).to.be.equal('6');
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
              "0x1895650c11368fef26a7e969f15be3fd6dfad6d6f103352562997877cc364d74", 
              "0x0db6d6adad28fd48512eb6428447296d05b54a87efdd0bddbc8aaa0d7149e3e8"
            ],
            [
              [
                // TODO just remove last digit to chit: player can't chalange with invalid opcode error
                "0x07d749369a64dcc880280a33f059bdcbff535b42d1a3ca767fc29570cc92ef3f", 
                "0x2a81ae871c34b4ec66d4b2b22092ae00f18b7a281fefd0c7667d1368df0d55e0"
              ],
              [
                "0x22ad77a8bce0c2b013ee0ab301b2b06958302fcb0b37ee59cc1d508553a10b47", 
                "0x0619a1044ad70e18fb0cbc2351e02cd962c3b9f85766c62bf973ce8d539f8629"
              ]
            ],
            [
              "0x0ffdbd2cee7d606a33f3ea5e94cd89a6f8fcf3a1e6ea81a07cc26fb9a2a79ccd", 
              "0x2c53efb5884bbd486c0deca9a18411751b69e8dd218c6096d1f511f18b96bff4"
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
