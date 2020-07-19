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

    document.getElementById('create-form').addEventListener('submit', (event) => {
        (async () => {
            let error = false;
            const symbols = new Array(8);
            let symbolsError = false;
            for (let i = 0; i < 8; i++) {
                symbols[i] = parseInt(document.getElementById('symbol' + i).value.charCodeAt(0));
                if (isNaN(symbols[i])) {
                    symbolsError = true;
                    error = true;
                }
            }
            if (symbolsError) {
                document.getElementById('form-error').innerHTML += '<p class="error">All 8 symbols should be present.</p>'
            }
            const guessNumber = parseInt(document.getElementById('guessNumber').value);
            if (isNaN(guessNumber) || guessNumber <= 0) {
                error = true;
                document.getElementById('form-error').innerHTML += '<p class="error">Number of guesses should be above zero.</p>'
            }
            const bet = document.getElementById('bet').value;
            if (bet === '' || bet < 0) {
                error = true;
                document.getElementById('form-error').innerHTML += '<p class="error">Bet value should be greater than or equal to zero.</p>'
            }
            const nonce = document.getElementById('nonce').value;
            if (nonce === '') {
                error = true;
                document.getElementById('form-error').innerHTML += '<p class="error">Nonce should be present.</p>'
            }
            if (error) {
                return;
            }
            // let input = {
            //     "zero": 0,
            //     "digits": symbols,
            //     "salt": parseInt(nonce),
            //     "hash": window.signalHash(symbols, nonce)
            // };
            // const proof = await window.witness(input);
            // let newVar = {
            //     pi_a: [web3.eth.abi.encodeParameter('uint256', proof.pi_a[0]), web3.eth.abi.encodeParameter('uint256', proof.pi_a[1])],
            //     pi_b: [[
            //         web3.eth.abi.encodeParameter('uint256', proof.pi_b[0][0]), web3.eth.abi.encodeParameter('uint256', proof.pi_b[0][1])
            //     ], [
            //         web3.eth.abi.encodeParameter('uint256', proof.pi_b[1][0]), web3.eth.abi.encodeParameter('uint256', proof.pi_b[1][1])
            //     ]],
            //     pi_c: [web3.eth.abi.encodeParameter('uint256', proof.pi_c[0]), web3.eth.abi.encodeParameter('uint256', proof.pi_c[1])]
            // };
            // let number = parseInt(proof.publicSignals[1]);
            const weiValue = web3.utils.toWei(bet.toString(), 'ether');
            try {
                await myContract.methods.newGame(weiValue, 8, guessNumber, window.signalHash(symbols, nonce))
                    .send({from: accounts[0], value: weiValue});
                document.getElementById('create').innerHTML += `<p>The game has been created.</p>`;
            } catch (e) {
                document.getElementById('create').innerHTML += `<p class="error">${e.message}</p>`;
                throw new Error(e);
            }
        })();
        event.preventDefault();
    }, false);

    Array.prototype.forEach.call(document.body.querySelectorAll("*[data-mask]"), applyDataMask);
}
