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

    const games = document.getElementById('games');
    const gamesFinalized = document.getElementById('finalized-games');
    const gamesCount = parseInt(await myContract.methods.getGamesCount().call());
    for (let i = 0; i < gamesCount; i++) {
        const game = await myContract.methods.games(i).call();
        let status;
        if (game.status == 0) {
            status = 'New';
        } else if (game.status == 1) {
            status = 'Started';
        } else {
            gamesFinalized.innerHTML += `<tr><td>#${i}</td><td>${game.guessNumber}</td><td>${game.guessCounter}</td><td>${web3.utils.fromWei(game.value, 'ether')} ETH</td><td>${game.host}</td><td>Finished</td><td><a href="game.html?gameId=${i}">Open Game</a></td></tr>`;
            continue;
        }
        games.innerHTML += `<tr><td>#${i}</td><td>${game.guessNumber}</td><td>${game.guessCounter}</td><td>${web3.utils.fromWei(game.value, 'ether')} ETH</td><td>${game.host}</td><td>${status}</td><td><a href="game.html?gameId=${i}">Open Game</a></td></tr>`;
    }
}
