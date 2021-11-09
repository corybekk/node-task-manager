const mongoose = require('mongoose')
const validator = require('validator') //npm package with more advance validation

mongoose.connect('mongodb://127.0.0.1:27017/task-manager-api', {
    useNewUrlParser: true,
    useCreateIndex: true
})

// START COMMAND
///Users/corybekker/mongodb/bin/mongod --dbpath /Users/corybekker/mongodb-data

//**createa a new users in the database
// const me = new User({
//     name: 'dood',
//     email: 'cory@hotmail.com',
//     password: 'password'
// })

// me.save().then(() => { //save() is a promise
//     console.log(me)
// }).catch((error) => {
//     console.log('Error!', error)
// })


// const newTask = new task({
//     task : 'eat nuts',
//     completed : false
// })

// newTask.save().then(() => {
//     console.log(newTask)
// }).catch((error) =>{
//     console.log('error:', error)
// })