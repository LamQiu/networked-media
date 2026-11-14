// this builds off of class-18-demo
// we are adding the fetch request in our interval function

require('dotenv').config()

const m = require('masto')

const masto = m.createRestAPIClient({
    url: 'https://networked-media.itp.io/',
    accessToken: process.env.TOKEN,
});

async function makeStatus(text) {
    const status = await masto.v1.statuses.create({
        status: text,
        // change visability to public when project ready to run
        visibility: 'private',
    });
}

setInterval(async () => {
    // TODO ADD API REQUEST
    
    //let url = "your partner's url (get-data)";
    let url = "http://161.35.53.32:6004/get-data";

    let response = await fetch(url)
    let json = await response.json()
    // make our status

    let post = json[0].user + "says" + json[0].text
    makeStatus(post);

    // TODO: CHANGE 5000ms TO YOUR SPECIFIC INTERVAL
}, 5000);
