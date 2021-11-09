//CRUD EXAMPLES

const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient //create a client. this allows us to create a connection to the db

const connectionURL = 'mongodb://127.0.0.1:27017'
const databaseName = 'task-manager'

// Connect using MongoClient

MongoClient.connect(connectionURL, function(error, client) {
    if (error) {
        return console.log('unable to connect to database')
    }

    console.log('connected to database!')
    const db = client.db(databaseName)

    //select record
    db.collection('users').find({name: 'cory'}).toArray((error, result) => {
        console.log(result)
    })

    //insert records
    db.collection('task').insertMany([{
        task: 'eat turd',
        completed: true
    }, {
        task: 'smoke weed',
        completed: false
    }], (error, result) => {
        return console.log(error)
    })

    // db.collection('users').findOne({name : 'cory'}, (error, user) => {
    //     if (error) return console.log('cannot find user')
    //     console.log(user)
    // })

    // db.collection('users').insertOne({ //create a table/collection and add a record
    //     name:'zoe',
    //     age: 31
    // }, (error, result) => {
    //     if (error) {
    //         return console.log('unable to insert user')
    //     }

    //     console.log(result.ops) //this will print undefined because mongodb 4.0 removed it
    // })  

    // db.collection('users').insertMany([{
    //     name: 'banana',
    //     age: 'ripe'
    // }, {
    //     name: 'apple',
    //     age: 'old'
    // }, (error, result) => {
    //     if (error) return "unable to insert documents"

    // }])
})