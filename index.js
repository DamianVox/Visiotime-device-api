let express = require('express');
let app = express();
const {
    Pool
} = require('pg');

const conf = {
    database: `visiotime`,
    host: 'localhost',
    user: 'postgres',
    password: `postgres`,
    port: 5433,
    max: 100,
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
    const device_SN = request.query.SN;

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

            dataControll("ATTLOG", dat, device_SN);
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
                    dat.push(
                        data[i]
                    );
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

                dataControll("FP", dat, device_SN);

            } else if (moop[0] === "USER") {
                console.log("USER DATA!!");
                data = body.split("USER");
                //data = data.split(/\s+/);
                for (let i = 1; i < data.length; i++) {
                    dat.push(
                        data[i]
                    );
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

                dataControll("USER", dat, device_SN);

            } else {
                console.log("YOU ARE HERE: " + moop);
            }


            response.send(`OK:${l}\n`);
        });
    }

    //return response.send("OK\n");

})

async function dataControll(type, dat, sn) {

    let pool = new Pool(conf);
    let client;

    let a = [];
    let b = [];

    let c = [];
    let d = [];
    let e = [];
    let f = [];
    let g = [];
    let h = [];
    let i = [];
    let j = [];

    if (type === "FP") {
        //console.log(dat);

        dat.forEach(element => {
            let first = element.toString();
            a = first.split("\t");
            b.push({
                pin: a[0],
                fid: a[1],
                size: a[2],
                valid: a[3],
                tmp: a[4]
            });

            b.forEach(element => {
                c = element.pin.split("=");
                d = element.fid.split("=");
                e = element.size.split("=");
                f = element.valid.split("=");
                g = element.tmp.split("=");
    
            });

            let user_id = c[1].toString();
            let user_fID = d[1].toString();
            let user_size = e[1].toString();
            let user_valid = f[1].toString();
            let user_tmp = g[1].toString();

            user_id = user_id.replace("\n", "");
            user_fID = user_fID.replace("\n", "");
            user_size = user_size.replace("\n", "");
            user_valid = user_valid.replace("\n", "");
            user_tmp = user_tmp.replace("\n", "");

            let query = "update employees set";

            if(user_fID === '0'){
                query += ` fp_one='${user_tmp}'`;
            }
            if(user_fID === '1'){
                query += ` fp_two='${user_tmp}'`;
            }
            if(user_fID === '2'){
                query += ` fp_three='${user_tmp}'`;
            }
            if(user_fID === '3'){
                query += ` fp_four='${user_tmp}'`;
            }
            if(user_fID === '4'){
                query += ` fp_five='${user_tmp}'`;
            }
            if(user_fID === '5'){
                query += ` fp_six='${user_tmp}'`;
            }
            if(user_fID === '6'){
                query += ` fp_seven='${user_tmp}'`;
            }
            if(user_fID === '7'){
                query += ` fp_aight='${user_tmp}'`;
            }
            if(user_fID === '8'){
                query += ` fp_nine='${user_tmp}'`;
            }
            if(user_fID === '9'){
                query += ` fp_ten='${user_tmp}'`;
            }


            // console.log(user_id);
            // console.log(user_fID);
            // console.log(user_size);
            // console.log(user_valid);
            // console.log(user_tmp);

             //client =  pool.connect();

        try {
            try {
                pool.query(`select company_id, site_id from device where serial='${sn}' and active=true`, (error, result)=>{
                    if (result.rows.length === 0){

                    }else{
            
            let comp_id;
            let si_id;
            
            
            result.rows.forEach(element => {
                            comp_id = element.company_id;
                            si_id = element.site_id;
                        });
            
                        query += ` where company_id='${comp_id}' and device_id='${user_id}' and site_id='${si_id}'`
            
                        //console.log(query);
                   //client =  pool.connect();
            
                        try {
                            try {
            
                                pool.query(query);
                            } catch (err) {
                                console.log(err);
                                throw err;
                            }
                        } finally {
                            //pool.release();
                        }
                    }
            
                });
            } catch (err) {
                console.log(err);
                throw err;
            }
        } finally {
            //pool.release();
        }


        });
        

    } else if (type === "USER") {
        //console.log(dat);

        dat.forEach(element => {
            let first = element.toString();
            a = first.split("\t");
        });
        console.log(a);

        b.push({
            pin: a[0],
            name: a[1],
            pri: a[2],
            passwd: a[3],
            card: a[4],
            grp: a[5],
            tz: a[6],
            verify: a[7]
        })

        b.forEach(element => {
            c = element.pin.split("=");
            d = element.name.split("=");
            e = element.pri.split("=");
            f = element.passwd.split("=");
            g = element.card.split("=");
            h = element.grp.split("=");
            i = element.tz.split("=");
            j = element.verify.split("=");
        });

        let user_id = c[1].toString();
        let user_name = d[1].toString();
        let user_pri = e[1].toString();
        let user_password = f[1].toString();
        let user_card = g[1].toString();
        let user_group = h[1].toString();
        let user_time_zone = i[1].toString();
        let user_verify = j[1].toString();
        user_verify = user_verify.replace("\n", "")
        let query = "update employees set";

        if(user_name.length >= 1){
            query += ` name='${user_name}'`;
        }
        if(user_pri.length >= 1){
            query += `, pri='${user_pri}'`;
        }
        if(user_password.length >= 1){
            query += `, password='${user_password}'`;
        }
        if(user_card.length >= 1){
            query += `, card='${user_card}'`;
        }
        if(user_group.length >= 1){
            query += `, groupp='${user_group}'`;
        }
        if(user_time_zone.length >= 1){
            query += `, time_zone='${user_time_zone}'`;
        }
        if(user_verify.length >= 1){
            query += `, verify='${user_verify}'`;
        }

        console.log(user_id);
        console.log(user_name);
        console.log(user_pri);
        console.log(user_password);
        console.log(user_card);
        console.log(user_group);
        console.log(user_time_zone);
        console.log(user_verify);

         client = await pool.connect();

        try {
            try {
                res = await client.query(`select company_id, site_id from device where serial='${sn}' and active=true`);
            } catch (err) {
                console.log(err);
                throw err;
            }
        } finally {
            client.release();
        }

        if (res.rows.length === 0){
            // client = await pool.connect();

            // try {
            //     try {
            //         res = await client.query(`insert into employees values('5', )`);
            //     } catch (err) {
            //         console.log(err);
            //         throw err;
            //     }
            // } finally {
            //     client.release();
            // }
        }else{

let comp_id;
let si_id;


            res.rows.forEach(element => {
                comp_id = element.company_id;
                si_id = element.site_id;
            });

            query += ` where company_id='${comp_id}' and device_id='${user_id}' and site_id='${si_id}'`

            console.log(query);
       client = await pool.connect();

            try {
                try {


                    // let user_id = c[1];
                    // let user_name = d[1];
                    // let user_pri = e[1];
                    // let user_password = f[1];
                    // let user_card = g[1];
                    // let user_group = h[1];
                    // let user_time_zone = i[1];
                    // let user_verify = j[1];

                    await client.query(query);
                } catch (err) {
                    console.log(err);
                    throw err;
                }
            } finally {
                client.release();
            }
        }

  


        // a.forEach(element => {
        //     let second = element.toString();
        //     b.push(second.split("="));
        // });
        //console.log(b);

    } else if (type === "ATTLOG") {
        //console.log(dat);
    }

    //console.log(dat);

}

//app.request("");
app.listen(port, () => console.log(`VisioTime API listening on port ${port}!`))