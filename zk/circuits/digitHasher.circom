include "../node_modules/circomlib/circuits/pedersen.circom";
include "../node_modules/circomlib/circuits/bitify.circom";

template digitHasher(n) {
    signal input digits[n];
    signal input salt;
    signal output hash;

    component hasher = Pedersen(256);
    var cur = 0;
    var i;

    component byte[n];
    for (var j = 0; j<n; j++) {
        byte[j] = Num2Bits(8);
        byte[j].in <== digits[j];
        for (i = 0; i<8; i++) {
            hasher.in[cur] <== byte[j].out[i];
            cur+=1;
        }
    }


    component b_salt = Num2Bits(256-8*n);
    b_salt.in <== salt;
    for (i = 0; i<256-8*n; i++) {
        hasher.in[cur] <== b_salt.out[i];
        cur+=1;
    }

    hash <== hasher.out[0];
}
