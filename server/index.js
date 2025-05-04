import express from 'express';
import bodyParser from 'body-parser';
import mongoClient from './src/model/connectors/mongoClient.js';
import userRouter from './src/rest/routers/userRouter.js';
import cors from 'cors';
import 'dotenv/config';
import searchRouter from './src/rest/routers/searchRouter.js';

const app = express();

app.use(cors());

app.use(bodyParser.json());

app.use('/api/users', userRouter);
app.use('/api/search', searchRouter);

const port = process.env.port || 3000;
const profile = process.env.profile || "default";

mongoClient.connect({profile}).then(() => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}).catch(error => {
  console.error('MongoDB connection error:', error.message);
});