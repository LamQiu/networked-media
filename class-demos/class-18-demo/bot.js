// imports .env variables so we don't put passwords in our js files
require('dotenv').config()

// set up the mastodon library
const m = require('masto')

// setting up the masto variable to connect to:
// 1) url: our mastodon server
// 2) token: our password to our account
const masto = m.createRestAPIClient({
    url: 'https://networked-media.itp.io/',
    accessToken: process.env.TOKEN,
});

// async function to make a request to our mastodon server
async function makeStatus(text) {
    // await ensures that it creates the status before we do anything else in our code
    const status = await masto.v1.statuses.create({
        status: text,
        // change visability to public when project ready to run
        visibility: 'private',
    });
}

setInterval(() => {
    // array of emojis to select
    let emoji = ['😭', '🤩', '💖'];

    // randomly generate a number within the array list
    let rand = Math.floor(Math.random() * emoji.length);

    // select using index
    let post = emoji[rand];

    // make our status with an emoji
    makeStatus(post);
}, 5000); // this interval will happen every 5 seconds
