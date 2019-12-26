// file imports
const url = require('url');
const path = require('path');
const fs = require('fs');
const buildBreadcrumb = require('./breadcrumb.js');
const buildMainContent = require('./mainContent.js');
const getMimeType = require('./getMimeType.js');

// static base path: location of your static folder

const staticBasePath = path.join(__dirname, '..', 'static');

// respond to a request
// Following is a function passed to createServer used to create the server
const respond = (request, response) => {
    //  before working with pathname, you need to decode it
    let pathname = url.parse(request.url, true).pathname;

    // if favicon.ico
    if(pathname === '/favicon.ico') {
        return false;
    }

    pathname = decodeURIComponent(pathname);

    // get the corresponding full static path located in the static folder
    const fullStaticPath = path.join(staticBasePath, pathname);
    
    // can we find something in fullStaticPath?
    if(!fs.existsSync(fullStaticPath)) {
        response.write(`404: File not found!`);
        response.end();
        return false;
    }

    //we found something
    // is it a file or directory?
    let stats;
    try {
        stats = fs.lstatSync(fullStaticPath);
    } catch(err) {
        console.log(`lstatSync Error: ${err}`);
    } 

    // It is a directory:
    if(stats.isDirectory()) {       
        // get content from the template index.html
        let data = fs.readFileSync(path.join(staticBasePath, 'project_files/index.html'), 'utf-8');
        
        //build the page title
        let pathElements = pathname.split('/');
        pathElements = pathElements.filter(element => element !== '');
        let folderName = 'Home - File Explorer';
        if(pathElements.length > 0) {
            folderName = pathElements[0];
            folderName = folderName[0].toUpperCase() + folderName.slice(1);
        }

        // build the breadcrumb
        const breadcrumb = buildBreadcrumb(pathname);


        // build table rows (main_content)
        const mainContent = buildMainContent(fullStaticPath, pathname);


        // fill the template date with: the page title, breadcrumb and table rows (main_content)

        data = data.replace('page_title', folderName);
        data = data.replace('pathname', breadcrumb);
        data = data.replace('mainContent', mainContent);

        // print data to the webpage
        response.statusCode = 200;
        response.write(data);
        return response.end();
    }

    if(!stats.isFile()) {
        response.statusCode = 401;
        response.write('401: Access Denied!');
        console.log('not a file');
        return response.end();
    }

    let fileDetails = {};

    // get file extension
    fileDetails.extname = path.extname(fullStaticPath);

    let stat;
    try {
        stat = fs.statSync(fullStaticPath);
    } catch(err) {
        console.log(`Error ${err}`);
    };

    fileDetails.size = stat.size;
    // get file mime type for browser readability
    getMimeType(fileDetails.extname)
        .then(mime => {
            let head = {};
            let options = {};

            // set default statusCode to 200
            let statusCode = 200;

            head['Content-Type'] = mime;

            // if file type is .pdf then set to inline Disposition
            if(fileDetails.extname === '.pdf') {
                head['Content-Disposition'] = 'inline';
                // head['Content-Disposition'] = 'attachment;filename=file.pdf';
            } 
            
            // if audio/video file? --> strean in ranges
            if(RegExp('audio').test(mime) || RegExp('video').test(mime)) {
                head["Accept-Ranges"] = "bytes";

                const range = request.headers.range;
                if(range) {
                    const start_end = range.replace(/bytes=/, "").split('-');
                    
                    const start = parseInt(start_end[0]);
                    const end = start_end[1] ? parseInt(start_end[1]) : fileDetails.size - 1;

                    head['Content-Range'] = `bytes ${start} - ${end}/${fileDetails.size}`;

                    head['Content-Length'] = end - start + 1;
                    statusCode = 206;

                    options = {start, end};
                }
            }

            const fileStream = fs.createReadStream(fullStaticPath, options);
            
            response.writeHead(statusCode, head);
            fileStream.pipe(response);

            fileStream.on('close', () => {
                return response.end();
            });

            fileStream.on('error', (err) => {
                console.log(err.code);
                response.statusCode = 404;
                response.write(`404: File Stream error`);
                return response.end();
            });
            // fs.promises.readFile(fullStaticPath, 'utf-8')
            //     .then(data => {
            //         response.writeHead(statusCode, head);
            //         response.write(data);
            //         return response.end();
            //     })
            //     .catch(err => {
            //         console.log(`Error: ${err}`);
            //         response.statusCode = 404;
            //         response.write(`404: File reading error`);
            //         return response.end();
            //     });
        })
        .catch(err => {
            response.statusCode = 500;
            response.write(`500: Internal Server Error`);
            console.log(`Promise Error: ${err}`);
            return response.end();
        });


}

module.exports = respond;

