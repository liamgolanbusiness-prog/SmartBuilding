import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import * as authController from '../controllers/auth.controller';

const router = Router();

// Send OTP to phone number
router.post('/send-otp', asyncHandler(authController.sendOTP));

// Self-serve "start a new building" (landing page CTA).
router.post('/create-building', asyncHandler(authController.selfServeCreateBuilding));

// Verify OTP and login
router.post('/verify-otp', asyncHandler(authController.verifyOTP));

// Demo Google sign-in (no real OAuth verification)
router.post('/google-demo', asyncHandler(authController.googleDemo));

// Refresh access token
router.post('/refresh-token', asyncHandler(authController.refreshToken));

// Logout (invalidate refresh token)
router.post('/logout', asyncHandler(authController.logout));

export default router;
