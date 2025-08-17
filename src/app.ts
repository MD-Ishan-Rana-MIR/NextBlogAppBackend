import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import { config } from './config/config';

const app = express();
app.use(cors());
app.use(express.json()); // <-- parses application/json
app.use(express.urlencoded({ extended: true })); // <-- parses form-urlencoded   
app.use(cookieParser());

// Connect to MongoDB

mongoose.connect(config.dbUrl).then(() => {
    console.log('Connected to MongoDB');

}).catch((error) => {
    console.error('MongoDB connection error:', error);
});


// Import and use the auth router
import { authRouter } from './module/auth/authApi';
app.use('/api/auth', authRouter);
// Import and use the forget password router
import { forgetRouter } from './module/forget-password/forgetApi';
app.use('/api/forget', forgetRouter);



app.get('/', (req, res) => {
    res.send('Welcome to the NextBlogApp Backend!');
});




export default app;