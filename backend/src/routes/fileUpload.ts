/**
 * File Upload Routes - Week 6
 * Handles avatar and document uploads
 */

import express, { Router, Request, Response } from 'express';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

// Type definitions
interface FileRequest extends Request {
  file?: {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    destination: string;
    filename: string;
    path: string;
  };
}

interface FileCallback {
  (error: Error | null, filename?: string): void;
}

const router = Router();

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Allowed MIME types
const allowedImageMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const allowedDocumentMimes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
];

// Upload avatar endpoint
router.post('/avatar', (req: FileRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file provided',
      });
    }

    // Validate file size (5MB for avatars)
    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({
        error: 'Avatar size exceeds 5MB limit',
      });
    }

    // Validate file type (images only)
    const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!imageTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        error: 'Invalid avatar type. Only JPEG, PNG, GIF, and WebP are allowed',
      });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: {
        fileUrl,
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Avatar upload failed',
      message: error.message,
    });
  }
});

// Upload document endpoint
router.post('/document', (req: FileRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file provided',
      });
    }

    // Validate file size (10MB for documents)
    if (req.file.size > 10 * 1024 * 1024) {
      return res.status(400).json({
        error: 'Document size exceeds 10MB limit',
      });
    }

    // Validate file type (documents only)
    const documentTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
    ];
    if (!documentTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        error: 'Invalid document type. Only PDF, Word, Excel, and Text files are allowed',
      });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    res.status(200).json({
      success: true,
      message: 'Document uploaded successfully',
      data: {
        fileUrl,
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Document upload failed',
      message: error.message,
    });
  }
});

// Get file info
router.get('/:filename', (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../../uploads', filename);

    // Check if file exists
    const fs = require('fs');
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        error: 'File not found',
      });
    }

    // Get file stats
    const stats = fs.statSync(filePath);

    res.status(200).json({
      success: true,
      data: {
        filename,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to get file info',
      message: error.message,
    });
  }
});

// Delete file
router.delete('/:filename', (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../../uploads', filename);

    // Check if file exists
    const fs = require('fs');
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        error: 'File not found',
      });
    }

    // Delete file
    fs.unlinkSync(filePath);

    res.status(200).json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to delete file',
      message: error.message,
    });
  }
});

export default router;
