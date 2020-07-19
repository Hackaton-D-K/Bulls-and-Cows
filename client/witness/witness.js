window.witness = function (input) {
    return new Promise(async (resolve) => {
        const websnarkUtils = require('websnark/src/utils');
        const buildGroth16 = require('websnark/src/groth16');

        const groth16 = await buildGroth16();
        const provingKeyRequest = await fetch('zk/build/circuits/proving_key.bin');
        const provingKey = await provingKeyRequest.arrayBuffer();
        const circuit = require('../../zk/build/circuits/bullsCows');
        const proofData = await websnarkUtils.genWitnessAndProve(groth16, input, circuit, provingKey);
        resolve(proofData);
    });
};

(() => {
    const circomlib = require('circomlib');
    window.pedersenHash = (data) => circomlib.babyJub.unpackPoint(circomlib.pedersenHash.hash(data))[0];

    window.signalHash = (symbols, nonce) => {
        let symbol0 = Buffer.alloc(1);
        symbol0.writeInt8(symbols[0]);
        let symbol1 = Buffer.alloc(1);
        symbol1.writeInt8(symbols[1]);
        let symbol2 = Buffer.alloc(1);
        symbol2.writeInt8(symbols[2]);
        let symbol3 = Buffer.alloc(1);
        symbol3.writeInt8(symbols[3]);
        let symbol4 = Buffer.alloc(1);
        symbol4.writeInt8(symbols[4]);
        let symbol5 = Buffer.alloc(1);
        symbol5.writeInt8(symbols[5]);
        let symbol6 = Buffer.alloc(1);
        symbol6.writeInt8(symbols[6]);
        let symbol7 = Buffer.alloc(1);
        symbol7.writeInt8(symbols[7]);
        let nonceB = Buffer.alloc(24);
        nonceB.writeInt8(nonce);
        return stringifyBigInts(pedersenHash(
            Buffer.concat([symbol0, symbol1, symbol2, symbol3, symbol4, symbol5, symbol6, symbol7, nonceB])));
    };

    window.applyDataMask = function (field) {
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
            return mask.map(function (char) {
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
})();
