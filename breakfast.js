// vim: softtabstop=4 shiftwidth=4 expandtab

function binomial(n, k) {
    if (k < 0 || k > n) return 0;
    if (k > n - k) k = n - k;
    let res = 1;
    for (let i = 0; i < k; i++) {
        res *= (n - k + i + 1) / (i + 1);
    }
    return Math.round(res);
}

function binomialCdf(n, k, p) {
    let sum = 0;
    for (let i = 0; i <= k; i++) {
        sum += binomial(n, i) * Math.pow(p, i) * Math.pow(1 - p, n - i);
    }
    return sum;
}

// hours: int in [0, 23]
// mins: int in [0, 59]
// return: ?float
function calculateProb(hours, mins) {
    console.log('calculating prob with', hours, mins);
    if (hours < 8) return null;
    if (hours < 10) return 1.0;
    if (hours === 10) {
        if (mins === 0) return 1.0;
        if (mins < 30) {
            const probNo = binomialCdf(28, mins - 1, 9/28);
            console.log('prob no', probNo);
            return 1 - probNo;
        }
        return 0.0;
    }
    if (hours < 12) return 0.0;
    return null;
}

// prob: float in [0, 1]
// return: boolean
function evalProb(prob) {
    console.log('evaluating prob', prob);
    return Math.random() < prob;
}

const date = new Date();
let hours = date.getHours();
let mins = date.getMinutes();

let prob = null;

function init() {
    document.getElementById('hours').value = hours;
    document.getElementById('minutes').value = mins;
    const timeStr = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
    document.getElementById('curr-time').innerHTML = timeStr;
    updateProb();
}

function setTime() {
    document.getElementById('disp-time').style.display = 'none';
    document.getElementById('set-time').style.display = 'block';
}

function updateTime() {
    hours = parseInt(document.getElementById('hours').value, 10);
    if (isNaN(hours)) hours = 0;
    mins = parseInt(document.getElementById('minutes').value, 10);
    if (isNaN(mins)) mins = 0;
    updateProb();
}

function updateProb() {
    prob = calculateProb(hours, mins);
    if (prob === null) {
        document.getElementById('prob-no').innerHTML = 'N/A';
        document.getElementById('out-of-no').innerHTML = '';
        return;
    }
    const probNo = 1 - prob;
    const probNoRound = Math.round(probNo * 1000000) / 10000;
    document.getElementById('prob-no').innerHTML = String(probNoRound) + '%';
    if (probNo === 0 || probNo === 1) {
        document.getElementById('out-of-no').innerHTML = '';
    } else {
        const outOfNo = Math.round(1/probNo * 100) / 100;
        document.getElementById('out-of-no').innerHTML = ' (1 out of ' + String(outOfNo) + ')';
    }
}

// return: str
function getOutputText() {
    if (prob === null) return 'N/A';
    const hasBreakfast = evalProb(prob);
    if (hasBreakfast) return 'Yes';
    return 'No';
}

function showChoice() {
    const outputText = getOutputText();
    document.getElementById('output').innerHTML = outputText;
}
