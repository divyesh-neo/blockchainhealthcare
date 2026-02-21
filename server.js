

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { Patient, User } from './db.js';
import { addPatientRecord, getPatientHistory } from './blockchain.js';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/api/patients', async (req, res) => {
  try {
    const { email } = req.query;
    const query = email ? { patientEmail: email } : {};
    const patients = await Patient.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: patients });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    const total = await Patient.countDocuments();
    const pending = await Patient.countDocuments({ status: 'Pending' });
    const confirmed = await Patient.countDocuments({ status: 'Confirmed' });
    const done = await Patient.countDocuments({ status: 'Done' });
    const today = new Date().toISOString().split('T')[0];
    const todayPatients = await Patient.countDocuments({ date: today });
    const doctorStats = await Patient.aggregate([
      { $group: { _id: '$doctor', count: { $sum: 1 } } }
    ]);
    res.json({ success: true, data: { total, pending, confirmed, done, todayPatients, doctorStats } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/patients', async (req, res) => {
  try {
    const patient = new Patient(req.body);
    await patient.save();
    res.json({ success: true, data: patient });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.patch('/api/patients/:id', async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      { 
        status: req.body.status,
        checkupDays: req.body.checkupDays,
        nextCheckup: req.body.nextCheckup
      },
      { new: true }
    );
    res.json({ success: true, data: patient });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/search', async (req, res) => {
  try {
    const { q } = req.query;
    const patients = await Patient.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } },
        { problem: { $regex: q, $options: 'i' } }
      ]
    });
    res.json({ success: true, data: patients });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/sync', async (req, res) => {
  try {
    const { patients } = req.body;
    const saved = await Patient.insertMany(patients);
    res.json({ success: true, synced: saved.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/patients/:id', async (req, res) => {
  try {
    await Patient.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.patch('/api/patients/:id/prescription', async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      { prescription: req.body.prescription },
      { new: true }
    );
    res.json({ success: true, data: patient });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.json({ success: false, message: 'Email already exists' });
    const user = new User({ name, email, password, role });
    await user.save();
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (!user) return res.json({ success: false, message: 'Invalid credentials' });
    const userData = { _id: user._id, name: user.name, email: user.email, password: user.password, role: user.role };
    res.json({ success: true, data: userData });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/blockchain/save', async (req, res) => {
  try {
    const { patientId, doctorName, diagnosis, prescription } = req.body;
    await addPatientRecord(patientId, doctorName, diagnosis, prescription);
    res.json({ success: true, message: 'Saved to blockchain!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/blockchain/history/:patientId', async (req, res) => {
  try {
    const history = await getPatientHistory(req.params.patientId);
    res.json({ success: true, data: history });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});