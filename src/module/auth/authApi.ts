import express from 'express';
import { userLogin, userLogout, userProfile, userProfileUpdate, userRegistration } from './authController';
import { isLogin } from '../../middleware/authMiddleware';

const router = express.Router();

router.post('/register', userRegistration);
router.post('/login', userLogin);
router.get(`/user-profile`, isLogin, userProfile);
router.get(`/logout`, isLogin, userLogout);
router.put(`/profile-update`, isLogin, userProfileUpdate);




export const authRouter = router;