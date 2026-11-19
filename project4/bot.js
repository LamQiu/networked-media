// this builds off of class-18-demo
// we are adding the fetch request in our interval function

require('dotenv').config()

const m = require('masto')

const masto = m.createRestAPIClient({
    url: 'https://networked-media.itp.io/',
    accessToken: process.env.TOKEN,
});

async function makeStatus(text) {
    const status = await masto.v1.statuses.create({
        status: text,
        // change visability to public when project ready to run
        visibility: 'public',
    });
}

const names = [
    "Caitlyn", "Anna", "Ali", "Anita", "Tommy", "Jennifer", "Elena",
    "Wing", "May", "Lam", "Mike", "Kiki", "Tess", "Yatong", "Lisa",
    "Sam", "Nujum"
]

function getRandomNames(names) {
    const shuffled = [...names].sort(() => Math.random() - 0.5);

    return shuffled.slice(0, 2);
}

const maxWorkerNameLength = Math.max(...names.map(n => n.length));

function spacesBeforeAction(name) {
    return spaceCreator(maxWorkerNameLength - name.length + 2);
}

const sleepingTime = "23:00";
const wakingTime = "08:00";

function getNewYorkTimeParts() {
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/New_York",
        hour: "numeric",
        minute: "numeric",
        hour12: false,
    }).formatToParts(new Date());

    const hour = Number(parts.find(part => part.type === "hour").value);
    const minute = Number(parts.find(part => part.type === "minute").value);
    return { hour: hour === 24 ? 0 : hour, minute };
}

function isSleeping() {
    const { hour, minute } = getNewYorkTimeParts();
    const currentTime = hour * 60 + minute;

    const [sleepHour, sleepMinute] = sleepingTime.split(":").map(Number);
    const [wakeHour, wakeMinute] = wakingTime.split(":").map(Number);

    const sleep = sleepHour * 60 + sleepMinute;
    const wake = wakeHour * 60 + wakeMinute;

    if (sleep > wake) {
        return currentTime >= sleep || currentTime < wake;
    }

    return currentTime >= sleep && currentTime < wake;
}

let length = 5;
const heightLimit = 22;

function isChineseOrJapanese(text) {
    return /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/.test(text);
}

function isEnglish(text) {
    return /[a-zA-Z]/.test(text);
}

function normalizeDatasetText(text) {
    // ignore original line breaks from the dataset
    return String(text).replace(/[\r\n]+/g, " ");
}

function isWhitespace(char) {
    return /\s/.test(char);
}

function takeChars(text, count) {
    let chars = "";
    for (const char of text) {
        if (isWhitespace(char)) continue;
        chars += char;
        if (chars.length >= count) break;
    }
    return chars;
}

function takeEnglishWord(text) {
    if (!text || !text.trim()) return "";

    let i = Math.floor(Math.random() * text.length);

    while (i < text.length && isWhitespace(text[i])) i++;
    if (i >= text.length) {
        i = text.length - 1;
        while (i > 0 && isWhitespace(text[i])) i--;
    }
    if (isWhitespace(text[i])) return "";

    while (i > 0 && !isWhitespace(text[i - 1])) {
        i--;
    }

    let end = i;
    while (end < text.length && !isWhitespace(text[end])) {
        end++;
    }

    return text.slice(i, end);
}

function takeChunk(text) {
    text = normalizeDatasetText(text);

    if (isChineseOrJapanese(text)) {
        const count = 1 + Math.floor(Math.random() * 3);
        return takeChars(text, count);
    }

    if (isEnglish(text)) {
        return takeEnglishWord(text);
    }

    const count = 3 + Math.floor(Math.random() * 4);
    return takeChars(text, count);
}

function initialize(json) {
    let result = "";
    let charsOnLine = 0;
    let height = 0;
    const shuffled = [...json].sort(() => Math.random() - 0.5);

    for (const element of shuffled) {
        if (height >= heightLimit) break;

        const text = element.message || element.text || "";
        const chunk = takeChunk(text);

        for (const char of chunk) {
            if (height >= heightLimit) break;
            if (isWhitespace(char)) continue;

            result += char;
            charsOnLine++;

            if (charsOnLine === length) {
                result += "\n";
                charsOnLine = 0;
                height++;
                length++;
            }
        }
    }

    return result;
}

function hasTakeableChars(text) {
    return /[^\s]/.test(text);
}

function rebuildBabelTower(json) {
    length = 5;
    babelTower = initialize(json);
    initializedBabelTower = true;
}

let initializedBabelTower = false
let babelTower = ""

function getNextChar(obj) {
    while (obj.text.length > 0) {
        let char = obj.text[0];
        obj.text = obj.text.slice(1);

        if (isWhitespace(char)) {
            continue
        }
        return char;
    }

    return "";
}

function spaceCreator(length){
    let result = ""
    for(let i = 0; i < length; i++){
        result += " "
    }
    return result
}

setInterval(async () => {
    let url = "http://161.35.13.67:6003/get-data";

    let response = await fetch(url)
    let json = await response.json()
    let post = ""

    if (!initializedBabelTower || !hasTakeableChars(babelTower)) {
        rebuildBabelTower(json)
    }

    let workers = getRandomNames(names);
    let firstAction = spacesBeforeAction(workers[0]) + "zzz";
    let secondAction = spacesBeforeAction(workers[1]) + "zzz";
    let sky = "القمر MOON";

    if (!isSleeping()) {
        sky = "لشمس SUN";

        let building = { text: babelTower };
        firstAction = spacesBeforeAction(workers[0]) + "picks off  " + getNextChar(building) + " ";
        secondAction = spacesBeforeAction(workers[1]) + "picks off  " + getNextChar(building) + " ";
        babelTower = building.text;

        if (!hasTakeableChars(babelTower)) {
            rebuildBabelTower(json)
        }
    }

    post += "@" + workers[0] + firstAction + "\n"
    post += "@" + workers[1] + secondAction + "\n"
    post += "\n"
    post += "\n"
    post += "\n"
    post += "\n"
    post += sky + "\n"
    post += "\n"
    post += "\n"
    post += "\n"
    post += "\n"
    post += "\n"
    post += "\n"
    post += "\n"
    post += "\n"
    post += "سقوط" + "THE FALL OF" + "\n"
    post += "بابل" + "BABEL" + "\n"
    post += "\n"
    post += "\n"
    post += "\n"
    post += "\n"
    post += "\n"
    post += "\n"
    post += "\n"
    post += "\n"
    post += babelTower

    if (isSleeping() && Math.random() < 0.2) {
        makeStatus(post)
    }
    else{
        makeStatus(post)
    }
    
}, 720000);
