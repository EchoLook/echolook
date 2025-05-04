import User from '../entities/user.js';
import bcrypt from 'bcrypt';
import { IncorrectCredentialsError, UserNotFoundError } from '../errors/errors.js';

const loginUser = async ({ username, password }) => {
  try {
    const user = await User.findOne({ username });
    if (user && await bcrypt.compare(password, user.password)) {
      return user;
    } else if (user) {
      throw new IncorrectCredentialsError();
    } else {
      throw new UserNotFoundError();
    }
  } catch (error) {
    throw error;
  }
}

const signUpUser = async ({ username, password }) => {
  try {
    const hashedPass = await bcrypt.hash(password, 10);
    const new_user = {
      username: username,
      password: hashedPass,
      admin: false,
      enrollments: []
    }
    let user = new User(new_user)
    await user.save()
    return new_user
  } catch (error) {
    throw error;
  }
}

const loginUserFromId = async ({ userId }) => {
  try {
    const user = await User.findById(userId);
    if (user) {
      return user;
    } else {
      throw new UserNotFoundError();
    }
  } catch (error) {
    throw error;
  }
}

export default { loginUser, loginUserFromId, signUpUser };