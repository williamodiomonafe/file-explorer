const path = require('path');

const buildBreadcrumb = pathname => {
    let link = '/';
    let breadcrumb = ``;
    let pathBits = pathname.split('/');
    breadcrumb += `<li class="breadcrumb-item"><a href="${link}">Home</a></li>`;
    pathBits = pathBits.filter((bits) => bits !== '');

    pathBits.forEach((value, index) => {
        link  = path.join(link, value);
        value = value[0].toUpperCase() + value.slice(1);
        if(index !== pathBits.length - 1) {
            breadcrumb += ` <li class="breadcrumb-item"><a href="${link}">${value}</a></li>`;
        } else {
            breadcrumb += ` <li class="breadcrumb-item active" aria-current="page">${value}</li>`;
        }
    });
 
    return breadcrumb;
}; 




module.exports = buildBreadcrumb;