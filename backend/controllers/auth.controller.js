const EmployeeModel = require('../models/Employee');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

async function login(req, res) {
  const { email, password } = req.body;
  try {
    const user = await EmployeeModel.findOne({ email: String(email).trim().toLowerCase() });
    if (!user) return res.status(404).json({ message: 'Email does not exist' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'The password is incorrect' });

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ status: 'Success', userId: user._id, token });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err?.message || err });
  }
}

async function register(req, res) {
  try {
    const { name, email, password } = req.body;
    const emailLower = String(email).trim().toLowerCase();

    const exists = await EmployeeModel.findOne({ email: emailLower }).select('_id');
    if (exists) return res.status(409).json({ message: 'An account with this email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const employee = await EmployeeModel.create({ name, email: emailLower, password: hashedPassword });
    res.json({ _id: employee._id, name: employee.name, email: employee.email });
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }
    res.status(400).json({ message: 'Registration failed', error: err?.message || err });
  }
}

module.exports = { login, register };