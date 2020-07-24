# Bulls&Cows
Zero knowledge implementation of [Bulls and Cows](https://en.wikipedia.org/wiki/Bulls_and_Cows) game for Ethereum. This project was build for [UTONHACK 2.0](https://utonhack.devpost.com/) hackathon.
 
<img src="bull.svg" alt="BULL" width="100" height="100">
<img src="cow.svg" alt="COW" width="100" height="100">
 
## Game rules
The game is usually played with 4-letter words, alternate versions of the game can be played with any number of letters. They must be real words, according to whatever language or languages you are playing the game in.
 
The game play is as follows:
- A person (Host) thinks of any word, and gives out the number of letters in the word.
- Other player (Player) tries to figure that word by guessing words containing the same number of letters.
- Host responds with the number of Cows & Bulls for each guessed word. "Cow" means a letter in the wrong position, while "Bull" means a letter in the right position.
 
For example:
- if the secret word is HEAT, a guess of COIN would result in "0 Bulls, 0 Cows" (all of the guessed letters are wrong);
- a guess of EATS would result in "0 Bulls, 3 Cows" (since E, A, T are all present, but not in the guessed positions),
- and a guess of TEAL would result in "2 Bulls, 1 Cow" (since E and A are in the right positions, while T is in the wrong position).
 
The game would continue until someone scores "4 Bulls" for guessing HEAT exactly.
 
## Blockchain edition
For first view it isn't hard to implement Bulls and Cows game using smart contracts.
But there is the pinfall - how can Host to prove their response without revealing the secret word?
Here zero knowledge proofs appear. Host can respond for each guess with appropriate zk-proof
which cryptographically proves that response corresponds secret and guess words without revealing the
secret word. Looks like another beautiful zkp application!
 
So we are going to implement Bulls&Cows game on Ethereum which game play is as follows:
- Anyone can create a new game. Choose the secret word (ASCII) with sol (prevent Brute force attack).
Hash from secret word and sol is stored on contract. Choose game value (in ETH) -  both parties deposit this value when the game starts and the winner gets double value. Choose guess number - for victory Player should guess secret word in this number of attempts.
- Anyone can view open games with their parameters (value, word length, guess number) and participate in available games. Player should deposit game value (in ETH) in this step.
- Player can send guesses - no more than game guess number.
- Host can send responses for guess with zk-proof of response validity.
- Anyone can check proof in their web browser and if it is wrong challenge it in the smart contract. If proof is wrong Player immediately wins and gets all game value.
- Anyone can force stop game if the opponent doesn't answer for more than 1 hour.
If successful, the user immediately wins and gets all game value (ETH funds).
- Anyone can finalize game: if all attempts are spent and the word is not guessed -
Host wins and gets game value; or if the word is guessed in any attempt - Player
wins and gets game value.
## Technical implementation
[Solidity smart contracts](https://github.com/Hackaton-D-K/Bulls-and-Cows/tree/master/truffle) is used as game backend.
Game and financial functionality as long as games data are stored in the Ethereum blockchain.

[Zk part](https://github.com/Hackaton-D-K/Bulls-and-Cows/tree/master/zk) of the project is implemented using [circom](https://github.com/iden3/circom) and [wasmsnark](https://github.com/iden3/wasmsnark) libraries. These libraries generate wasm prover and verifier which allow generating and verifying proofs in web browser effectively. As proofs are generated and verified off chain it is free and only in case of Host cheating on chain proof verification is needed.

[Client](https://github.com/Hackaton-D-K/Bulls-and-Cows/tree/master/client) is the static web page which connects with Ethereum using Metamask.
It allows user: create game, participate in available game, send guesses,
send response for guess, check proofs locally, challenge proofs, force stop game, finalize game.
 
 
 

