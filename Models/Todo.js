const mongoose = require('mongoose')
const {model, Schema} = mongoose

const TodoSchema = new Schema({
    author: {type: String},
   title: {type: String, required: true },
   description: {type: String},
   createdAt: {type: String},
   isDone: {type: Boolean},
   beautifulDate: {type: String}
})

const TodoModel = model('Todo', TodoSchema)

module.exports = TodoModel