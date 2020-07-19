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
        let guessesList = '';
        for (let i = 0; i < window.game.guessCounter; i++) {
            const guess = await myContract.methods.getGuess(gameId, i).call();
            let symbols = '';
            for (let j = 0; j < guess.digits.length; j++) {
                symbols += `<input class="symbol" type="text" disabled value="${String.fromCharCode(guess.digits[j])}"/>`;
            }
            let bulls = '';
            let cows = '';
            let verify = '';
            if (guess.status == 1) {
                bulls = `<img class="b-c-image" src="client/bull.svg" alt="bulls">: ${guess.bulls}`;
                cows = `<img class="b-c-image" src="client/cow.svg" alt="cows">: ${guess.cows}`;
                verify = `<a href="#" onclick="verifyProof(${i});return false;">Verify proof</a>`;
            } else if (guess.status == 0 && accounts[0].toLocaleLowerCase() === game.host.toLocaleLowerCase()) {
                verify = `<a href="#" onclick="verifyGuess(${i});return false;">Verify guess</a>`;
            }
            guessesList += `<tr><td>Guess ${i}</td><td>${symbols}</td><td>${bulls}</td><td>${cows}</td><td><span id="verify-guess-${i}">${verify}</span></td></tr>`;
        }
        document.getElementById('game-in-progress').innerHTML = `
            <p>The game in progress. You can ${makeNewGuessBlock}<a href="#verify-guess" id="verify-guess-link" onclick="verifyGuess();return false;">verify a guess</a> or <a href="#" id="force-stop-link" onclick="forceStop();return false;">force stop the game</a> if the opponent didn't answer.</p>
            <table>${guessesList}</table>`;
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
    document.getElementById('verify-guess-form').classList.add('hidden');
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

async function verifyGuess(guessId) {
    const guess = await myContract.methods.getGuess(gameId, guessId).call();
    document.getElementById('verify-guess-form').classList.remove('hidden');
    document.getElementById('new-guess-form').classList.add('hidden');
    Array.prototype.forEach.call(document.body.querySelectorAll("*[data-mask]"), applyDataMask);
    document.getElementById('verify-guess-form').addEventListener('submit', (event) => {
        (async () => {
            const solution = new Array(8);
            for (let i = 0; i < 8; i++) {
                solution[i] = parseInt(document.getElementById('symbol' + i + '-verify').value.charCodeAt(0));
            }
            const nonce = document.getElementById('nonce').value;
            let input = {
                "zero": 0,
                "digits": solution,
                "salt": parseInt(nonce),
                "hash": window.game.hash,
                "guess": guess.digits
            };
            const proof = await window.witness(input);
            let newVar = {
                pi_a: [web3.eth.abi.encodeParameter('uint256', proof.pi_a[0]), web3.eth.abi.encodeParameter('uint256', proof.pi_a[1])],
                pi_b: [[
                    web3.eth.abi.encodeParameter('uint256', proof.pi_b[0][0]), web3.eth.abi.encodeParameter('uint256', proof.pi_b[0][1])
                ], [
                    web3.eth.abi.encodeParameter('uint256', proof.pi_b[1][0]), web3.eth.abi.encodeParameter('uint256', proof.pi_b[1][1])
                ]],
                pi_c: [web3.eth.abi.encodeParameter('uint256', proof.pi_c[0]), web3.eth.abi.encodeParameter('uint256', proof.pi_c[1])]
            };
            const bulls = parseInt(proof.publicSignals[0]);
            const cows = parseInt(proof.publicSignals[1]);
            await myContract.methods.guessResult(gameId, guessId, bulls, cows, newVar).send({from: accounts[0]});
        })();
        event.preventDefault();
    }, false);
}

async function verifyProof(guessId) {
    const guess = await myContract.methods.getGuess(gameId, guessId).call();
    let parameters = [
        guess.bulls, guess.cows, window.game.hash, guess.digits[0], guess.digits[1], guess.digits[2], guess.digits[3], guess.digits[4], guess.digits[5], guess.digits[6], guess.digits[7]
    ];
    verify(window.verificationKey, parameters, guess.proof, document.getElementById(`verify-guess-${guessId}`));
}

async function forceStop() {
    const status = await myContract.methods.forceStopGame(gameId).send({from: accounts[0]});
    const progress = document.getElementById('game-in-progress');
    if (status == 0) {
        progress.innerHTML += '<p class="error">You\'ve tried to force stop the game, but we haven\'t reason fot it.</p>';
    } else if (status == 1) {
        progress.innerHTML += '<p>Host win.</p>';
    } else if (status == 2) {
        progress.innerHTML += '<p>Player win.</p>';
    }
}

function verify(verificationKey, publicSignals, proof, block) {
    return new Promise((resolve) => {
        const start = new Date().getTime();
        block.innerHTML = "processing....";
        window.groth16Verify(verificationKey, publicSignals, proof).then((res) => {
            const end = new Date().getTime();
            const time = end - start;
            // document.getElementById("time").innerHTML = `Time to compute: ${time}ms`;
            block.innerHTML = (res === true) ? '<span class="good">GOOD</span>' : '<span class="failed">Failed</span>';
        });
    });
}
