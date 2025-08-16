import express from 'express';
import { userLogin, userRegistration } from './authController';

const router = express.Router();

router.post('/register', userRegistration);
router.post('/login', userLogin);




export const authRouter = router;