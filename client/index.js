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

    const games = document.getElementById('games');

    const gamesCount = parseInt(await myContract.methods.getGamesCount().call());
    for (let i = 0; i < gamesCount; i++) {
        let address = await myContract.methods.traders(i).call();
        let email = await myContract.methods.emails(address).call();
        let proofLen = parseInt(await myContract.methods.getProofLen(address).call());
        if (proofLen === 0) {
            games.innerHTML += `<tr><td>Trader ${i}:</td><td>${email}</td><td>${address}</td><td>No periods found</td></tr>`;
            continue;
        }
        let proofsAndYelds = ``;
        for (let j = 0; j < proofLen; j++) {
            let periodProof = await myContract.methods.periodProofs(address, j).call();
            let lastPeriodProof = {y: null};
            if (j === 0) {
                lastPeriodProof.y = 1000;
            } else {
                lastPeriodProof = await myContract.methods.periodProofs(address, j - 1).call();
            }
            let profit = (((periodProof.y - lastPeriodProof.y) / lastPeriodProof.y) * 100).toFixed(2);
            proofsAndYelds += `<span class="yeld">${j}. Profit: <span class="${profit < 0 ? 'failed' : 'good'}">${profit}%</span> <span id="verify-${address}-${j}"><a href="#" onclick="verifyProofByIndex('${address}', ${j}); return false;" class="proof-verify">Verify</a></span></span>`;
        }
        games.innerHTML += `<tr><td><b>Trader ${i}:</b></td><td>${email}</td><td>${address}</td><td>${proofsAndYelds}</td></tr>`;
    }

}

async function verifyProofByIndex(address, index) {
    let periodProof = await myContract.methods.periodProofs(address, index).call();
    let a = await myContract.methods.signals(address, 2 * index).call(); //TODO change function
    let b = await myContract.methods.signals(address, 2 * index + 1).call();
    let price_a = Math.round((await oracle.methods.currentAnswer().call(a.blockNumber)) / Math.pow(10, 8));
    let price_b = Math.round((await oracle.methods.currentAnswer().call(b.blockNumber)) / Math.pow(10, 8));
    // let currentBlock = await web3.eth.getBlockNumber();
    let price_now = Math.round((await oracle.methods.currentAnswer().call(periodProof.blockNumber)) / Math.pow(10, 8));
    // let price_a = 100;
    // let price_b = 200;
    // let price_now = 300;
    let previousBalanceHash;
    if (index === 0) {
        previousBalanceHash = '12991363837217894993991711342410433599666196004667524206273513024950584067662';
    } else {
        previousBalanceHash = (await myContract.methods.periodProofs(address, index - 1).call()).newBalanceHash;
    }
    let parameters = [
        periodProof.newBalanceHash, periodProof.y, previousBalanceHash, a.hash, b.hash, price_a, price_b, price_now
    ];
    verify(window.verificationKey, parameters, periodProof.proof, document.getElementById(`verify-${address}-${index}`));
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