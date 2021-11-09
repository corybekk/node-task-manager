const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema({
    task: {
        type: String
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, {
    timestamps: true
})

const Task = mongoose.model('task', taskSchema) //created a schema above and passing it here allows us to create schema that uses things like timestamps and middleware functions

module.exports = Task
