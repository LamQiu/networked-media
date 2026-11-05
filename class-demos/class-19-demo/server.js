

let express = require('express')
let nedb = require('@seald-io/nedb');

// set up our variables to use
let app = express()
let database = new nedb({
    filename: "mydatabase.db", 
    autoload: true
})

// set up my server normally
app.use(express.static('public'))
app.use(express.urlencoded({extended:true}))

app.get('/', (request, response)=>{
    response.send('server is working')
})

app.post('/add-data', (request, response)=>{
    console.log(request.body)
    let dataToBeAdded = {
        message: request.body.newMessage,
        timestamp: Date.now()
    }

    // using database instead of an array
    database.insert(dataToBeAdded, (error, newData)=>{
        if(error){
            console.log(error)
            response.send('error, data was not added')
        } else {
            console.log(newData)
            response.send('data added')
        }
    })
})

app.get('/get-data', (request, response)=>{
    // query is how we ask for the data from db
    // empty query object will give everything
    let query = {}
    database.find(query, (error, retrievedData) => {
        console.log(retrievedData)
        response.json(retrievedData)
    })
})

app.listen(6001, ()=>{
    console.log('server is running on http://localhost:6001/')
})