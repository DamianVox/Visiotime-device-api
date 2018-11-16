let express = require('express');
let app = express();
const {
    Pool
} = require('pg');

const conf = {
    database: `visiopix`,
    host: 'localhost',
    user: 'postgres',
    password: `postgres`,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
}

let port = 3000;

app.get(`/iclock/cdata`, async (request, response) => {
    console.log(" ");
    response.header["content-type"] = "text/plain";
    console.log(request.query);

    let d = new Date();

    console.log(`Device Pushed: ${d}`)
    const device_SN = request.query.SN;
    console.log(`Device SN: ${device_SN}`);
    const device_OP = request.query.options;
    console.log(`Device Options: ${device_OP}`);
    const device_PS = request.query.pushver;
    console.log(`Device Push Version: ${device_PS}`);
    const device_LN = request.query.language;
    console.log(`Device Language: ${device_LN}`);

    let cmd = "";

    let pool = new Pool(conf);
    pool.query(`select * from device_setup where device_serial='${device_SN}'`, (err, res) => {
        if (res) {
            if (res.rows.length === 0) {
                let d = new Date();

                response.header['Server'] = 'visiotime';
                response.header['Date'] = `${d}`;
                response.header['Content-Type'] = 'text/plain';
                response.header['Content-Length'] = `1`;
                response.header['Connection'] = 'close';
                response.header['Pragma'] = 'no-cache';
                response.header['Cache-Control'] = 'no-store';
                response.send("OK\n");
            } else {

                res.rows.forEach(element => {
                    cmd = `${element.cmd}\n`;
                });
                let d = new Date();

                response.header['Server'] = 'visiotime';
                response.header['Date'] = `${d}`;
                response.header['Content-Type'] = 'text/plain';
                response.header['Connection'] = 'close';
                response.header['Pragma'] = 'no-cache';
                response.header['Cache-Control'] = 'no-store';
                console.log(cmd)
                let SNreplace = "SN#SN"
                let NLreplace = "$%#$#";

                cmd = cmd.replace(SNreplace, `${device_SN}`);
                cmd = cmd.split(NLreplace).join("\n");


                console.log(cmd);
                response.send(cmd);
            }
        }
    })

    //response.send(`GET OPTION FROM:${device_SN}\nStamp=82983982\nOpStamp=9238883\nErrorDelay=60\nDelay=10\nTransTimes=00:00;14:05\nTransInterval=1\nTransFlag=1111000000\nEncrypt=0`);
    //response.send(`GET OPTION FROM:${device_SN}\nStamp=82983982\nOpStamp=9238883\nErrorDelay=60\nDelay=10\nTransTimes=00:00;14:05\nTransInterval=1\nTransFlag=1111000000\nRealtime=1\nEncrypt=0`);
    //return response.send(`OK\n`);
})
function replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
}

app.get(`/iclock/getrequest`, (request, response) => {
    let pool = new Pool(conf);
    const device_SN = request.query.SN;

    let cmds = "";

    console.log(" ");
    console.log("getrequest Trigered ");
    //response.header["content-type"] = "text/plain";
    console.log(request.query);

    pool.query(`select * from device_cmds where device_serial='${device_SN}' and done=false order by date_initiated asc`, (err, res) => {
        if (res) {
            if (res.rows.length === 0) {
                let d = new Date();

                response.header['Server'] = 'visiotime';
                response.header['Date'] = `${d}`;
                response.header['Content-Type'] = 'text/plain';
                response.header['Content-Length'] = `1`;
                response.header['Connection'] = 'close';
                response.header['Pragma'] = 'no-cache';
                response.header['Cache-Control'] = 'no-store';
                response.send("OK\n");
            } else {

                res.rows.forEach(element => {
                    cmds += `${element.cmd}\n`;
                });
                let d = new Date();

                response.header['Server'] = 'visiotime';
                response.header['Date'] = `${d}`;
                response.header['Content-Type'] = 'text/plain';
                response.header['Connection'] = 'close';
                response.header['Pragma'] = 'no-cache';
                response.header['Cache-Control'] = 'no-store';
                console.log(cmds)
                let tabPlacment = "*#*#*"
                //cmds = cmds.replace(replacment, "\t");
                cmds = cmds.split(tabPlacment).join("\t");
                console.log(cmds);
                response.send(cmds);
            }
        }
    })
    //return response.send(`C:ID2:REBOOT`);
    //return response.send(`C:ID1:DATA UPDATE USERINFO PIN=20\tName=TESTING\tPassword=1234321\tCard=123456789\tGrp=1\tTZ=0000000000000000\tPri=0`);
    //return response.send(`C:ID1:DATA UPDATE USERINFO PIN=100\tName=Christo\tPasswd=4321\tGrp=1\tPri=0`);
    //response.send(`C:ID1:DATA QUERY ATTLOG StartTime=2018-11-13 00:00:00\tEndTime=2018-11-16 23:59:59`);
    //response.send(`C:ID1:DATA QUERY FINGERTMP PIN=1\tFingerID=1`);
    //response.send("C:ID1:DATA QUERY USERINFO PIN=1");
    //response.send("OK\n");
})



app.post(`/iclock/devicecmd`, (request, response) => {
    let pool = new Pool(conf);
    const device_SN = request.query.SN;
    console.log(" ");
    console.log("devicecmd Trigered ");

    let dat = [];
    let a = [];
    let b = [];
    let c = [];
    let moop = [];
    let body = '';
    let result;

    request.on('data', chunk => {
        body += chunk.toString();

        //console.log(dat);
        //console.log(dat);
    })
    request.on('end', () => {
        moop = body.split(/\s+/);

        for (let i = 0; i < moop.length - 1; i++) {
            a = moop[i].split("&");

            b = a[0].split("=");
            pool.query(`update device_cmds set done=true, date_completed=now() where device_serial='${device_SN}' and cmd_id='${b[1]}'`, (err, res) => {
                if (res) {
                    console.log("WHOOP WHOOP");
                }
            })
        }

        let d = new Date();

        response.header['Server'] = 'visiotime';
        response.header['Date'] = `${d}`;
        response.header['Content-Type'] = 'text/plain';
        response.header['Content-Length'] = `1`;
        response.header['Connection'] = 'close';
        response.header['Pragma'] = 'no-cache';
        response.header['Cache-Control'] = 'no-store';
        response.send("OK\n");

        console.log(dat);
        //response.send("OK\n");
    });

})

app.post(`/iclock/cdata`, (request, response) => {
    console.log(" ");
    console.log("cdata Trigered ");

    //response.header["content-type"] = "text/plain";
    //console.log(request.query);

    //let bleep = request .data;
    console.log("Table: " + request.query.table);

    let data = [];
    let dat = [];
    let moop = [];

    let body = '';

    let l;
    if (request.query.table === "ATTLOG") {
        console.log("ATTLOG Trigered ");


        request.on('data', chunk => {
            body += chunk.toString();

            //console.log(dat);
            //console.log(dat);
        })
        request.on('end', () => {
            //body.split(/\s+/);
            console.log(body);

            response.send("OK\n");
        });

    } else if (request.query.table === "OPERLOG") {
        console.log("OPERLOG Trigered ");

        //let data = [];
        request.on('data', chunk => {
            body += chunk.toString();

            //console.log(dat);
            //console.log(dat);
        })
        request.on('end', () => {
            //body.split(/\s+/);
            //console.log(body);
            moop = body.split(/\s+/);
            //console.log(moop);
            if (moop[0] === "FP") {
                console.log("FP DATA!!");
                data = body.split("FP ");
                //data = data.shift();

                for (let i = 1; i < data.length; i++) {
                    dat.push({
                        FP: data[i]
                    });
                }

                let d = new Date();
                l = dat.length;

                console.log(d + " Content Length: " + l);

                response.header['Server'] = 'visiotime';
                response.header['Date'] = `${d}`;
                response.header['Content-Type'] = 'text/plain';
                response.header['Content-Length'] = `${l}`;
                response.header['Connection'] = 'close';
                response.header['Pragma'] = 'no-cache';
                response.header['Cache-Control'] = 'no-store';

                dataControll(dat);

            } else if (moop[0] === "USER") {
                console.log("USER DATA!!");
                data = body.split("USER");
                //data = data.split(/\s+/);
                for (let i = 1; i < data.length; i++) {
                    dat.push({
                        USER: data[i]
                    });
                }

                let d = new Date();
                l = dat.length;

                console.log(d + " Content Length: " + l);

                response.header['Server'] = 'visiotime';
                response.header['Date'] = `${d}`;
                response.header['Content-Type'] = 'text/plain';
                response.header['Content-Length'] = `${l}`;
                response.header['Connection'] = 'close';
                response.header['Pragma'] = 'no-cache';
                response.header['Cache-Control'] = 'no-store';

                dataControll(dat);

            } else {
                console.log("YOU ARE HERE: " + moop);
            }


            response.send(`OK:${l}\n`);
        });
    }

    //return response.send("OK\n");

})

async function dataControll(dat) {
    console.log(dat);

}

//app.request("");
app.listen(port, () => console.log(`MB20 API listening on port ${port}!`))