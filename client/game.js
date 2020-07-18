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

    const gameId = new URLSearchParams(window.location.search).get('gameId');
    document.getElementById('gameId').innerText = "#" + gameId;
    const game = await myContract.methods.games(gameId).call();
    document.getElementById('host').innerText = game.host;
    document.getElementById('bet').innerText = game.value;
    document.getElementById('guesses').innerText = game.guessNumber;
}