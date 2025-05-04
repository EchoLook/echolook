import mongoose from 'mongoose';

const enrolledSchema = new mongoose.Schema({
  spl_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Spl'
  },
  role: {
    type: String,
    required: true
  }
});

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  admin: {
    type: Boolean,
    default: false 
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  enrollments: [enrolledSchema] 
});

const User = mongoose.model('User', userSchema);

export default User;
