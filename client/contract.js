(async (window, document) => {
    const verificationKeyRequest = await fetch('zk/build/circuits/bullsCows_verification_key.json');
    window.verificationKey = await verificationKeyRequest.json();
})(window, document);

window.contractData = {
    address: '0x5dab3984a4e3497996eb6fcab8600cfb4dfde9b7',
    abi: [
        {
            "constant": true,
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "name": "games",
            "outputs": [
                {
                    "internalType": "address payable",
                    "name": "host",
                    "type": "address"
                },
                {
                    "internalType": "address payable",
                    "name": "player",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "value",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "guessNumber",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "guessCounter",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "digitsNumber",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "hash",
                    "type": "uint256"
                },
                {
                    "internalType": "enum BullsAndCows.GameStatus",
                    "name": "status",
                    "type": "uint8"
                },
                {
                    "internalType": "uint256",
                    "name": "startTime",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "name": "guesses",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "bulls",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "cows",
                    "type": "uint256"
                },
                {
                    "components": [
                        {
                            "internalType": "uint256[2]",
                            "name": "pi_a",
                            "type": "uint256[2]"
                        },
                        {
                            "internalType": "uint256[2][2]",
                            "name": "pi_b",
                            "type": "uint256[2][2]"
                        },
                        {
                            "internalType": "uint256[2]",
                            "name": "pi_c",
                            "type": "uint256[2]"
                        }
                    ],
                    "internalType": "struct IBullsAndCows.Proof",
                    "name": "proof",
                    "type": "tuple"
                },
                {
                    "internalType": "enum BullsAndCows.GuessStatus",
                    "name": "status",
                    "type": "uint8"
                },
                {
                    "internalType": "uint256",
                    "name": "time",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "value",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "digitsNumber",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "guessNumber",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "hash",
                    "type": "uint256"
                }
            ],
            "name": "newGame",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "payable": true,
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "gameId",
                    "type": "uint256"
                }
            ],
            "name": "deleteGame",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "gameId",
                    "type": "uint256"
                }
            ],
            "name": "startGame",
            "outputs": [],
            "payable": true,
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "gameId",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256[]",
                    "name": "digits",
                    "type": "uint256[]"
                }
            ],
            "name": "newGuess",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "gameId",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "guessId",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "bulls",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "cows",
                    "type": "uint256"
                },
                {
                    "components": [
                        {
                            "internalType": "uint256[2]",
                            "name": "pi_a",
                            "type": "uint256[2]"
                        },
                        {
                            "internalType": "uint256[2][2]",
                            "name": "pi_b",
                            "type": "uint256[2][2]"
                        },
                        {
                            "internalType": "uint256[2]",
                            "name": "pi_c",
                            "type": "uint256[2]"
                        }
                    ],
                    "internalType": "struct IBullsAndCows.Proof",
                    "name": "proof",
                    "type": "tuple"
                }
            ],
            "name": "guessResult",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "gameId",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "guessId",
                    "type": "uint256"
                }
            ],
            "name": "chalengeResult",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "gameId",
                    "type": "uint256"
                }
            ],
            "name": "forceStopGame",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "gameId",
                    "type": "uint256"
                }
            ],
            "name": "finalizeGame",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "getGamesCount",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        }
    ],
};
