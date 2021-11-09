require('../src/db/mongoose')
const Task = require('../src/db/models/task')

//** Promise chaining
// Task.findByIdAndRemove('61217bfeddfe2ac247e43962').then((task) =>{
//     console.log(task)
//     return Task.find({completed:false})
// }).then((imcompleteTasks) => {
//     console.log(imcompleteTasks)
// }).catch((e) =>{
//     console.log(e)
// })

//ObjectId("61217bfeddfe2ac247e43962")

const removeTaskAndGetTasks = async(id,completed) => {
    const task = await Task.findByIdAndRemove(id)
    const incompleteTasks = await Task.find({completed})
    return incompleteTasks
}

removeTaskAndGetTasks('61217bfeddfe2ac247e43962', false).then((tasks) => {
    console.log(tasks)
}).catch((e) => {
    console.log(e)
})