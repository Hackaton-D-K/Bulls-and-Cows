pragma solidity 0.5.11;
pragma experimental ABIEncoderV2;

import "./verifier.sol";


contract BullsAndCows {

    struct Proof {
        uint[2]  pi_a;
        uint[2][2]  pi_b;
        uint[2]  pi_c;
    }

    enum StopStatus {
        GAMECONTINUES,
        HOSTWON,
        PLAYERWON
    }

    enum GameStatus {
        CREATED,
        STARTED,
        FINISHED
    }

    struct Game {
        address payable host;
        address payable player;
        uint value;
        uint guessNumber;
        uint guessCounter;
        uint digitsNumber;
        uint hash;
        GameStatus status;
        uint startTime;
    }

    enum GuessStatus {
        CREATED,
        RESPONDED
    }

    struct Guess {
        uint[] digits;
        uint bulls;
        uint cows;
        Proof proof;
        GuessStatus status;
        uint time;
    }

    Game[] public games;
    mapping(uint => Guess[]) internal guesses;

    uint chalengePeriod = 1 hours;


    function newGame(
        uint value,
        uint digitsNumber,
        uint guessNumber,
        uint hash
    ) external payable returns (uint) {
        require(msg.value == value, "INCORRECT VALUE");
        // TODO check digitsNumber consistency [4,5,6]
        // TODO real word proof and chalenge function
        Game memory game = Game(
            msg.sender,
            address(0),
            value,
            guessNumber,
            0,
            digitsNumber,
            hash,
            GameStatus.CREATED,
            0
        );
        games.push(game);
    }

    function deleteGame(uint gameId) external {
        require(gameId < games.length, "INCORRECT GAME ID");
        Game memory game = games[gameId];
        require(msg.sender == game.host, "INCORRECT GAME HOST");
        require(game.status == GameStatus.CREATED, "INCORRECT GAME STATUS");
        games[gameId].status = GameStatus.FINISHED;
    }

    function startGame(uint gameId) external payable {
        require(gameId < games.length, "INCORRECT GAME ID");
        Game memory game = games[gameId];
        require(game.status == GameStatus.CREATED, "INCORRECT GAME STATUS");
        require(msg.value == game.value, "INCORRECT VALUE");
        games[gameId].player = msg.sender;
        games[gameId].status = GameStatus.STARTED;
        games[gameId].startTime = now;
    }

    function newGuess(uint gameId, uint[] calldata digits) external {
        require(gameId < games.length, "INCORRECT GAME ID");
        Game memory game = games[gameId];
        require(game.status == GameStatus.STARTED, "INCORRECT GAME STATUS");
        require(msg.sender == game.player, "INCORRECT PLAYER");
        require(game.guessCounter < game.guessNumber, "INCORRECT PLAYER");
        require(digits.length == game.digitsNumber, "INCORRECT DIGITS NUMBER");
        for (uint i = 0; i<digits.length; i++) {
            require(digits[i] < 256, "INCORRECT DIGIT VALUE (>255)");
        }

        Guess memory guess = Guess(
            digits,
            0,
            0,
            Proof([uint(0),0],[[uint(0),0],[uint(0),0]],[uint(0),0]),
            GuessStatus.CREATED,
            now
        );
        guesses[gameId].push(guess);
        games[gameId].guessCounter += 1;
    }

    function guessResult(
        uint gameId,
        uint guessId,
        uint bulls,
        uint cows,
        Proof calldata proof
    ) external {
        require(gameId < games.length, "INCORRECT GAME ID");
        Game memory game = games[gameId];
        require(guessId < guesses[gameId].length, "INCORRECT GUESS ID");
        Guess storage guess = guesses[gameId][guessId];
        require(msg.sender == game.host, "INCORRECT HOST");
        require(game.status == GameStatus.STARTED, "INCORRECT GAME STATUS");
        require(guess.status == GuessStatus.CREATED, "INCORRECT GUESS STATUS");
        
        Proof memory _proof = proof; // for 5.11 compilation
        guess.proof = _proof;
        guess.bulls = bulls;
        guess.cows = cows;
        guess.status = GuessStatus.RESPONDED;
        guess.time = now;
    }

    function chalengeResult(uint gameId, uint guessId) external {
        require(gameId < games.length, "INCORRECT GAME ID");
        Game memory game = games[gameId];
        require(game.status == GameStatus.STARTED, "INCORRECT GAME STATUS");
        require(guessId < guesses[gameId].length, "INCORRECT GUESS ID");
        Guess storage guess = guesses[gameId][guessId];
        require(guess.status == GuessStatus.RESPONDED, "INCORRECT GUESS STATUS");

        uint[11] memory publicInputs = [
            guess.bulls,
            guess.cows,
            game.hash,
            guess.digits[0],
            guess.digits[1],
            guess.digits[2],
            guess.digits[3],
            guess.digits[4],
            guess.digits[5],
            guess.digits[6],
            guess.digits[7]
        ];
        bool result = Verifier.verifyProof(
            guess.proof.pi_a,
            guess.proof.pi_b,
            guess.proof.pi_c,
            publicInputs
        );
        if (result != true) {
            // player won
            games[gameId].status = GameStatus.FINISHED;
            game.player.transfer(2*game.value);
        }
    }

    function forceStopGame(uint gameId) external returns(StopStatus) {
        require(gameId < games.length, "INCORRECT GAME ID");
        Game memory game = games[gameId];
        require(game.status == GameStatus.STARTED, "INCORRECT GAME STATUS");

        if (game.guessCounter > 0) {
            Guess memory guess = guesses[gameId][game.guessCounter-1];
            if (now > guess.time + chalengePeriod) {
                if (guess.status == GuessStatus.CREATED) {
                    // player won
                    games[gameId].status = GameStatus.FINISHED;
                    game.player.transfer(2*game.value);
                    return StopStatus.PLAYERWON;
                } else if (guess.status == GuessStatus.RESPONDED && game.guessCounter != game.guessNumber) {
                    // host won
                    games[gameId].status = GameStatus.FINISHED;
                    game.host.transfer(2*game.value);
                    return StopStatus.HOSTWON;
                }
            }
        } else {
            if (now > game.startTime + chalengePeriod) {
                // host won
                games[gameId].status = GameStatus.FINISHED;
                game.host.transfer(2*game.value);
                return StopStatus.HOSTWON;
            }
        }
        return StopStatus.GAMECONTINUES;
    }

    function finalizeGame(uint gameId) external {
        require(gameId < games.length, "INCORRECT GAME ID");
        Game memory game = games[gameId];
        require(game.status == GameStatus.STARTED, "INCORRECT GAME STATUS");
        require(game.guessCounter > 0, "INCORRECT GUESS COUNTER");
        Guess memory guess = guesses[gameId][game.guessCounter-1];
        require(guess.status == GuessStatus.RESPONDED, "INCORRECT GUESS STATUS");

        if (game.guessCounter < game.guessNumber) {
            if (guess.bulls == game.digitsNumber) {
                // player won
                games[gameId].status = GameStatus.FINISHED;
                game.player.transfer(2*game.value);
            }
        } else if (game.guessCounter == game.guessNumber) {
            games[gameId].status = GameStatus.FINISHED;
            if (guess.bulls == game.digitsNumber) {
                // player won
                game.player.transfer(2*game.value);
            } else {
                // TODO rewrite tests
                //require(now > guess.time + chalengePeriod);
                // host won
                game.host.transfer(2*game.value);
            }
        }
    }

    function getGamesCount() external view returns(uint) {
        return games.length;
    }

    function getGuess(uint gameId, uint guessId) external view returns(Guess memory) {
        return guesses[gameId][guessId];
    }
}