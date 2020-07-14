include "digitHasher.circom"

template BullsCows(n) {
    signal private input zero;
    signal private input digits[n];
    signal private input salt;
    signal input hash;
    signal input guess[n];
    signal output bulls;
    signal output cows;

    // check hash -----------------------------------------
    component hasher = digitHasher(n);
    for (var i = 0; i<n; i++) {
        hasher.digits[i] <== digits[i];
    }
    hasher.salt <== salt;
    hash === hasher.hash;

    // check bulls ----------------------------------------
    var b = 0;
    for (var i = 0; i<n; i++) {
        if (guess[i] == digits[i]) {
            b++;
        }
    }
    bulls <-- zero + b;

    // check cows -----------------------------------------
    var digitCounter[n];
    var guessCounter[n];
    for (var i = 0; i<n; i++) {
        digitCounter[i] = 0;
        guessCounter[i] = 0;
    }

    var counter = 0;
    for (var i = 0; i<n; i++) {
        counter = 0;
        if (digitCounter[i] == 0){
            for (var j = i; j<n; j++) {
                if (digits[i] == digits[j]) {
                    counter++;
                    digitCounter[j] = counter;
                }
            }
        }
        counter = 0;
        if (guessCounter[i] == 0){
            for (var j = i; j<n; j++) {
                if (guess[i] == guess[j]) {
                    counter++;
                    guessCounter[j] = counter;
                }
            }
        }
    }

    var c = 0;
    for (var i = 0; i<n; i++) {
        for (var j = 0; j<n; j++) {
            if (digits[i] == guess[j]) {
                if (digitCounter[i] == guessCounter[j]) {
                    c++;
                }
            }
        }
    }

    cows <-- zero + c - b;
}

component main = BullsCows(6)
