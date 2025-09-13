const mongoose = require('mongoose');
const EmployeeModel = require('../models/Employee');

async function getUserById(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid user id' });
    const user = await EmployeeModel.findById(id).select('_id name email');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving user', error: err?.message || err });
  }
}

async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { name, email } = req.body || {};
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid user id' });
    if (!name || !email) return res.status(400).json({ message: 'Name and email are required' });

    const existing = await EmployeeModel.findOne({ email, _id: { $ne: id } }).select('_id');
    if (existing) return res.status(409).json({ message: 'Email is already in use' });

    const updated = await EmployeeModel.findByIdAndUpdate(
      id,
      { $set: { name, email } },
      { new: true, runValidators: true, projection: '_id name email' }
    );
    if (!updated) return res.status(404).json({ message: 'User not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Error updating user', error: err?.message || err });
  }
}

async function updatePassword(req, res) {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body || {};
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid user id' });
    if (!currentPassword || !newPassword) return res.status(400).json({ message: 'Both currentPassword and newPassword are required' });
    if (String(newPassword).length < 8) return res.status(400).json({ message: 'New password must be at least 8 characters' });

    const user = await EmployeeModel.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.password !== currentPassword) return res.status(401).json({ message: 'Current password is incorrect' });

    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error changing password', error: err?.message || err });
  }
}

module.exports = { getUserById, updateUser, updatePassword };