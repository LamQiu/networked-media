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

setInterval(() => {
    // TODO ADD API REQUEST

    // make our status
    makeStatus(post);
}, 5000);
