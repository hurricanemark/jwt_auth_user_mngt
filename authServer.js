// Implement REFRESH token
'use strict';
require('dotenv').config();
const express = require('express');
const app = express();
const bcrypt = require('bcrypt');  // async library for hashing passwords
const jwt = require('jsonwebtoken'); // async library for creating tokens
const bodyParser = require('body-parser'); // middleware for parsing request bodies
const cors = require('cors'); // middleware for allowing cross-origin requests
const { use } = require('passport');

app.use(express.json());

const users = []

app.get('/', (req, res) => {
    res.send('Welcome to Login API');
});


app.get('/users', (req, res) => {
    res.json(users);
});


// Create new user in this POST request
app.post('/users', async (req, res) => {
    // Encrypt password using bcrypt with salt of 10 characters
    try {
        const salt = await bcrypt.genSaltSync(10);  // generates a optimum salt of 10 characters
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        
        console.log("salt: ", salt);
        console.log("hashedPassword: ", hashedPassword);

        // Create new user object
        const newUser = {
            id: users.length + 1,
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        };
        users.push(newUser);
        res.status(201).send();
    } catch (err) {
        res.status(500).send(err);
    }
});


// // Middleware authenticating the user
// function authenticateToken(req, res, next) {
//     let authHeader = req.headers['authorization'];
//     let token = authHeader && authHeader.split(" ")[1];
//     if (token[0] === '<') {
//         // the funky REST Client format require a chop of the first and last character
//         token = token.substring(1, token.length - 1);  
//     }
//     // console.log("authHeader: ", req.headers['authorization'])
//     // console.log("token: ", token);
//     if (token == null) return res.sendStatus(401);

//     jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
//         if (err) return res.sendStatus(403);
//         req.user = user;
//         next();
//     });
// };


// app.get('/users/posts', authenticateToken, (req, res) => {
//     // console.log(req.user.email);
//     // console.log(users);
//     const filteredPosts = users.filter(user => user.id === req.user.id &&  user.email === req.user.email);
//     // console.log(filteredPosts);

//     res.json(filteredPosts);
// });

// Create a token granting the user access to the API for 25 seconds
function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '25s' });
}

// Authenticate user at login
app.post('/users/login', async (req, res) => {
    // Find user by email'
    const user = users.find(user => user.email === req.body.email);
    if (!user) {
        res.status(404).send('User not found');
    } else {
        // Compare password with hashed password
        try {
            const isPasswordValid = await bcrypt.compare(req.body.password, user.password);
            if (!isPasswordValid) {
                res.redirect(302, '/users/recovery');  // TODO: redirect to password recovery page
            }

            // JWT: assign a token to the `user` object
            console.log(user);
            const accessToken = generateAccessToken(user); // with expiration of 25 seconds
            const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);

            res.json({ accessToken: accessToken, refreshToken: refreshToken });

        } catch (err) {
            res.redirect(500, '/users');  // redirect to login page
        }
    }
});


app.post('/users/recovery', async (req, res) => {
    // Find user by email'
    console.log("req.body: ", req.body);
    const user = users.find(user => user.email === req.body.email);
    if (!user) {
        // user is not found. redirect to register page
        res.redirect(404, '/users/register');
    } else {
        // TODO: Send email or text with password reset link

        res.redirect(200, '/users/login_reset');
    }
});

app.post('/users/login_reset', async (req, res) => {
    res.send('Password reset link sent.  Waiting for user to click link...');
});

const AUTHPORT = process.env.AUTHPORT || 4000;
app.listen(AUTHPORT, () => {
  console.log('Auth server is listening on port ' + AUTHPORT);
});