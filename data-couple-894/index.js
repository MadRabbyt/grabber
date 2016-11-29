// "\\INETSERVER\C$\Program Files\CCProxy\Log\" log20161030.txt
var fs = require('fs');
var jsonfile = require('jsonfile');

// var logPath = "\\\\INETSERVER\\C$\\Program Files\\CCProxy\\Log\\";
// var logPath = "C:\\Work\\node\\data-couple-894\\lg\\";
var logPath = './lg/';
var cnt = 0;

Array.prototype.search = function (smpl) {
    var self = this;
    var result = -1;

};

var readLog = function (fn) {
    cnt += 1;
    console.log('>> ' + fn);
    if (/log20161122\.txt/.test(fn)) {
        var data = fs.readFileSync(fn);
        var strings = data.toString('ascii');
        var pic = {};
        // console.log(strings.length);
        var re = /(192\.168\.1\.\d+)\s-\s([^[]+)\[([^\]]+)\]\s(.*)/gi;
        while ((matches = re.exec(strings)) != null) {
            // if (!pic[matches[0]]) {
            //     pic[matches[0]] = 1;
            // } else {
            //     pic[matches[0]] += 1;
            // }
            // console.log(" > ", matches[0]);
            //// console.log(" >> ", matches[1]);
            // console.log(" >>> ", matches[2]);
            // console.log(" >>>> ", matches[3]);
            // console.log(" >>>>> ", matches[4]);
            if (matches[4]) {
                var url = /\"([^"]+)/.exec(matches[4]);
                // console.log(" >---> ",url[1]);
                if (url[1]) {
                    var uu = /(\w+)\s((http:\/\/)?[\.\-A-Za-z0-9]+)/.exec(url[1]);
                    if (uu) {
                        // console.log(" >> ", matches[1], " >----> ", uu[1], " >---> ", uu[2])//," (",url[1],")");
                        if (!pic[matches[1]]) {
                            pic[matches[1]] = {};
                        }

                        if (!pic[matches[1]][uu[1]]) {
                            pic[matches[1]][uu[1]] = {};
                        }

                        if (!pic[matches[1]][uu[1]][uu[2]]) {
                            pic[matches[1]][uu[1]][uu[2]] = 1;
                        } else {
                            pic[matches[1]][uu[1]][uu[2]] += 1;
                        }

                    }
                }
            }

        };
        // console.log(pic);

        console.log(fn.replace(/txt/, "json"));
        jsonfile.spaces = 4;
        jsonfile.writeFile(fn.replace(/txt/, "json"), pic, function (err) {
            if (err) {
                console.log(err);
            }
        });
        // if (matches.length>0) {
        //     console.log(matches[1]);
        // }
        // console.log(data.toString('ascii'));
        // console.log(JSON.stringify(data.toString('ascii')));

    }
};

fs.readdir(logPath, function (err, fileName) {
    for (i in fileName) {
        // console.log(fileName[i]);
        if(/^log/.test(fileName[i])) {
            readLog(logPath + fileName[i]);
        }
    };
});
