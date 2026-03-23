// src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import { User, IUser } from '../models/Users.js';
import { generateToken } from '../utils/jwt.js';
import bcrypt from 'bcryptjs';

interface RegisterBody {
  email: string;
  password: string;
}

interface LoginBody {
  email: string;
  password: string;
}

export const register = async (req: Request<{}, {}, RegisterBody>, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password required' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'User already exists' });
    }

    const user = await User.create({
      email,
      password,
      plan: 'free',
      credits: 10,
      lastCreditReset: new Date(),
    });

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        plan: user.plan,
        credits: user.credits,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

export const login = async (req: Request<{}, {}, LoginBody>, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        plan: user.plan,
        credits: user.credits,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};