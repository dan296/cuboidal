import { CubeMap } from "../interfaces/CubeMap";
import { WordMap } from "../interfaces/WordMap";

const threeLetterWords = [
    "cat", "dog", "bat", "rat", "sun", "run", "fun", "box", "fix", "mix",
    "max", "pop", "zip", "lip", "tip", "top", "bit", "fit", "hit", "kit",
    "net", "pet", "jet", "met", "let", "bet", "set", "get", "sit", "pit",
    "wit", "lit", "mat", "pat", "hat", "vat", "sat", "fat", "fan", "man",
    "pan", "tan", "ran", "ban", "can", "dam", "ham", "jam", "cab", "lab",
    "tab", "fab", "nab", "gap", "sap", "lap", "map", "nap", "tap", "cap",
    "rap", "zap", "yap", "sip", "dip", "hip", "lip", "tip", "nip", "rip",
    "pip", "cup", "pup", "sup", "hut", "cut", "nut", "but", "put", "gut",
    "tot", "bot", "cot", "dot", "got", "lot", "pot", "rot", "sot", "not",
    "hot", "bid", "did", "rid", "lid", "mid", "kid", "pod", "nod", "rod",
    "cod", "sod", "god", "fog", "hog", "jog", "log", "bog", "cog", "tog",
    "tag", "wag", "bag", "rag", "lag", "nag", "hag", "big", "dig", "pig",
    "wig", "fig"
];

// Example usage
const wordMap:WordMap = {
    "top": ["apple", "acres", "eagle", "slice"],
    "bottom": ["axles", "attic", "stick", "click"],
    "left": ["trick", "track", "knock", "knick"],
    "right": ["slash", "super", "happy", "rally"],
    "front": ["power", "poach", "roast", "heart"],
    "back": ["ether", "earth", "ropes", "hopes"]
};

function getRandomWords(array:string[], numWords:number, wordException = '') {
    // Filter out the wordException
    array = array.filter(word => word !== wordException);
    // Fisher-Yates shuffle algorithm
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array.slice(0, numWords);
}

const cubeThreeLetterWords = [...getRandomWords(threeLetterWords, 24)];

const opposites: { [key: string]: string } = {
    "top": "bottom",
    "left": "right",
    "front": "back"
}

function getThreeLetterWord(){
    const word = cubeThreeLetterWords[Math.floor(Math.random() * cubeThreeLetterWords.length)];
    cubeThreeLetterWords.splice(cubeThreeLetterWords.indexOf(word), 1);
    return word;
} 

function createCubeMap(wordMap: WordMap):CubeMap {
    const cubeMap = {};

    function addLetterToCubeMap(x:number, y:number, z:number, letter:string, cbMap:CubeMap, plane:keyof typeof opposites) {
        const key = `${x},${y},${z}`;
        if (!cbMap[key]) {
            cbMap[key] = {};
        }

        cbMap[key][plane] = letter;
    }
    function processPlane(plane: keyof typeof opposites, xModifier: CoordModifier, yModifier: CoordModifier, zModifier: CoordModifier) {
        let tmpCubeMap:CubeMap = {};
        const words = wordMap[plane];
        // For 3 letter words 
        const opp = opposites[plane] ?? Object.keys(opposites).find(key => opposites[key] === plane) ?? "top";
        
        let xInit = xModifier.initial;
        let yInit = yModifier.initial;
        words.forEach((word, wordIndex) => {
            const three_letter_word = getThreeLetterWord();
            if (wordIndex === 2) {
                xModifier.initial = -1 * xModifier.initial;
            } else {
                xModifier.initial = xInit;
            }
            if (wordIndex === 3) {
                yModifier.initial = -1 * yModifier.initial;
            } else {
                yModifier.initial = yInit;
            }
            xModifier.curr = xModifier.initial;
            yModifier.curr = yModifier.initial;
            for (let i = 0; i < word.length; i++) {
                if (wordIndex == 0 || wordIndex == 3) {
                    xModifier.curr = xModifier.initial + i * xModifier.increment;
                } else {
                    yModifier.curr = yModifier.initial + i * yModifier.increment;
                }
                // Determine which modifier has the coord "x"
                const coordMap = {
                    [xModifier.coord]: xModifier.curr,
                    [yModifier.coord]: yModifier.curr,
                    [zModifier.coord]: zModifier.curr
                };

                let key2 = `${coordMap.x},${coordMap.y},${coordMap.z}`;

                if (tmpCubeMap[key2]) {
                    if (tmpCubeMap[key2][plane] !== word[i]) throw new Error("letters don't match");
                    continue;
                }

                addLetterToCubeMap(coordMap.x, coordMap.y, coordMap.z, word[i], tmpCubeMap, plane);
                addLetterToCubeMap(coordMap.x, coordMap.y, coordMap.z, word[i], cubeMap, plane);
                
                if(i > 0 && i < word.length - 1){
                    addLetterToCubeMap(coordMap.x, coordMap.y, coordMap.z, three_letter_word[three_letter_word.length - (i)], cubeMap, opp);
                }

            }
        });
        tmpCubeMap = {};
    }

    class CoordModifier {
        initial:number;
        increment:number;
        coord:string;
        curr:number;
        constructor(initial:number, increment:number, coord:string) {
            this.initial = initial;
            this.increment = increment;
            this.coord = coord; //"x", "y", "z"
            this.curr = initial;
        }
    }

    // Process the "top" plane (0, 0, 1)
    let xMod = new CoordModifier(-1, 0.5, "x");
    let yMod = new CoordModifier(-1, 0.5, "z");
    let zMod = new CoordModifier(1, 0, "y");
    processPlane('top', xMod, yMod, zMod);

    // Process the "bottom" plane (0, 0, -1)
    xMod = new CoordModifier(-1, 0.5, "x");
    yMod = new CoordModifier(1, -0.5, "z");
    zMod = new CoordModifier(-1, 0, "y");
    processPlane('bottom', xMod, yMod, zMod);

    // Process the "left" plane (-1, 0, 0)
    xMod = new CoordModifier(-1, 0.5, "z");
    yMod = new CoordModifier(1, -0.5, "y");
    zMod = new CoordModifier(-1, 0, "x");
    processPlane('left', xMod, yMod, zMod);

    // Process the "right" plane (1, 0, 0)
    xMod = new CoordModifier(1, -0.5, "z");
    yMod = new CoordModifier(1, -0.5, "y");
    zMod = new CoordModifier(1, 0, "x");
    processPlane('right', xMod, yMod, zMod);

    // Process the "front" plane (0, -1, 0)
    xMod = new CoordModifier(-1, 0.5, "x");
    yMod = new CoordModifier(1, -0.5, "y");
    zMod = new CoordModifier(1, 0, "z");
    processPlane('front', xMod, yMod, zMod);

    //`Process the "back" plane (0, 1, 0)
    xMod = new CoordModifier(1, -0.5, "x");
    yMod = new CoordModifier(1, -0.5, "y");
    zMod = new CoordModifier(-1, 0, "z");
    processPlane('back', xMod, yMod, zMod);

    return cubeMap;
}

// Generating words
// Step 1: Gather 5 letter words into wordMap (use algorithm for chaining words)
// Step 2: Call createCubeMap(wordMap) to generate the cubeMap
// Step 3: Store CubeMap in redis
// Step 4: Call shuffle
// Step 5: Store shuffle in redis
// Step 6: Send cubeMap and shuffle to client
