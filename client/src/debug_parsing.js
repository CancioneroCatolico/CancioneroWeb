
const regex = /\[(.*?)\]([^\[]*)/g;
const line = "[LA] [DO#m] [RE]";
const segments = [];
let match;
while ((match = regex.exec(line)) !== null) {
    segments.push({ chord: match[1], text: match[2] });
}
console.log(JSON.stringify(segments, null, 2));
