


import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI;

// mongoose.connect(MONGO_URI)
//   .then(() => console.log('MongoDB Connected'))
//   .catch(err => console.log('MongoDB Error:', err));


mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 5000,
  family: 4
})
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB Error:', err));

const patientSchema = new mongoose.Schema({
  name: String,
  age: Number,
  phone: String,
  problem: String,
  doctor: String,
  date: String,
  time: String,
  status: { type: String, default: 'Pending' },
  prescription: { type: String, default: '' },
  patientEmail: { type: String, default: '' },
  checkupDays: { type: Number, default: 0 },
  nextCheckup: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const Patient = mongoose.model('Patient', patientSchema);

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: { type: String, enum: ['doctor', 'patient'] },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
export { Patient, User };