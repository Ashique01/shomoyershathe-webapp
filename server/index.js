const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())

// Routes
const healthRoutes = require('./routes/healthRoutes')
const reminderRoutes = require('./routes/reminderRoutes')
const userRoutes = require('./routes/users');

app.use('/api/health', healthRoutes)
app.use('/api/reminders', reminderRoutes)
app.use('/api/users', userRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message)
    process.exit(1)
  }
        
)

app.get('/', (req, res) => {
  res.send('🚀 ShomoyerShathe Backend Running')
})

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})