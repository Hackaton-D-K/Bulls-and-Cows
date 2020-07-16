pragma solidity 0.5.11;
pragma experimental ABIEncoderV2;


contract IBullsAndCows {
    struct Proof {
        uint[2]  pi_a;
        uint[2][2]  pi_b;
        uint[2]  pi_c;
    }

    function newGame(uint value, uint digitsNumber, uint guessNumber, string calldata hash) external payable returns (uint);
    function deleteGame(uint gameId) external;
    function startGame(uint gameId) external payable;
    function newGuess(uint gameId, uint[] calldata digits) external;
    function guessResult(uint gameId, uint guessId, uint bulls, uint cows, Proof calldata proof) external;
    function chalengeResult(uint gameId, uint guessId) external;
    function forceStopGame(uint gameId) external;
    function finalizeGame(uint gameId) external;
    function getGamesCount() external view returns(uint);
}

contract BullsAndCows is IBullsAndCows {

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
        string hash;
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
    mapping(uint => Guess[]) public guesses;

    uint chalengePeriod = 1.5 days;


    function newGame(
        uint value,
        uint digitsNumber,
        uint guessNumber,
        string calldata hash
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
            now
        );
        games.push(game);
    }

    function deleteGame(uint gameId) external {
        require(gameId < games.length, "INCORRECT GAME ID");
        Game memory game = games[gameId];
        require(msg.sender == game.host, "INCORRECT GAME HOST");
        require(game.status == GameStatus.CREATED, "INCORRECT GAME STATUS");
        games[gameId].status == GameStatus.FINISHED;
    }

    function startGame(uint gameId) external payable {
        require(gameId < games.length, "INCORRECT GAME ID");
        Game memory game = games[gameId];
        require(game.status == GameStatus.CREATED, "INCORRECT GAME STATUS");
        require(msg.value == game.value, "INCORRECT VALUE");
        games[gameId].player == msg.sender;
        games[gameId].status == GameStatus.STARTED;
        // TODO add start time
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

        // TODO verify proof
        bool result = true;
        if (result != true) {
            // player won
            games[gameId].status = GameStatus.FINISHED;
            game.player.transfer(2*game.value);
        }
    }

    function forceStopGame(uint gameId) external {
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
                } else if (guess.status == GuessStatus.RESPONDED && game.guessCounter != game.guessNumber) {
                    // host won
                    games[gameId].status = GameStatus.FINISHED;
                    game.host.transfer(2*game.value);
                }
            }
        } else {
            if (now > game.startTime + chalengePeriod) {
                // host won
                games[gameId].status = GameStatus.FINISHED;
                game.host.transfer(2*game.value);
            }
        }
    }

    function finalizeGame(uint gameId) external {
        require(gameId < games.length, "INCORRECT GAME ID");
        Game memory game = games[gameId];
        require(game.status == GameStatus.STARTED, "INCORRECT GAME STATUS");
        require(game.guessCounter == game.guessNumber, "INCORRECT GUESS COUNTER");

        Guess memory guess = guesses[gameId][game.guessNumber-1];
        require(guess.status == GuessStatus.RESPONDED, "INCORRECT FINAL GUESS STATUS");
        require(now > guess.time + chalengePeriod);

        games[gameId].status = GameStatus.FINISHED;
        if (guess.bulls == game.digitsNumber) {
            // player won
            game.player.transfer(2*game.value);
        } else {
            // host won
            game.host.transfer(2*game.value);
        }
    }

    function getGamesCount() external view returns(uint) {
        return games.length;
    }
}