/**
 * File Upload Service
 * Handles file uploads for avatars and documents
 */
declare class FileService {
    /**
     * Save avatar file
     */
    saveAvatar(file: any): Promise<string>;
    /**
     * Save document file
     */
    saveDocument(file: any): Promise<string>;
    /**
     * Delete file
     */
    deleteFile(filepath: string): Promise<void>;
    /**
     * Get file
     */
    getFile(filepath: string): Promise<Buffer>;
    /**
     * Get file info
     */
    getFileInfo(filepath: string): Promise<any>;
}
declare const _default: FileService;
export default _default;
//# sourceMappingURL=fileService.d.ts.map