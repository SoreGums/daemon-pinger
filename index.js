/*
Copyright Nicholas Orr. All Rights Reserved.
Use of this source code is governed by an MIT-style
license that can be found in the LICENSE file
*/

const request = require('request');
const validUrl = require('valid-url');

/**
 * Calls /info on provided URL. Only responds to POST 'application/json'
 * Will return a JSON object, either the standard one expected when 
 * calling the Daemon's /info endpoint with a HTTP:200 or
 * { error: 'msg of error' } HTTP:500 / HTTP:400
 * 
 * It does return an extra object about the request, this used by the 
 * public-node-monitor app that is using this script to get daemon info
 *   { pingerInfo: { gcpRegion: 'us-east1', time: 200 } }
 * the GCP Region pinged from and the time in ms to complete the request
 * to the Daemon
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
exports.getInfo = (req, res) => {
    doWork(req, res);
};

async function doWork(req, res) {
    let code = 200;
    let response = {};
    
    // only allow POST
    if(req.method == 'POST') {
        
        // only deal with JSON
        if(req.get('content-type') == 'application/json') {
        
        // parse url is valid
        if(validUrl.isWebUri(req.body.url)) {
            
            // finally go ping the Daemon
            ({code, response} = await pingDaemon(req.body.url + '/info'));
        }
        else {
            code = 400;
            response.error = "no url or invalid url provided";
        }

        } else {
        code = 400;
        response.error = "only accepts application/json";
        }
        
    } else {
        code = 400;
        response.error = "only responds to POST requests";
    }
    
    res.status(code);
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(response));
}


/**
 * @typedef {Object} pingResult
 * @property {number} code HTTP response code
 * @property {object} reponse JSON response
 */

/**
 * Send a GET request to the URL provided, expecting to contact a
 * TurtleCoin daemon's RPC /info endpoint. If it can't be contacted
 * or a JSON blob is not recieved then a HTTP code of 500 will be
 * returned. Also if request takes longer than 4 seconds will also
 * return the 500 respons. 
 * 
 * If request succeeds then the response will be a code 200 and the 
 * JSON blob plus the time it took to complete the request and the 
 * contents of FUNCTION_REGION env variable if defined 
 *
 * @param {string} url TurtleCoin daemon's URL
 * 
 * @return {pingResult} The result of the ping
 */
async function pingDaemon(url) {
    return new Promise((resolve, reject) => {
        request({ url, method: 'GET', json: true, time: true, timeout: 4000 }, (error, response, body) => {

            if (!error && response.statusCode == 200) {
                body.pingerInfo = {
                    gcpRegion: process.env.FUNCTION_REGION,
                    time: Math.round(response.timingPhases.total)
                }

                return resolve({code: 200, response: body});
            } else {
                return resolve({
                    code: 500,
                    response:  {
                         error: "Daemon didn't respond as expected or within 4 seconds" 
                    }
                });
            }
        })
    })
}
