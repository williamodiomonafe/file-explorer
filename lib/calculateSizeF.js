const child_process = require("child_process");


const calculateSizeF = stats => {
    const sizeInBytes = stats.size;
    const units = "BKMGT";

    sizeIndex = Math.floor(Math.log10(sizeInBytes)/3);
    let humanReadableSize = (sizeInBytes/Math.pow(1000,sizeIndex)).toFixed(1);

    humanReadableSize = `${humanReadableSize}${units[sizeIndex]}`;

    return [humanReadableSize, sizeInBytes];
}


module.exports = calculateSizeF;