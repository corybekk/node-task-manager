const express = require('express')
const multer = require('multer')
const router = new express.Router()
const auth = require('../db/middleware/auth')
const User = require('../db/models/user')

// promise version
// app.post('/users', (req, res) => { 
//     const user = new User(req.body) //req.body will have the same structure as whats defined in models/user
//     user.save().then(() => {
//         res.status(200).send(user)
//     }).catch((error) => {
//         res.status(400).send(error)
//     }) 
// })

router.post('/users', async (req, res) => { 
    const user = new User(req.body) 
    const token = await user.generateAuthToken()

    try {
        await user.save()
        res.send( { message: 'user added', token })
    } 
    catch(e) {
        res.status(500).send(e)
    }
})

//second argument "auth" is a middleware function. It verifies the user via the auth token
//and sets the current user to the user that matches the token. You can access the user by req.user
router.get('/users/me', auth, async (req, res) => {

    //returns only my data
    res.send({user: req.user, token: req.user.token})
    // pulls all users
    // const users = await User.find({})
    // res.status(200).send(users)
})

router.post('/users/login', async (req, res) => {

    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        //res.send({ user: user.getPublicProfile(), token })
        res.send({ user: user, token })


    } catch (e) {
        res.status(500).send(e.message)
    }
})

router.post('/users/logout', auth, async(req, res) => {

    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token //filter out the token which we are logging out from
        })
        await req.user.save()
        res.status(200).send("logged out")
    } catch (e) {
        res.status(500).send(e.message)
    }
})

router.post('/users/logoutAll', auth, async(req, res) => {

    try {
        req.user.tokens = [] 
        await req.user.save()
        res.status(200).send("logged all out")
    } catch (e) {
        res.status(500).send(e.message)
    }
})

// app.get('/users/:id', (req, res) => {
//     const _id = req.params.id //to access url params

//     User.findById(_id).then((user) => {
//         if (!user) {
//             return res.status(404).send()
//         }

//         res.send(user)
//     }).catch((e) => {
//         res.status(500).send()
//     })
// })

//we shouldnt have this, but its good for testing
router.get('/users/:id', async (req, res) => {
    const _id = req.params.id //to access url params

    try {
        const user = await User.findById(_id)
        res.send(user)
    } 
    catch(e) {
        res.status(500).send(e)
    }
})

router.patch('/users/me', auth, async (req, res) => {
    const updates =  Object.keys(req.body) //Takes an object and returns the property keys. This turns req.body property keys into an array
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) =>  allowedUpdates.includes(update)) //calls a callback function for every item in the "updates" array and returns true if the value of "update" is found in the "allowedUpdates" array
    
    if (!isValidOperation){
        res.status(404).send("update property not a valid property")
    }    

    try {
        updates.forEach((update) => req.user[update] = req.body[update]) //dynamically check each field to update
        req.user.save() //middleware gets called here
        res.send( {user: req.user, token: req.user.token } )

    } catch (e) {
        res.status(400).send(e)
    }
}) 

//UPDATE User
// router.patch('/users/:id', async (req, res) => {
//     const updates =  Object.keys(req.body) //Takes an object and returns the property keys. This turns req.body property keys into an array
//     const allowedUpdates = ['name', 'email', 'password', 'age']
//     const isValidOperation = updates.every((update) =>  allowedUpdates.includes(update)) //calls a callback function for every item in the "updates" array and returns true if the value of "update" is found in the "allowedUpdates" array
    
//     if (!isValidOperation){
//         res.status(404).send("update property not a valid property")
//     }    

//     try {
//         //this bypasses mongoose save which in turn bypasses the middleware
//         //const user = await User.findByIdAndUpdate(req.params.id, req.body, {new: "true", runValidators: "true"}) //new (return the new user), runValidator (validates req.body)
        
//         const user = await User.findById(req.params.id)

//         updates.forEach((update) => user[update] = req.body[update]) //dynamically check each field to update
//         user.save() //middleware gets called here
        
//         if (!user) {
//             return res.status(404).send('no user to update')
//         }
//         res.send(user)
//     } catch (e) {
//         res.status(400).send(e)
//     }
// }) 


router.delete('/users/me', auth, async (req, res) => {
 
    try {
        // const user = await User.findByIdAndDelete(req.user.id)
        await req.user.remove() //this is similar to save(), but it deletes. Does the same as the above line. 
        res.status(200).send(req.user)
    } catch(e) {
        res.send(e)
    }
})

//delete a user by id
// router.delete('/users/:id', async (req, res) => {
 
//     try {
//         const user = await User.findByIdAndDelete(req.params.id)
//         if (!user) {
//            return res.status(400).send('no user found')
//         }
//         res.status(200).send(user)
//     } catch(e) {
//         res.send(e)
//     }
// })

//uploads a user's avatar
const upload = multer({
    limits: {
        fileSize: 1000000 //restrict filesize to 1MB
    },
    fileFilter(req, file, cb) { //cb for callback
        if (!file.originalname.match(/\.(png|jpg|png)$/)) { //regex to only get doc and docx files
            return cb(new Error ('please upload correct file type'))
        }
        cb(undefined, true) // return callback with no error
    }
})
/* //call multer function 'single'. this is the middleware we want to use. 
it has a parameter 'avatar' which will be the name of the uploaded file. the 
file name must be named 'avatar' otherwise you will get an error*/
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => { 
    req.user.avatar = req.file.buffer //this is only accessible if we remove the dest property from multer
    
    await req.user.save() //user.save is only accessible because we are using auth middleware function
    res.send( {message: 'avatar added'} )
    
}, (error, req, res, next) => { //this can be added to a seperate middleware file or it can be added here. If the first param is 'error', it means its a middleware error handler? if this is in a seperate file, we will need to add it with app.use. 
    res.status(400).send({error: error.message})
})


module.exports = router //exporting the router we just created