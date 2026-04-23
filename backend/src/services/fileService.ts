/**
 * File Upload Service
 * Handles file uploads for avatars and documents
 */

import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const UPLOAD_DIR = path.join(__dirname, '../../uploads');
const AVATAR_DIR = path.join(UPLOAD_DIR, 'avatars');
const DOCUMENT_DIR = path.join(UPLOAD_DIR, 'documents');

// Ensure directories exist
[UPLOAD_DIR, AVATAR_DIR, DOCUMENT_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

class FileService {
  /**
   * Save avatar file
   */
  async saveAvatar(file: any): Promise<string> {
    if (!file) throw new Error('No file provided');

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed');
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File size exceeds 5MB limit');
    }

    // Generate unique filename
    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    const filepath = path.join(AVATAR_DIR, filename);

    // Save file
    fs.writeFileSync(filepath, file.buffer);

    return `/uploads/avatars/${filename}`;
  }

  /**
   * Save document file
   */
  async saveDocument(file: any): Promise<string> {
    if (!file) throw new Error('No file provided');

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
    ];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error('Invalid file type. Only PDF, Word, Excel, and Text files are allowed');
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('File size exceeds 10MB limit');
    }

    // Generate unique filename
    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    const filepath = path.join(DOCUMENT_DIR, filename);

    // Save file
    fs.writeFileSync(filepath, file.buffer);

    return `/uploads/documents/${filename}`;
  }

  /**
   * Delete file
   */
  async deleteFile(filepath: string): Promise<void> {
    const fullPath = path.join(__dirname, '../../', filepath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }

  /**
   * Get file
   */
  async getFile(filepath: string): Promise<Buffer> {
    const fullPath = path.join(__dirname, '../../', filepath);
    if (!fs.existsSync(fullPath)) {
      throw new Error('File not found');
    }
    return fs.readFileSync(fullPath);
  }

  /**
   * Get file info
   */
  async getFileInfo(filepath: string): Promise<any> {
    const fullPath = path.join(__dirname, '../../', filepath);
    if (!fs.existsSync(fullPath)) {
      throw new Error('File not found');
    }

    const stats = fs.statSync(fullPath);
    return {
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
    };
  }
}

export default new FileService();
