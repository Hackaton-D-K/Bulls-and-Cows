window.addEventListener('load', () => setTimeout(load, 1000));

async function load() {
    if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        window.accounts = await window.ethereum.enable();
        window.myContract = new window.web3.eth.Contract(contractData.abi, contractData.address);
    } else {
        return document.getElementById("content").innerHTML = '<h1 class="error">Non-Ethereum browser detected. You should consider trying MetaMask!</h1>'
    }

    document.getElementById('loading').innerText = '';

    window.gameId = parseInt(new URLSearchParams(window.location.search).get('gameId'));
    document.getElementById('gameId').innerText = "#" + gameId;
    try {
        window.game = await myContract.methods.games(gameId).call();
    } catch (er) {
        document.getElementById('content').innerHTML = `<h1 class="error">Game #${gameId} doesn't exist</h1>`;
        throw new Error(er);
    }
    document.getElementById('host').innerText = game.host;
    document.getElementById('bet').innerText = web3.utils.fromWei(game.value, 'ether');
    const remainingGuesses = parseInt(game.guessNumber) - parseInt(game.guessCounter);
    document.getElementById('guesses').innerText = remainingGuesses;
    if (game.status == 1) {
        document.getElementById('yourbet').classList.add('hidden');
        const makeNewGuessBlock = remainingGuesses > 0 ? `<a href="#" id="new-guess-link" onclick="makeGuess();return false;">make a new guess</a>, ` : '';
        document.getElementById('game-in-progress').innerHTML = `<p>The game in progress. You can ${makeNewGuessBlock}<a href="#" id="verify-guess-link" onclick="verifyGuess();return false;">verify a guess</a> or <a href="#" id="force-stop-link" onclick="forceStop();return false;">force stop the game</a> if the opponent didn't answer.</p>`;
        document.getElementById('game-in-progress').classList.remove('hidden');
    }

    document.getElementById('bet-form').addEventListener('submit', (event) => {
        (async () => {
            await myContract.methods.startGame(gameId).send({from: accounts[0], value: game.value});
            document.getElementById('yourbet').classList.add('hidden');
            document.getElementById('game-in-progress').classList.remove('hidden');
        })();
        event.preventDefault();
    }, false);
}

async function makeGuess() {
    document.getElementById('new-guess-form').classList.remove('hidden');
    Array.prototype.forEach.call(document.body.querySelectorAll("*[data-mask]"), applyDataMask);
    document.getElementById('new-guess-form').addEventListener('submit', (event) => {
        (async () => {
            const symbols = new Array(8);
            for (let i = 0; i < 8; i++) {
                symbols[i] = parseInt(document.getElementById('symbol' + i).value.charCodeAt(0));
            }
            await myContract.methods.newGuess(gameId, symbols).send({from: accounts[0]});
            document.getElementById('new-guess-form').classList.add('hidden');
            document.getElementById('new-guess').innerHTML += '<p>Guess is accepted</p>';
        })();
        event.preventDefault();
    }, false);
}

async function verifyGuess() {
    document.getElementById('verify-guess-form').classList.remove('hidden');
    for (let i = 0; i < window.game.guessCounter; i++) {
        const guess = await myContract.methods.guesses(gameId, i).call();
        console.log(gues);
    }
    document.getElementById('verify-guess-form').addEventListener('submit', (event) => {
        (async () => {
            const symbols = new Array(8);
            for (let i = 0; i < 8; i++) {
                symbols[i] = parseInt(document.getElementById('symbol' + i).value.charCodeAt(0));
            }
            await myContract.methods.newGuess(gameId, symbols).send({from: accounts[0]});
            document.getElementById('new-guess-form').classList.add('hidden');
            document.getElementById('new-guess').innerHTML += '<p>Guess is accepted</p>';
        })();
        event.preventDefault();
    }, false);
}

async function forceStop() {
    const status = await myContract.methods.forceStopGame(gameId).call();
    const progress = document.getElementById('game-in-progress');
    if (status == 0) {
        progress.innerHTML += '<p class="error">You\'ve tried to force stop the game, but we haven\'t reason fot it.</p>';
    } else if (status == 1) {
        progress.innerHTML += '<p>Host win.</p>';
    } else if (status == 2) {
        progress.innerHTML += '<p>Player win.</p>';
    }
}
