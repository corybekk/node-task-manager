const mongoose = require('mongoose')
const validator = require('validator') 
const bycrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Task = require('./task')

const userSchema = new mongoose.Schema({ //pass the user object to the Schema function to get middleware capabilites
    name: {
        type: String,
        required: true,
        trim: true //removes whitespace
    },
    email: {
        type: String,
        uniqe: true,
        required : true,
        trim: true,
        validate(value) { //setup a custom validator useing es6 synstax
            if (!validator.isEmail(value)){ // use validator npm module to validate email
                throw Error('not a valid email')
            }
        }
    },
    age: {
        type: Number,
        validate(value){  
            if (value < 0) {
                throw new Error('age must be a positive number')
            }
        },
        default: 0 //set default value if age is not provided
    },
    password: {
        type: String,
        require: true,
        trim: true,
        minlength: 7,
        validate(value){
            if (validator.contains(value, 'password')){
                throw Error('password cannot contain password')
            }
        }
    },
    tokens: [{ //an array of objects, where each object is a token
        token: {
            type: String,
            require: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
})

//not saved in the DB. this is a virtual field created on the user model. this is used to link tasks with the user when using mongoose 'populate' method
userSchema.virtual('tasks', {
    ref: 'task',
    localField: '_id',
    foreignField: 'owner'
})

// methods are accesible on the instances. sometimes called instance methods.
userSchema.methods.generateAuthToken = async function() {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, 'thisisasecret') //creates authentication token. 1st arge is unique id for the user. the userID is good, 2nd arg is a secret
    user.tokens = user.tokens.concat({ token }) //we use concat because it returns the new array which we need for user.save(). if I use push it returns the length
    await user.save()
    return token
}

//returns only public information for a user. if we call this method "getPublicProfile" it will be handled
//as a normal method. If we rename it to "toJSON" it will be called anytime res.send() is called. 
userSchema.methods.toJSON = function() {
    user = this
    const userObject = user.toObject() //this will give us a clone of the user object
    delete userObject.password 
    delete userObject.tokens

    return userObject
}

// statics methods are accesible on the model. sometimes called model methods.
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne( {email} ) //called against model
    
    if (!user) {
        throw Error('no login info found')
    }

    const isMatch = await bycrypt.compare(password, user.password)

    if (!isMatch) {
        throw Error('no login info found')
    }
    return user
}

//middleware function that executes before an operation is done on User
userSchema.pre('save', async function (next) { //cannot use arrow function because they dont bind 'this'
    const user = this
    //console.log('just before saving')

    if (user.isModified('password')) {
        user.password = await bycrypt.hash(user.password, 8)
    }
    next()
})

userSchema.pre('remove', async function (next) {
    const user = this
    await Task.deleteMany({ owner: user._id})
    next()
})

//*** CREATE USER MODEL/TABLE
const User = mongoose.model('User', userSchema)

module.exports = User