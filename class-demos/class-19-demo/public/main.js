// this js will go inside of the makeStatus function in your bot
// your partner will make a request to http://your-ip-address:6001/get-data

// when we are testing it on our own machine, we use http://localhost:6001/get-data

async function getData(){
    let url = "http://localhost:6001/get-data"; // when do it with my bot, change it to my partner's ip address
    let response = await fetch(url)
    let json = await response.json()

    // u have data now, u can do whatever u want
    // use the json variable for any application
    console.log(json)
}

getData()