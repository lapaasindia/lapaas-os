"use strict";
/**
 * File Upload Routes - Week 6
 * Handles avatar and document uploads
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const router = (0, express_1.Router)();
// Ensure upload directory exists
const uploadDir = path_1.default.join(__dirname, '../../uploads');
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
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
router.post('/avatar', (req, res) => {
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
    }
    catch (error) {
        res.status(500).json({
            error: 'Avatar upload failed',
            message: error.message,
        });
    }
});
// Upload document endpoint
router.post('/document', (req, res) => {
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
    }
    catch (error) {
        res.status(500).json({
            error: 'Document upload failed',
            message: error.message,
        });
    }
});
// Get file info
router.get('/:filename', (req, res) => {
    try {
        const { filename } = req.params;
        const filePath = path_1.default.join(__dirname, '../../uploads', filename);
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
    }
    catch (error) {
        res.status(500).json({
            error: 'Failed to get file info',
            message: error.message,
        });
    }
});
// Delete file
router.delete('/:filename', (req, res) => {
    try {
        const { filename } = req.params;
        const filePath = path_1.default.join(__dirname, '../../uploads', filename);
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
    }
    catch (error) {
        res.status(500).json({
            error: 'Failed to delete file',
            message: error.message,
        });
    }
});
exports.default = router;
//# sourceMappingURL=fileUpload.js.map