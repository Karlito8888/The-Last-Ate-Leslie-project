import { Request, Response } from 'express';
import { User } from '../models/User';
import { Message } from '../models/Message';
import { UserResponse } from '../types/api';

const formatUserResponse = (user: any): UserResponse => {
  return {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    role: user.role,
    newsletter: user.newsletter,
    fullName: user.fullName,
    birthDate: user.birthDate,
    mobilePhone: user.mobilePhone,
    landline: user.landline,
    address: user.address
  };
};

// Gestion des utilisateurs
export const getAllUsers = async (req: Request, res: Response): Promise<Response> => {
  try {
    const users = await User.find().select('-password');
    return res.json({
      success: true,
      data: users.map(formatUserResponse)
    });
  } catch (error) {
    console.error('Error getting users:', error);
    return res.status(500).json({
      success: false,
      message: 'Error getting users'
    });
  }
};

export const getUserById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    return res.json({
      success: true,
      data: formatUserResponse(user)
    });
  } catch (error) {
    console.error('Error getting user:', error);
    return res.status(500).json({
      success: false,
      message: 'Error getting user'
    });
  }
};

export const updateUserRole = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { role } = req.body;
    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.json({
      success: true,
      message: 'User role updated successfully',
      data: formatUserResponse(user)
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating user role'
    });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<Response> => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    return res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting user'
    });
  }
};

// Gestion des messages
export const getMessages = async (req: Request, res: Response): Promise<Response> => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    return res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('Error getting messages:', error);
    return res.status(500).json({
      success: false,
      message: 'Error getting messages'
    });
  }
};

export const updateMessageStatus = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { status } = req.body;
    if (!status || !['new', 'in_progress', 'resolved'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    return res.json({
      success: true,
      message: 'Message status updated successfully',
      data: message
    });
  } catch (error) {
    console.error('Error updating message status:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating message status'
    });
  }
};

export const deleteMessage = async (req: Request, res: Response): Promise<Response> => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }
    return res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting message'
    });
  }
}; 