window.addEventListener('load', () => setTimeout(load, 1000));

async function load() {
    if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        window.accounts = await window.ethereum.enable();
        window.myContract = new window.web3.eth.Contract(contractData.abi, contractData.address);
    } else {
        return document.getElementById("content").innerHTML = '<h1>Non-Ethereum browser detected. You should consider trying MetaMask!</h1>'
    }

    document.getElementById('loading').innerText = '';

    window.gameId = parseInt(new URLSearchParams(window.location.search).get('gameId'));
    document.getElementById('gameId').innerText = "#" + gameId;
    let game;
    try {
        game = await myContract.methods.games(gameId).call();
    } catch (er) {
        document.getElementById('content').innerHTML = `<h1>Game #${gameId} doesn't exist</h1>`;
        throw new Error(er);
    }
    document.getElementById('host').innerText = game.host;
    document.getElementById('bet').innerText = web3.utils.fromWei(game.value, 'ether');
    document.getElementById('guesses').innerText = game.guessNumber;
    if (game.status == 1) {
        document.getElementById('yourbet').classList.add('hidden');
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

async function verifyGuess() {
    document.getElementById('new-guess').classList.remove('hidden');
    Array.prototype.forEach.call(document.body.querySelectorAll("*[data-mask]"), applyDataMask);
    document.getElementById('new-guess-form').addEventListener('submit', (event) => {
        (async () => {
            const symbols = new Array(8);
            for (let i = 0; i < 8; i++) {
                symbols[i] = parseInt(document.getElementById('symbol' + i).value.charCodeAt(0));
            }
            await myContract.methods.newGuess(gameId, symbols).call();
            document.getElementById('new-guess-form').classList.add('hidden');

        })();
        event.preventDefault();
    }, false);
}

async function forceStop() {
    try {
        await myContract.methods.forceStopGame(gameId).call();
    } catch (e) {
        document.getElementById('game-in-progress').innerHTML += '<p class="error">You\'ve tried to force stop the game, but we haven\'t reason fot it.</p>';
    }
}
