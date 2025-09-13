const mongoose = require('mongoose')

const EmployeeSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: { type: String, enum: ['admin', 'hotel', 'user'], default: 'user' }
})

const EmployeeModel = mongoose.model("employees", EmployeeSchema)
module.exports = EmployeeModel