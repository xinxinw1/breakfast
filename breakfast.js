// vim: softtabstop=4 shiftwidth=4 expandtab

// n, k: int
// p: real
// prec: int
function binCdf(n, k, p, prec) {
    // console.log('bincdf', n, k, R.tostr(p), prec);
    const nr = R.mknumint(n);
    let sum = R.zero();
    for (let i = 0; i <= k; i++) {
        const ir = R.mknumint(i);
        const coeff = R.bin(nr, ir);
        const innerPrec = prec+n+3+R.siz(coeff);
        // console.log('in loop', i, R.tostr(coeff), innerPrec);
        sum = R.add(
            sum,
            R.mul(
                R.mul(
                    coeff,
                    R.pow(p, ir, innerPrec),
                ),
                R.pow(R.sub(R.one(), p), R.sub(nr, ir), innerPrec),
            ),
        );
    }
    return R.rnd(sum, prec);
}

const BREAKFAST_START_HOUR = 6;
const BREAKFAST_END_HOUR = 8;
const BREAKFAST_END_MINS = 30;

const EOD_START_HOUR = 16;
const EOD_END_HOUR = 17;
const EOD_END_MINS = 30;

const SLEEP_START_HOUR = 22;
const SLEEP_END_HOUR = 23;
const SLEEP_END_MINS = 30;

// hours: int in [0, 23]
// mins: int in [0, 59]
// return: [str, ?float]
function calculateProb(hours, mins) {
    if (hours < SLEEP_END_HOUR + 2 - 24) {
        return ['Do I get bedtime reward?', calculateProbFor(SLEEP_START_HOUR - 24, SLEEP_END_HOUR - 24, SLEEP_END_MINS, hours, mins)];
    }
    if (hours < BREAKFAST_END_HOUR + 2) {
        return ['Do I have breakfast?', calculateProbFor(BREAKFAST_START_HOUR, BREAKFAST_END_HOUR, BREAKFAST_END_MINS, hours, mins)];
    }
    if (hours < EOD_END_HOUR + 2) {
        return ['Do I get EOD reward?', calculateProbFor(EOD_START_HOUR, EOD_END_HOUR, EOD_END_MINS, hours, mins)];
    }
    if (hours < SLEEP_END_HOUR + 2) {
        return ['Do I get bedtime reward?', calculateProbFor(SLEEP_START_HOUR, SLEEP_END_HOUR, SLEEP_END_MINS, hours, mins)];
    }
    return ['Check back later', null];
}

// hours: int in [0, 23]
// mins: int in [0, 59]
// return: ?float
function calculateProbFor(startHour, endHour, endMins, hours, mins) {
    console.log('calculating prob with', 'startHour', startHour, 'endHour', endHour, 'endMins', endMins, 'hours', hours, 'mins', mins);
    if (endMins > 30) throw new Error('end mins must be <= 30');
    if (hours < startHour) return null;
    if (hours < endHour) return 1.0;
    if (hours === endHour) {
        if (mins < endMins) return 1.0;
        if (mins < endMins + 30) {
            const probNo = binCdf(
                30,
                mins - endMins,
                R.div(R.mknumint(1), R.mknumint(4), 60),
                50,
            );
            console.log('prob no', R.tostr(probNo));
            const probYes = R.sub(R.one(), probNo);
            console.log('prob yes', R.tostr(probYes));
            const probYesNum = R.tonum(probYes);
            console.log('prob yes num', probYesNum);
            return probYesNum;
        }
        return 0.0;
    }
    if (hours < endHour + 2) return 0.0;
    return null;
}

// prob: float in [0, 1]
// return: boolean
function evalProb(prob) {
    console.log('evaluating prob', prob);
    const rand = Math.random();
    console.log('rand num', rand);
    return rand < prob;
}

const date = new Date();
let hours = date.getHours();
let mins = date.getMinutes();

let buttonText = "";
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
    [buttonText, prob] = calculateProb(hours, mins);
    document.getElementById('check-button').value = buttonText;
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
