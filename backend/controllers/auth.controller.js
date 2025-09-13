const EmployeeModel = require('../models/Employee');

async function login(req, res) {
  const { email, password } = req.body;
  try {
    const user = await EmployeeModel.findOne({ email });
    if (!user) return res.status(404).json({ message: 'No record existed' });
    if (user.password !== password) {
      return res.status(401).json({ message: 'The password is incorrect' });
    }
    res.json({ status: 'Success', userId: user._id });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err?.message || err });
  }
}

async function register(req, res) {
  try {
    const employee = await EmployeeModel.create(req.body);
    res.json(employee);
  } catch (err) {
    res.status(400).json({ message: 'Registration failed', error: err?.message || err });
  }
}

module.exports = { login, register };