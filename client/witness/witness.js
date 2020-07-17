window.witness = function (input) {
    return new Promise(async (resolve) => {
        const websnarkUtils = require('websnark/src/utils');
        const buildGroth16 = require('websnark/src/groth16');

        const groth16 = await buildGroth16();
        const provingKeyRequest = await fetch('proving_key.bin');
        const provingKey = await provingKeyRequest.arrayBuffer();
        const circuit = require('../../zk/build/circuits/bullsCows');
        const proofData = await websnarkUtils.genWitnessAndProve(groth16, input, circuit, provingKey);
        resolve(proofData);
    });
};

(() => {
    const circomlib = require('circomlib');
    window.pedersenHash = (data) => circomlib.babyJub.unpackPoint(circomlib.pedersenHash.hash(data))[0];

    window.signalHash = (type, amount, nonce) => {
        let typeB = Buffer.alloc(1);
        typeB.writeInt8(type);
        let amountB = Buffer.alloc(17);
        amountB.writeInt8(amount);
        let nonceB = Buffer.alloc(14);
        nonceB.writeInt8(nonce);
        return stringifyBigInts(pedersenHash(Buffer.concat([typeB, amountB, nonceB])));
    };
})();