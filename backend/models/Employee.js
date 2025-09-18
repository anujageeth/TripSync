const mongoose = require('mongoose')

const EmployeeSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true, unique: true, index: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'hotel', 'user'], default: 'user' }
}, { timestamps: true })

EmployeeSchema.index({ email: 1 }, { unique: true })

const EmployeeModel = mongoose.model("employees", EmployeeSchema)
module.exports = EmployeeModel