"use strict";
/**
 * File Upload Service
 * Handles file uploads for avatars and documents
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const UPLOAD_DIR = path_1.default.join(__dirname, '../../uploads');
const AVATAR_DIR = path_1.default.join(UPLOAD_DIR, 'avatars');
const DOCUMENT_DIR = path_1.default.join(UPLOAD_DIR, 'documents');
// Ensure directories exist
[UPLOAD_DIR, AVATAR_DIR, DOCUMENT_DIR].forEach(dir => {
    if (!fs_1.default.existsSync(dir)) {
        fs_1.default.mkdirSync(dir, { recursive: true });
    }
});
class FileService {
    /**
     * Save avatar file
     */
    async saveAvatar(file) {
        if (!file)
            throw new Error('No file provided');
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
        const ext = path_1.default.extname(file.originalname);
        const filename = `${(0, uuid_1.v4)()}${ext}`;
        const filepath = path_1.default.join(AVATAR_DIR, filename);
        // Save file
        fs_1.default.writeFileSync(filepath, file.buffer);
        return `/uploads/avatars/${filename}`;
    }
    /**
     * Save document file
     */
    async saveDocument(file) {
        if (!file)
            throw new Error('No file provided');
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
        const ext = path_1.default.extname(file.originalname);
        const filename = `${(0, uuid_1.v4)()}${ext}`;
        const filepath = path_1.default.join(DOCUMENT_DIR, filename);
        // Save file
        fs_1.default.writeFileSync(filepath, file.buffer);
        return `/uploads/documents/${filename}`;
    }
    /**
     * Delete file
     */
    async deleteFile(filepath) {
        const fullPath = path_1.default.join(__dirname, '../../', filepath);
        if (fs_1.default.existsSync(fullPath)) {
            fs_1.default.unlinkSync(fullPath);
        }
    }
    /**
     * Get file
     */
    async getFile(filepath) {
        const fullPath = path_1.default.join(__dirname, '../../', filepath);
        if (!fs_1.default.existsSync(fullPath)) {
            throw new Error('File not found');
        }
        return fs_1.default.readFileSync(fullPath);
    }
    /**
     * Get file info
     */
    async getFileInfo(filepath) {
        const fullPath = path_1.default.join(__dirname, '../../', filepath);
        if (!fs_1.default.existsSync(fullPath)) {
            throw new Error('File not found');
        }
        const stats = fs_1.default.statSync(fullPath);
        return {
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime,
        };
    }
}
exports.default = new FileService();
//# sourceMappingURL=fileService.js.map