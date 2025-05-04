import express from 'express';
import { loginUser, loginUserFromId, signUpUser } from '../controllers/userController.js';
import { requireAuth } from '../common/auth.js';

const userRouter = express.Router();

userRouter.post('/login', loginUser);
userRouter.post('/signUp', signUpUser);
userRouter.post('/loginFromServiceToken', requireAuth, loginUserFromId);

export default userRouter;