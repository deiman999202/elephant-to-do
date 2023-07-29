const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const User = require('./Models/User.js')
const Todo = require('./Models/Todo.js')
const cookieParser = require('cookie-parser')
require('dotenv').config()

const app = express()

app.use(express.json())
app.use(cors({credentials: true, origin: ["http://localhost:3000", "https://elephant-to-do-front.onrender.com"]}))
app.use(cookieParser())

const salt = bcrypt.genSaltSync(10)
const secret = 'dsmnfbshjfdsbghjbhj'


mongoose.connect(process.env.MongoDBLink)

app.post('/signup', async (req, res) => {
    const {email, password, username} = req.body
    const userDoc = await User.create({email, password: bcrypt.hashSync(password, salt), username})
    res.json(userDoc)
})

app.post('/login', async (req, res) => {
    const {email, password} = req.body
    const userDoc = await User.findOne({email})
    const {username} = userDoc.username
    const passOk = bcrypt.compareSync(password, userDoc?.password)
    if (passOk){
        jwt.sign({username: userDoc.username, id: userDoc._id}, secret, {}, (err, token) => {
            if (err) throw err
            res.cookie('token', token).json(userDoc, res.cookies)
        })
    }else{
        res.status(400).json('Wrong credentials')
    }
})

app.post('/logout', (req, res) => {
    res.cookie('token', '').json("ok")
})


app.get('/profile', async (req, res) => {
    const {token} = req.cookies
        jwt?.verify(token, secret, {}, (err, info) => {
            if (err) throw err
            res.json(info)
        })
   
})

app.post('/todo', async (req, res) => {
    const {title, description, author} = req.body
    const date = new Date()
    const currentDate = `${date.getDay()}/${date.getMonth()}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`
    const newTodo = await Todo.create({title, description, createdAt: Date.now(), beautifulDate: currentDate, isDone: false, author})
    res.json(newTodo)
})

app.put('/todo', async (req, res) => {
    const {id, title, description, changeState} = req.body
    const todo = await Todo.findById(id)
    const changeIsDone = changeState ? !todo.isDone : todo.isDone
    await todo.updateOne({title, description, isDone: changeIsDone})
    res.json(todo)
})

app.delete('/todo', async (req, res) => {
    const {id} = req.body
    await Todo.findOneAndDelete({_id: id})
    res.json("deleted")
})

app.post('/authtodo', async (req, res) => {
    const {username} = req.body
    const todos = await Todo.find({author: username}).exec()
    res.json(todos)
})

app.listen(5000)

//VQzFOi6aci7MeAaH