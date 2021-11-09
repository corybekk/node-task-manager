const jwt = require('jsonwebtoken')
const User = require('../models/user')

//middleware function. We use this middleware by passing 'auth' as the 2nd arg to a router.
const auth = async (req, res, next) => {
    
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        //console.log(token)
        const decoded = jwt.verify(token, 'thisisasecret') //decode the token. The token was created using the user _id. When decoded you can see the _id
        const user = await User.findOne({_id: decoded._id, 'tokens.token': token })

        if (!user) {
            throw new Error()
        }

        user.token = token
        req.user = user
        next()
    } catch (e) {
        return res.status(401).send({ error: 'please authenticate'})
    }

    // console.log('middleware!!!')

}

module.exports = auth