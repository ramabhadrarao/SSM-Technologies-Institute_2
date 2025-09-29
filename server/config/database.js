const mongoose = require('mongoose');

class DatabaseConnection {
  constructor() {
    this.isConnected = false;
  }

  async connect() {
    if (this.isConnected) {
      console.log('✅ Already connected to MongoDB');
      return;
    }

    try {
      // Updated MongoDB connection options for newer versions
      const options = {
        // Remove deprecated options
        // bufferMaxEntries: 0, // This is deprecated
        // bufferCommands: false, // This is deprecated
        // useNewUrlParser: true, // This is deprecated in newer versions
        // useUnifiedTopology: true, // This is deprecated in newer versions
        
        // Keep only supported options
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      };

      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ssm_technologies_latest';
      console.log(`🔗 Connecting to MongoDB: ${mongoUri}`);
      
      await mongoose.connect(mongoUri, options);
      
      this.isConnected = true;
      console.log('✅ Connected to MongoDB successfully');
      
      // Handle connection events
      mongoose.connection.on('error', (err) => {
        console.error('❌ MongoDB connection error:', err);
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        console.log('⚠️ MongoDB disconnected');
        this.isConnected = false;
      });

      mongoose.connection.on('reconnected', () => {
        console.log('✅ MongoDB reconnected');
        this.isConnected = true;
      });

    } catch (error) {
      console.error('❌ MongoDB connection failed:', error);
      this.isConnected = false;
      throw error;
    }
  }

  async disconnect() {
    if (!this.isConnected) {
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      console.log('✅ Disconnected from MongoDB');
    } catch (error) {
      console.error('❌ Error disconnecting from MongoDB:', error);
      throw error;
    }
  }

  getConnection() {
    return mongoose.connection;
  }

  isHealthy() {
    return this.isConnected && mongoose.connection.readyState === 1;
  }
}

module.exports = new DatabaseConnection();