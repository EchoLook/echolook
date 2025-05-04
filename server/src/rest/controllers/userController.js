import { generateToken } from '../common/auth.js';
import userService from '../../model/services/userService.js'
import errorHandlers from './errorHandlers.js';

export const loginUser = async (req, res) => {
  try {
    const userData = await userService.loginUser(req.body);
    const user = {userId: userData._id, username: userData.username, createdAt: userData.createdAt};
    const token = generateToken(user);

    res.status(200).send({ token, user });
  } catch (error) {
    const errorHandler = errorHandlers[error.constructor.name] || errorHandlers.InternalServerError;
    errorHandler(res);
  }
};

export const signUpUser = async (req, res) => {
  try {
    const userData = await userService.signUpUser(req.body);
    const user = {userId: userData._id, username: userData.username, createdAt: userData.createdAt};
    const token = generateToken(user);

    res.status(200).send({ token, user });
  } catch (error) {
    const errorHandler = errorHandlers[error.constructor.name] || errorHandlers.InternalServerError;
    errorHandler(res);
  }
};

export const loginUserFromId = async (req, res) => {
  try {
    const userData = await userService.loginUserFromId(req);
    const user = {userId: userData._id, username: userData.username, createdAt: userData.createdAt};
    const token = generateToken(user);

    res.status(200).send({ token, user });
  } catch (error) {
    const errorHandler = errorHandlers[error.constructor.name] || errorHandlers.InternalServerError;
    errorHandler(res);
  }
};

export default { loginUser, signUpUser };
