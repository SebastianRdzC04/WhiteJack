import mongoose from 'mongoose';

export async function connectToMongoDB() {
    const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/mydatabase';
    if (!mongoUrl) {
        throw new Error('MONGO_URL is not defined in the environment variables');
    }
    try {
        await mongoose.connect(mongoUrl);
        console.log('Connected to MongoDB successfully');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw error;
    }
}

export async function disconnectFromMongoDB() {
    try {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB successfully');
    } catch (error) {
        console.error('Error disconnecting from MongoDB:', error);
        throw error;
    }
}