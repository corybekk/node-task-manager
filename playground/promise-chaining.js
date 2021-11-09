require('../src/db/mongoose') //allows us to connect to the database
const User = require('../src/db/models/user') //grab the model/table we want to use

//ObjectId("612073df8269f8add4979f85")

// User.findByIdAndUpdate('612073df8269f8add4979f85', {age: 26}).then((user) => { //update user with id to age 26 
//     console.log(user)
//     return User.countDocuments({age: 1}) // 2nd promise. then count documents/records that have age 1
// }).then((usersWithAgeOne) => {
//     console.log(usersWithAgeOne) // body for 2nd promise
// }).catch((e) => {
//     console.log(exports)
// })

// convert into async wait function
// we can do this because both findByIdAndUpdate and countDocuments return promises

const updateAgeAndCount = async (id , age) => {
    const user = await User.findByIdAndUpdate(id, {age})
    const count = await User.countDocuments({age})
    return count
}

updateAgeAndCount('612073df8269f8add4979f85', 1).then((count) => {
    console.log(count)
}).catch((e) => {
    console.log(e)
})