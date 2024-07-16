import express from 'express';
import auth from './auth';
import user from './user';
import news from './news';

// es6 syntax
const app = express.Router();

app.use('/auth', auth);
app.use('/user', user);
app.use('/news', news);


export default app;
