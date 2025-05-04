import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { getMongoUrl, getMongoTestUrl, getAdminUser } from './properties.js';
import User from '../entities/user.js';

const connect = async ({ profile }) => {
  try {
    await mongoose.connect(`${ profile === "test" ? getMongoTestUrl() : getMongoUrl() }?retryWrites=true&w=majority`, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    if (profile !== "test" && (await User.countDocuments()) === 0) {
        await new User({...getAdminUser(), password: (await bcrypt.hash(getAdminUser().password, 10))}).save();
    }
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1); 
  }
};

const disconnect = async () => {
    await mongoose.disconnect();
}

const dropDatabase = async () => {
    await mongoose.connection.dropDatabase();
}

export default { connect, disconnect, dropDatabase };
