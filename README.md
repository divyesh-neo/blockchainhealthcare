# 🏥 Blockchain Healthcare System

A decentralized healthcare management system that securely stores patient medical records on blockchain with MongoDB for traditional database support.

## 📋 Prerequisites

- **Node.js** (v18+)
- **MongoDB** (running locally or Atlas connection string)
- **Git**

## 🚀 Quick Start (New Machine)

### 1️⃣ Clone & Install

```bash
# Clone repository
git clone <repo-url>
cd blockchainhealthcare

# Install root dependencies
npm install

# Install blockchain dependencies
cd blockchain
npm install
cd ..
```

### 2️⃣ Setup Environment Variables

Create a `.env` file in the root directory:

```env
MONGO_URI=mongodb://localhost:27017/healthcare
# Or use MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster0.mongodb.net/healthcare
PORT=3000
```

### 3️⃣ Compile Smart Contracts

```bash
cd blockchain
npx hardhat compile
cd ..
```

### 4️⃣ Start Application

**Option A: Development Mode (Recommended)**

```bash
# Terminal 1 - Start Hardhat local blockchain
cd blockchain
npx hardhat node

# Terminal 2 - Start backend server (from root directory)
node server.js

# Terminal 3 - (Optional) If you want to see logs
# Already running in Terminal 2
```

**Option B: Single Command (All-in-one)**

```bash
# From root directory
npm start
```

### 5️⃣ Access Application

Open your browser and navigate to:

```
http://localhost:3000
```

---

## 📁 Project Structure

```
blockchainhealthcare/
├── blockchain/              # Smart contracts & Hardhat
│   ├── contracts/
│   │   └── PatientRecord.sol
│   ├── scripts/
│   │   └── deploy.js
│   ├── hardhat.config.js
│   └── package.json
│
├── public/                  # Frontend - HTML, CSS, JS
│   ├── index.html
│   ├── app.js              # Main frontend logic + Blockchain integration
│   ├── sw.js               # Service Worker (PWA)
│   └── manifest.json       # PWA manifest
│
├── server.js               # Express backend
├── blockchain.js           # Blockchain API wrapper
├── db.js                   # MongoDB models
├── package.json
└── README.md
```

---

## 🔧 Commands Reference

### Backend Commands

```bash
# Start server
node server.js

# Start with nodemon (auto-restart on changes)
npx nodemon server.js
```

### Blockchain Commands

```bash
# Compile contracts
cd blockchain && npx hardhat compile

# Start local blockchain node
npx hardhat node

# Run tests
npx hardhat test

# Deploy contracts
npx hardhat run scripts/deploy.js --network localhost
```

### Database Commands

```bash
# Start MongoDB locally (if installed)
mongod

# Or use MongoDB Atlas (update MONGO_URI in .env)
```

---

## 🌐 API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - Login user

### Patients
- `GET /api/patients` - Get all patients
- `POST /api/patients` - Add new patient
- `PATCH /api/patients/:id` - Update patient status
- `DELETE /api/patients/:id` - Delete patient
- `PATCH /api/patients/:id/prescription` - Add prescription

### Stats
- `GET /api/stats` - Get dashboard statistics

### Search
- `GET /api/search?q=query` - Search patients

### Blockchain
- `POST /api/blockchain/save` - Save record to blockchain
- `GET /api/blockchain/history/:patientId` - View blockchain history

### Sync
- `POST /api/sync` - Sync offline patients to server

---

## 👥 User Roles

### Doctor
- View all patients
- Confirm appointments
- Add prescriptions (saved to blockchain)
- View blockchain history
- Delete patient records

### Patient
- Book appointments
- View own medical history
- View prescriptions

---

## ⛓️ Blockchain Features

### Smart Contract: PatientRecord.sol
- **Function: `addRecord()`** - Add medical record to blockchain
- **Function: `getRecords()`** - Retrieve patient history
- **Stored on-chain:**
  - Patient ID
  - Doctor Name
  - Diagnosis
  - Prescription
  - Timestamp

---

## 🔐 Key Features

✅ **Decentralized Medical Records** - Blockchain-stored patient history
✅ **Offline Support** - IndexedDB caching + Service Worker
✅ **Real-time Sync** - Automatic sync when back online
✅ **Role-based Access** - Doctor & Patient roles
✅ **PWA Enabled** - Works offline, installable
✅ **Dashboard** - Statistics & charts
✅ **Search** - Quick patient lookup

---

## 🐛 Troubleshooting

### Error: `ENOENT: no such file or directory, open './blockchain/artifacts/contracts/PatientRecord.sol/PatientRecord.json'`

**Solution:**
```bash
cd blockchain
npm install
npx hardhat compile
cd ..
```

### Error: `connect ECONNREFUSED 127.0.0.1:8545`

**Solution:** Start Hardhat blockchain in another terminal:
```bash
cd blockchain
npx hardhat node
```

### Error: `MongoServerError: connect ECONNREFUSED`

**Solution:** Ensure MongoDB is running:
```bash
# Start MongoDB locally
mongod

# Or update .env with MongoDB Atlas URI
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/healthcare
```

### Port 3000 already in use

**Solution:**
```bash
# Kill process on port 3000
lsof -i :3000
kill -9 <PID>

# Or use different port
PORT=3001 node server.js
```

---

## 📝 Sample Test Data

### Register as Doctor
- Email: `doctor@test.com`
- Password: `password123`
- Name: `Dr. John Doe`

### Register as Patient
- Email: `patient@test.com`
- Password: `password123`
- Name: `Jane Smith`

---

## 📦 Dependencies

### Frontend
- Chart.js - Dashboard charts
- Tailwind CSS - Styling

### Backend
- Express.js - Web framework
- MongoDB - Database
- Mongoose - ODM
- Web3.js - Blockchain interaction
- CORS - Cross-origin support
- Body-parser - JSON parsing

### Blockchain
- Hardhat - Development environment
- Solidity - Smart contract language

---

## 🚀 Deployment

### Deploy to Production

1. **Backend:** Deploy to Heroku, Vercel, or AWS
2. **Frontend:** Build and serve from `public/` folder
3. **Database:** Use MongoDB Atlas
4. **Blockchain:** Deploy to Ethereum/Sepolia testnet

```bash
# Build frontend (if using build process)
npm run build

# Deploy backend
git push heroku main
```

---

## 📞 Support

For issues or questions:
1. Check troubleshooting section
2. Review console logs (F12 in browser)
3. Check server logs in terminal

---

## 📄 License

MIT License - Feel free to use and modify

---

## 🎯 Next Steps

- [ ] Add patient appointment scheduling
- [ ] Implement doctor availability calendar
- [ ] Add prescription renewal requests
- [ ] Generate medical reports (PDF)
- [ ] Deploy to testnet blockchain
- [ ] Add video consultation feature
- [ ] Implement payment integration

---

**Happy coding! 💻⛓️🏥**
