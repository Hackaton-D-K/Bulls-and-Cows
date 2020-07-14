pragma solidity 0.5.11;


contract IBullsAndCows {
    function newGame(uint value, uint digitNumber, string calldata hash) external returns (uint);
    function deleteGame(uint gameId) external;
    function startGame(uint gameId) external;
    function newGuess(uint gameId, uint[] calldata digits) external;
    function guessResult(uint gameId, uint bulls, uint cows) external;
    function forceStopGame(uint gameId) external;
}