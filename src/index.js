const express = require('express') //web server 
require('./db/mongoose') //datbase connection
const userRouter = require('./routers/user') // router for user http requests
const taskRouter = require('./routers/task')

const app = express()
const port = process.env.PORT || 3000 

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

app.listen(port, () => {
    console.log('server started on port', port)
})


// --- file upload example
const multer = require('multer')
const upload = multer({
    dest: 'images', //this is the destination of the uploaded files. you can see it already created a directory named 'images'
    limits: {
        fileSize: 1000000 //restrict filesize to 1MB
    },
    fileFilter(req, file, cb) { //cb for callback
        if (!file.originalname.match(/\.(doc|docx)$/)) { //regex to only get doc and docx files
            return cb(new Error ('please upload a doc or docx file'))
        }
        cb(undefined, true) // return callback with no error
    }
})

app.post('/upload', upload.single('upload'), (req, res) => { //call multer function 'single'. this is the middleware we want to use. it has a parameter 'upload' which will be the name of the uploaded file. the file name must also be named 'upload'
    res.send()
}, (error, req, res, next) => { //this can be added to a seperate middleware file or it can be added here. If the first param is 'error', it means its a middleware error handler? if this is in a seperate file, we will need to add it with app.use. 
    res.status(400).send('middleware error handler! please upload the correct file type')
})


// // ----- middleware example
//
// // without middleware : new request -> run route handler
// // with middleware : new request -> do something -> run route handler 
//
// this would go in the middleware folder
//
// app.use((req, res, next) => {
//     if (req.method === 'GET') {
//         return res.send('get requests are disabled')
//     }
//     console.log(req.method, req.path)
//     next()
// }) //register new middleware function. 


// //--------- token test
// const jwt = require('jsonwebtoken')

// const myFunction = async () =>{
//     const token = jwt.sign({ _id: 'asdf' }, 'thisisasecret', { expiresIn: '2 days'}) //creates authentication token. 1st arge is unique id for the user. the userID is good, 2nd arg is a secret
//     console.log(token) // base64 token. made of 3 parts serperated by periodes. first is header, 2nd payload/body, 3rd signature used to verify the token

//     const data = jwt.verify(token, 'thisisasecret')
//     console.log(data)
// }
// myFunction()

//------- bycrypt test
// const bycrypt = require('bcrypt')

// const cryptFunction = async () => {
//     const password = 'password123'
//     const hashPassword = await bycrypt.hash(password, 8)

//     console.log(password)
//     console.log(hashPassword)

//     const isMatch = await bycrypt.compare(password, hashPassword)
//     console.log(isMatch)
// }
// cryptFunction()