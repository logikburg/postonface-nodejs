var express = require('express');
var bodyParser = require("body-parser");
var morgan = require('morgan');
var fs = require('fs');
var async = require('async');
var request = require('request');
const path = require('path');

// initialize the express module
var app = express();
app.use(morgan('dev')); // log every request to the console

// create application/json parser
var jsonParser = bodyParser.json();
var textParser = bodyParser.text();

app.use(bodyParser.urlencoded({
    extended: true
}));

/**bodyParser.json(options)
 * Parses the text as JSON and exposes the resulting object on req.body.
 */
app.use(bodyParser.json());

var f = require('fabric'),
    __fabric = global.fabric = f.fabric,
    // Cufon = global.Cufon = modFabric.Cufon,
    http = require('http'),
    url = require('url');

// set the port of our application
// process.env.PORT lets the port be set by Heroku
var PORT = process.env.PORT || 8080;

__fabric.Object.prototype.originX = __fabric.Object.prototype.originY = 'center';

function serveImage(__response, __code, __async) {
    var canvas = __fabric.createCanvasForNode(200, 200);

    console.log("__dirname : " + __dirname);

    var font = new canvas.Font('Arial', __dirname + '/assets/fonts/Arial.ttf');

    font.addFace(__dirname + '/assets/fonts/Arial Bold.ttf', 'bold');
    font.addFace(__dirname + '/assets/fonts/Arial Italic.ttf', 'normal', 'italic');
    font.addFace(__dirname + '/assets/fonts/Arial.ttf', 'bold', 'italic');

    canvas.contextContainer.addFont(font); // when using createPNGStream or createJPEGStream
    canvas.contextTop.addFont(font); // when using toDataURL or toDataURLWithMultiplier

    //eval(__code);

    canvas.loadFromJSON(json, canvas.renderAll.bind(canvas));

    __response.writeHead(200, {
        'Content-Type': 'image/png'
    });

    if (__async !== 'true') {
        proceed();
    }

    function proceed() {
        // canvas.renderAll();
        var __stream = canvas.createPNGStream();
        __stream.on('data', function(chunk) {
            __response.write(chunk);
        });
        __stream.on('end', function() {
            __response.end();
        });
    }
}

// get an instance of the router for api routes
var apiRoutes = express.Router();

apiRoutes.post('/jsonToImage', function(req, res) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    // Request headers you wish to allow
    res.setHeader("Access-Control-Allow-Headers", 'x-access-token, Accept, Content-Type');

    console.log("__dirname : " + __dirname);

    var canvas = __fabric.createCanvasForNode(480, 320);

    var fontArial = new canvas.Font('Arial', path.join(__dirname, '/assets/fonts/Arial.ttf'));
    var fontAclonica = new canvas.Font('Aclonica', path.join(__dirname, '/assets/fonts/Aclonica.ttf'));
    var fontkruti = new canvas.Font('Kruti Dev 010', path.join(__dirname, '/assets/fonts/k010.ttf'));

    //font.addFace(__dirname + '/assets/fonts/Arial Bold.ttf', 'bold');
    //font.addFace(__dirname + '/assets/fonts/Arial Italic.ttf', 'italic');

    const fonts = [{
            name: 'Arial',
            src: path.join(__dirname, '/assets/fonts/Arial.ttf')
        },
        {
            name: 'Aclonica',
            src: path.join(__dirname, '/assets/fonts/Aclonica.ttf')
        },
        {
            name: 'Mangal',
            src: path.join(__dirname, '/assets/fonts/Mangal.ttf')
        }
    ];

    const notFound = [];

    fonts.forEach((font) => {
        if (!fs.statSync(font.src).isFile()) {
            console.log("not found font.src : " + font.src);
            notFound.push(font);
            return;
        }

        console.log("font.src : " + font.src);

        var font = new canvas.Font(font.name, font.src);
        canvas.contextContainer.addFont(font);
    });

    // when using createPNGStream or createJPEGStream
    // canvas.contextContainer.addFont(fontArial);
    // canvas.contextContainer.addFont(fontAclonica);
    // canvas.contextContainer.addFont(fontkruti);

    //parseJson = JSON.parse(jsonData);

    console.log("request body");
    console.log(JSON.stringify(req.body));

    var imgComponents = [];

    parseJson = req.body;
    for (var p in parseJson) {
        var objInJson = parseJson[p];
        console.log(Array.isArray(objInJson));
        if (Array.isArray(objInJson)) {
            for (var prop in objInJson) {
                var obj = objInJson[prop];
                if (obj.hasOwnProperty('type') && obj['type'] == "image") {
                    imgComponents.push(obj);
                }
                for (var inObj in obj) {
                    if (obj[inObj] == "") {
                        continue;
                        //} else if (obj[inObj] == true || !obj[inObj] == false) {
                        //    continue;
                    } else if (obj[inObj] == "true" || obj[inObj] == "false") {
                        obj[inObj] = (obj[inObj] === "true") ? true : false;
                    } else if (!isNaN(obj[inObj])) {
                        obj[inObj] = Number.parseFloat(obj[inObj]);
                    } else if (obj[inObj] == "null") {
                        obj[inObj] = null;
                    }
                }
            }
        } else {
            for (var inprop in objInJson) {
                if (objInJson[inprop] == "") {
                    continue;
                    //} else if (objInJson[inprop] == true || objInJson[inprop] == false) {
                    //    continue;
                } else if (objInJson[inprop] == "true" || objInJson[inprop] == "false") {
                    objInJson[inprop] = (objInJson[inprop] === "true") ? true : false;
                } else if (!isNaN(objInJson[inprop])) {
                    objInJson[inprop] = Number.parseFloat(objInJson[inprop]);
                } else if (objInJson[inprop] == "null") {
                    objInJson[inprop] = null;
                }
            }
        }
    }

    console.log("parseJson");
    console.log(JSON.stringify(parseJson));

    canvas.loadFromJSON(parseJson, function() {
        canvas.renderAll();
        canvas.calcOffset();

        // var img = canvas.toDataURL('png');
        // res.write(img);
        // res.end();
        res.writeHead(200, {
            'Content-Type': 'image/png'
        });

        var stream = canvas.createPNGStream();
        stream.on('data', function(imgdata) {
            res.write(imgdata);
        });
        stream.on('end', function() {
            res.end();
        });

        //var stream = canvas.createPNGStream();
        //var outfile = fs.createWriteStream(__dirname + '/output/temp.png');
        //stream.on('data', function (chunk) {
        //        outfile.write(chunk);
        //});
        //res.end(img, 'binary');
        //stream.on('end', function () {
        //        res.end();
        //});
    });
});

apiRoutes.get('/status', function(req, res) {
    res.json({
        status: 'OK'
    });
});


// apply the routes to our application with the prefix /api
app.use('/api', apiRoutes);

var server = app.listen(PORT, function() {
    var host = server.address().address;
    var port = server.address().port;
    console.log("listening at http://%s:%s", host, port);
});
