const express = require('express')
const app = express()
const dotenv = require('dotenv')
const cookies = require('cookie-parser')
dotenv.config()
const Cors = require('cors')
const ConnectDb = require('./database/Database')
const router  = require('./routes/Routes')
const PORT = process.env.PORT || 4255
const axios = require('axios')
const GOOGLE_API_KEY = 'AIzaSyAwuwFlJ9FbjzZzWEPUqQPomJ8hlXdqwqo';
// Calling database
ConnectDb()

//middlewares
app.use(cookies())
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(Cors())


//routes
app.get('/',(req,res)=>{
    res.send(`I am From Coupons Backend Server With Running On Port Number ${PORT} `)
})

app.use('/api/v1',router)

//listen App

app.listen(PORT,()=>{
    console.log(`Server is Running On Port Number ${PORT}`)
})