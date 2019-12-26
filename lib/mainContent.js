const fs = require('fs');
const path = require('path');
const calculateSizeD = require("./calculateSizeD.js");
const calculateSizeF = require("./calculateSizeF.js");

const buildMainContent = (fullStaticPath, pathname) => {
    itemDetails = {};

    let mainContent = '';
    // loop through the elements inside the folder
    // name and link
    try{
        itemDetails.items = fs.readdirSync(fullStaticPath);
    } catch(err) {
        console.log(`${err}`);
    }

    // remove .DS_store and other unwanted files
    itemDetails.items = itemDetails.items.filter(element => element !== '.DS_Store');

    // Home directory remove project_files
    if(pathname === '/') {
        itemDetails.items = itemDetails.items.filter(element => !['project_files'].includes(element));
    }

    //ge the following elements for each item
    itemDetails.items.forEach(item => {
        // name
        itemDetails.name = item;
        itemDetails.link = path.join(pathname, item);
        
        itemDetails.fullStaticPath = path.join(fullStaticPath, item); 

        try {
            itemDetails.stats = fs.statSync(itemDetails.fullStaticPath);
        }catch(err) {
            console.log(`${err}`);
            return false;
        }

        if(itemDetails.stats.isDirectory()) {
            itemDetails.icon = '<ion-icon name="folder"></ion-icon>';

            [itemDetails.size, itemDetails.sizeInBytes] = calculateSizeD(itemDetails.fullStaticPath);
            
            // console.log(itemDetails);
        } else if(itemDetails.stats.isFile()) {
            itemDetails.icon = '<ion-icon name="document"></ion-icon>';

            [itemDetails.size, itemDetails.sizeInBytes] = calculateSizeF(itemDetails.stats);
        }

        itemDetails.timeStamp = parseInt(itemDetails.stats.mtimeMs);
        itemDetails.date = new Date(itemDetails.timeStamp).toLocaleString();

        mainContent += `<tr data-item="${itemDetails.name}" data-size="${itemDetails.sizeInBytes}" data-time="${itemDetails.timeStamp}">
                <td>${itemDetails.icon}<a target="${itemDetails.stats.isFile() ? '_blank' : '' }" href="${itemDetails.link}">${itemDetails.name}</a></td>
                <td>${itemDetails.size}</td>
                <td>${itemDetails.date}</td>
            </tr>`;

        //size
        //last modified
    });
    
    return mainContent;
};


module.exports = buildMainContent;