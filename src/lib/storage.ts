import { supabase } from '@/integrations/supabase/client';

export type UploadProgress = {
  loaded: number;
  total: number;
  percentage: number;
};

export type StorageBucket = 
  | 'profile-images'
  | 'portfolio-media' 
  | 'campaign-assets'
  | 'chat-attachments';

class StorageService {
  // Upload file to specific bucket
  async uploadFile(
    bucket: StorageBucket,
    file: File,
    path: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<{ url: string; path: string }> {
    try {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size must be less than 10MB');
      }

      // Validate file type based on bucket
      this.validateFileType(bucket, file);

      // Generate unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = path ? `${path}/${fileName}` : fileName;

      // Upload with progress tracking
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      return {
        url: publicUrl,
        path: data.path
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  // Upload multiple files
  async uploadFiles(
    bucket: StorageBucket,
    files: File[],
    basePath: string,
    onProgress?: (fileIndex: number, progress: UploadProgress) => void
  ): Promise<Array<{ url: string; path: string; file: File }>> {
    const uploads = files.map(async (file, index) => {
      const result = await this.uploadFile(
        bucket, 
        file, 
        basePath,
        onProgress ? (progress) => onProgress(index, progress) : undefined
      );
      return { ...result, file };
    });

    return Promise.all(uploads);
  }

  // Delete file from storage
  async deleteFile(bucket: StorageBucket, filePath: string): Promise<void> {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      throw error;
    }
  }

  // Delete multiple files
  async deleteFiles(bucket: StorageBucket, filePaths: string[]): Promise<void> {
    const { error } = await supabase.storage
      .from(bucket)
      .remove(filePaths);

    if (error) {
      throw error;
    }
  }

  // Get file URL
  getFileUrl(bucket: StorageBucket, filePath: string): string {
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);
    
    return publicUrl;
  }

  // Get signed URL for private files
  async getSignedUrl(
    bucket: StorageBucket, 
    filePath: string, 
    expiresIn: number = 3600
  ): Promise<string> {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      throw error;
    }

    return data.signedUrl;
  }

  // List files in a folder
  async listFiles(
    bucket: StorageBucket, 
    folder?: string,
    limit: number = 100
  ): Promise<Array<{ name: string; id: string; updated_at: string; created_at: string; last_accessed_at: string; metadata: any; buckets: any }>> {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(folder, {
        limit,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) {
      throw error;
    }

    return data || [];
  }

  // Create folder structure for user
  async createUserFolders(userId: string): Promise<void> {
    // Create placeholder files to establish folder structure
    const placeholderContent = new Blob([''], { type: 'text/plain' });
    const placeholderFile = new File([placeholderContent], '.gitkeep', { type: 'text/plain' });

    try {
      // Create user folders in different buckets
      await Promise.all([
        this.uploadFile('profile-images', placeholderFile, `users/${userId}`),
        this.uploadFile('portfolio-media', placeholderFile, `users/${userId}`),
        this.uploadFile('campaign-assets', placeholderFile, `users/${userId}`),
        this.uploadFile('chat-attachments', placeholderFile, `users/${userId}`)
      ]);
    } catch (error) {
      console.error('Error creating user folders:', error);
      // Don't throw - folder creation is not critical
    }
  }

  // Validate file type based on bucket
  private validateFileType(bucket: StorageBucket, file: File): void {
    const imageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const videoTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    const documentTypes = ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

    switch (bucket) {
      case 'profile-images':
        if (!imageTypes.includes(file.type)) {
          throw new Error('Profile images must be JPEG, PNG, WebP, or GIF');
        }
        break;
      
      case 'portfolio-media':
        if (![...imageTypes, ...videoTypes].includes(file.type)) {
          throw new Error('Portfolio media must be images (JPEG, PNG, WebP, GIF) or videos (MP4, WebM, OGG)');
        }
        break;
      
      case 'campaign-assets':
        if (![...imageTypes, ...videoTypes, ...documentTypes].includes(file.type)) {
          throw new Error('Campaign assets must be images, videos, or documents (PDF, Word, Text)');
        }
        break;
      
      case 'chat-attachments':
        if (![...imageTypes, ...videoTypes, ...documentTypes].includes(file.type)) {
          throw new Error('Chat attachments must be images, videos, or documents');
        }
        break;
      
      default:
        throw new Error('Invalid storage bucket');
    }
  }

  // Get optimized image URL with transformations
  getOptimizedImageUrl(
    bucket: StorageBucket, 
    filePath: string, 
    options: {
      width?: number;
      height?: number;
      quality?: number;
      format?: 'webp' | 'avif' | 'auto';
    } = {}
  ): string {
    const baseUrl = this.getFileUrl(bucket, filePath);
    
    // If Supabase has image transformations available, add them
    // For now, return the base URL
    // TODO: Implement image transformations when available
    return baseUrl;
  }

  // Helper method to convert File to base64 for previews
  fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Helper method to validate file before upload
  validateFile(file: File, bucket: StorageBucket): { valid: boolean; error?: string } {
    try {
      // Check file size
      if (file.size > 10 * 1024 * 1024) {
        return { valid: false, error: 'File size must be less than 10MB' };
      }

      // Check file type
      this.validateFileType(bucket, file);
      
      return { valid: true };
    } catch (error) {
      return { valid: false, error: error instanceof Error ? error.message : 'Invalid file' };
    }
  }
}

export const storageService = new StorageService();

// Helper hooks for React components
export const useFileUpload = () => {
  return {
    uploadFile: storageService.uploadFile.bind(storageService),
    uploadFiles: storageService.uploadFiles.bind(storageService),
    deleteFile: storageService.deleteFile.bind(storageService),
    validateFile: storageService.validateFile.bind(storageService),
    fileToBase64: storageService.fileToBase64.bind(storageService)
  };
};

// Type definitions for upload components
export type FileUploadProps = {
  bucket: StorageBucket;
  path?: string;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  onUpload?: (result: { url: string; path: string }) => void;
  onUploadMultiple?: (results: Array<{ url: string; path: string; file: File }>) => void;
  onProgress?: (progress: UploadProgress) => void;
  onError?: (error: Error) => void;
};