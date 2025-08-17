import express from 'express';
import { userLogin, userProfile, userRegistration } from './authController';
import { isLogin } from '../../middleware/authMiddleware';

const router = express.Router();

router.post('/register', userRegistration);
router.post('/login', userLogin);
router.get(`/user-profile`, isLogin,userProfile );




export const authRouter = router;