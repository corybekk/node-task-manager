const express = require('express') // we need this everywhere that will use express object
const Task = require('../db/models/task') //import Task from Models so we can interact with Task object.
const auth = require('../db/middleware/auth')
const router = new express.Router() //create a new router for tasks

router.post('/task', auth, async (req, res) => { 

    const task = new Task({
        ...req.body,
        owner: req.user._id
    })

    try {
        await task.save()
        res.status(200).send(task)
    }
    catch(e) {
        res.status(400).send(e)
    }
})
// This is the old way. The updated version above will associate a task with a user and uses auth
// router.post('/task', async (req, res) => { 
//     const task = new Task(req.body) //req.body will have the same structure as whats defined in models/user
//     try {
//         await task.save()
//         res.status(200).send(task)
//     }
//     catch(e) {
//         res.status(400).send(e)
//     }
// })

router.get('/tasks/me', auth, async (req, res) => {
    
    try {
        const tasks = await Task.find({ owner: req.user._id })
        res.send(tasks)
    } 
    catch(e) {
        res.status(500).send(e)
    }
})

//updated version is above which only grabs tasked owned by the user. 
//GET /tasks?completed=true
//GET /tasks?limit=10&skip=20 (skips the first page and shows the next 10 results)
//GET /tasks?sortBy=createdAt_desc or asc
router.get('/tasks', auth, async (req, res) => {
    const match = {} //create empty match object
    const sort = {}

    if (req.query.completed) { //this will grab the url param named 'completed'
        match.completed = req.query.completed === 'true' //returns false if not true. creates object property 'completed'
    } 

    if (req.query.sort) {
        const parts = req.query.sortBy.split('_') //splits query param into array
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1 //creates a property named 'createdAt' with value of -1 or 1 dependng on the query value
    }

    try {
        await req.user.populate({ //populate data from a model relationship. Mongoose feature
            path: 'tasks', //virtual field created on users models.
            match,           //shorthand
            options: {
                limit: parseInt(req.query.limit), //gets url params to limit or skip results from populate (pagination)
                skip: parseInt(req.query.skip),
                sort: {
                    createdAt: -1 // 1 is asc and -1 is desc
                }
            }
        }).execPopulate()
        res.send(req.user.tasks)

        /*const tasks = await Task.find({})*/ // this is the old way. updated way is above. which uses mongoose populate to get results
        //res.send(tasks)
    } 
    catch(e) {
        res.status(500).send(e)
    }
})

router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id

    try {
        const task = await Task.findOne({_id, owner: req.user._id}) 
        if (!task) {
            return res.status(404).send('task not found')
        }
        res.send(task)
    }
    catch(e) {
        res.status(500).send(e)
    }
})

//UPDATE task
router.patch('/tasks/:id', auth, async (req, res) => {
    
    const taskToUpdate = Object.keys(req.body)
    const availableTasks = ['task','description','completed']
    const isValidTask = taskToUpdate.every((task) => availableTasks.includes(task))
    
    if (!isValidTask) {
        return res.send('not a valid task')
    }
    try {
        
        const updateTask = await Task.findOne({ _id: req.params.id, owner: req.user._id})

        if (!updateTask) {
            return res.send('could not find task')
        }

        availableTasks.forEach((taskProperty) => updateTask[taskProperty] = req.body[taskProperty])
        updateTask.save()
        // commented out the below code so I could re-write it using save()
        // const task = await Task.findByIdAndUpdate(req.params.id, req.body,{new: "true", runValidators: "true"})

        res.send(updateTask)

   } catch(e) {
        res.send({"error": e.message})
   }
})

router.delete('/tasks/:id', auth, async (req,res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })

        if (!task) {
            return res.status(404).send('no task found')
        }
        res.send(task)
    } catch(e) {
        console.lstatus(500).send(e)
    }
})

module.exports = router