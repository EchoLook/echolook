import jwt from 'jsonwebtoken';
import { UserNotFoundError } from '../../model/errors/errors.js';
import errorHandlers from '../controllers/errorHandlers.js';

export const generateToken = ({ userId }) => {
  return jwt.sign({ userId }, 'your-secret-key', { expiresIn: '24h' });
};

export const requireAuth = (req, res, next) => {
  try {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
      throw new UserNotFoundError();
    }

    const token = authorizationHeader.split(' ')[1];
    jwt.verify(token, 'your-secret-key', (err, decoded) => {
      if(err){
          throw new UserNotFoundError();
      }
      req.userId = decoded.userId;
    });
    next(); 
  } catch (error) {
    const errorHandler = errorHandlers[error.constructor.name] || errorHandlers.InternalServerError;
    errorHandler(res);
  }
};


export const checkAuth = (req, res, next) => {
  try {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
      next();
    }

    const token = authorizationHeader.split(' ')[1];
    jwt.verify(token, 'your-secret-key', (err, decoded) => {
      if(err){
        next();
      }
      req.userId = decoded.userId;
    });
    next(); 
  } catch (error) {
    const errorHandler = errorHandlers[error.constructor.name] || errorHandlers.InternalServerError;
    errorHandler(res);
  }
};