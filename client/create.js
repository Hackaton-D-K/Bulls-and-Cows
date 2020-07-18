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

    document.getElementById('create-form').addEventListener('submit', (event) => {
        (async () => {
            const symbols = new Array(8);
            for (let i = 0; i < 8; i++) {
                symbols[i] = parseInt(document.getElementById('symbol' + i).value.charCodeAt(0));
            }
            const guessNumber = parseInt(document.getElementById('guessNumber').value);
            const bet = document.getElementById('bet').value;
            const nonce = document.getElementById('nonce').value;
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
            await myContract.methods.newGame(bet.toString(), 8, guessNumber, window.signalHash(symbols, nonce)).send({from: accounts[0], value: weiValue});
        })();
        event.preventDefault();
    }, false);

    Array.prototype.forEach.call(document.body.querySelectorAll("*[data-mask]"), applyDataMask);

    function applyDataMask(field) {
        var mask = field.dataset.mask.split('');

        // For now, this just strips everything that's not a number
        function stripMask(maskedData) {
            function allowed(char) {
                return char.charCodeAt(0) < 255;
                // return /[a-z0-9]/.test(char);
            }
            return maskedData.split('').filter(allowed);
        }

        // Replace `_` characters with characters from `data`
        function applyMask(data) {
            return mask.map(function(char) {
                if (char != '_') return char;
                if (data.length == 0) return char;
                return data.shift();
            }).join('')
        }

        function reapplyMask(data) {
            return applyMask(stripMask(data));
        }

        function changed() {
            var oldStart = field.selectionStart;
            var oldEnd = field.selectionEnd;

            field.value = reapplyMask(field.value);

            field.selectionStart = oldStart;
            field.selectionEnd = oldEnd;
        }

        field.addEventListener('click', changed)
        field.addEventListener('keyup', changed)
    }
}
