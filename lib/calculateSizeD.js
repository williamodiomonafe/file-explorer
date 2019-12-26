const child_process = require("child_process");


const calculateSizeD = itemFullStaticPath => {
    const cleanedPath = itemFullStaticPath.replace(/\s/g, '/ ');


    const commandOutput = child_process.execSync(`du -sh ${cleanedPath}`).toString();

    const humanReadableSize = commandOutput.replace(/\s/g, '').split('/')[0];

    const sizeUnits = "BKMGT";
    let sizeInBytes = humanReadableSize.replace(/[a-z]/g, '');
    let sizeUnit = humanReadableSize.replace(/\d|\./g, '');
    sizeInBytes = parseFloat(sizeInBytes) * Math.pow(1000, sizeUnits.indexOf(sizeUnit));

    return [humanReadableSize, sizeInBytes];
}


module.exports = calculateSizeD;