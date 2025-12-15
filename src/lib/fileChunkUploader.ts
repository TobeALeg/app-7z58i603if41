// 分片上传实现，用于解决大文件上传限制问题

export class SupabaseChunkedUploader {
  private supabase: any;
  private file: File;
  private bucketName: string;
  private fileName: string;
  private chunkSize: number;
  private onProgress?: (progress: number) => void;
  private onError?: (error: Error) => void;
  private onComplete?: () => void;

  constructor(
    supabase: any,
    file: File,
    bucketName: string,
    fileName: string,
    options: {
      chunkSize?: number;
      onProgress?: (progress: number) => void;
      onError?: (error: Error) => void;
      onComplete?: () => void;
    } = {}
  ) {
    this.supabase = supabase;
    this.file = file;
    this.bucketName = bucketName;
    this.fileName = fileName;
    this.chunkSize = options.chunkSize || 10 * 1024 * 1024; // 默认10MB
    this.onProgress = options.onProgress;
    this.onError = options.onError;
    this.onComplete = options.onComplete;
  }

  /**
   * 开始上传文件
   */
  async upload(): Promise<{ data: any; error: any }> {
    try {
      const totalChunks = Math.ceil(this.file.size / this.chunkSize);
      
      console.log(`开始分片上传: 文件大小=${this.file.size}, 分片数量=${totalChunks}, 分片大小=${this.chunkSize}`);

      // 上传所有分片
      for (let i = 0; i < totalChunks; i++) {
        const start = i * this.chunkSize;
        const end = Math.min(start + this.chunkSize, this.file.size);
        const chunk = this.file.slice(start, end);
        const chunkName = `${this.fileName}.part${i}`;

        console.log(`正在上传分片 ${i + 1}/${totalChunks}: ${chunkName}`);

        // 为分片文件设置正确的contentType
        let contentType = 'application/octet-stream';
        if (this.file.type) {
          contentType = this.file.type;
        } else {
          // 根据文件扩展名推断MIME类型
          const ext = this.file.name.split('.').pop()?.toLowerCase();
          switch (ext) {
            case 'zip':
              contentType = 'application/zip';
              break;
            case 'rar':
              contentType = 'application/x-rar-compressed';
              break;
            case '7z':
              contentType = 'application/x-7z-compressed';
              break;
            case 'tar':
              contentType = 'application/x-tar';
              break;
            default:
              contentType = 'application/octet-stream';
          }
        }

        const { error } = await this.supabase.storage
          .from(this.bucketName)
          .upload(chunkName, chunk, {
            cacheControl: '3600',
            upsert: true,
            contentType: contentType
          });

        if (error) {
          console.error(`分片上传失败 ${i + 1}/${totalChunks}:`, error);
          if (this.onError) {
            this.onError(new Error(`分片上传失败: ${error.message}`));
          }
          return { data: null, error };
        }

        // 报告进度
        if (this.onProgress) {
          const progress = ((i + 1) / totalChunks) * 100;
          this.onProgress(progress);
        }
      }

      // 上传元数据
      const metadata = {
        fileName: this.fileName,
        fileSize: this.file.size,
        chunkSize: this.chunkSize,
        totalChunks: totalChunks,
        mimeType: this.file.type
      };

      const metadataBlob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
      const { error: metadataError } = await this.supabase.storage
        .from(this.bucketName)
        .upload(`${this.fileName}.metadata.json`, metadataBlob, {
          cacheControl: '3600',
          upsert: true,
          contentType: 'application/json'
        });

      if (metadataError) {
        console.error('元数据上传失败:', metadataError);
        if (this.onError) {
          this.onError(new Error(`元数据上传失败: ${metadataError.message}`));
        }
        return { data: null, error: metadataError };
      }

      console.log('所有分片上传完成');
      
      if (this.onComplete) {
        this.onComplete();
      }

      return { 
        data: { 
          path: this.fileName,
          fullPath: `${this.bucketName}/${this.fileName}`
        }, 
        error: null 
      };
    } catch (error) {
      console.error('文件上传失败:', error);
      if (this.onError) {
        this.onError(error as Error);
      }
      return { data: null, error };
    }
  }
}

/**
 * 便捷函数：上传文件（自动处理大小）
 * @param supabase Supabase客户端实例
 * @param file 要上传的文件
 * @param bucketName 存储桶名称
 * @param fileName 文件名
 * @param options 上传选项
 * @returns 上传结果
 */
export async function uploadLargeFile(
  supabase: any,
  file: File,
  bucketName: string,
  fileName: string,
  options: {
    chunkSize?: number;
    onProgress?: (progress: number) => void;
    onError?: (error: Error) => void;
    onComplete?: () => void;
  } = {}
): Promise<{ data: any; error: any }> {
  // 对于小文件，直接使用标准上传
  if (file.size <= (options.chunkSize || 10 * 1024 * 1024)) {
    // 为小文件也设置正确的contentType
    let contentType = 'application/octet-stream';
    if (file.type) {
      contentType = file.type;
    } else {
      // 根据文件扩展名推断MIME类型
      const ext = file.name.split('.').pop()?.toLowerCase();
      switch (ext) {
        case 'zip':
          contentType = 'application/zip';
          break;
        case 'rar':
          contentType = 'application/x-rar-compressed';
          break;
        case '7z':
          contentType = 'application/x-7z-compressed';
          break;
        case 'tar':
          contentType = 'application/x-tar';
          break;
        default:
          contentType = 'application/octet-stream';
      }
    }

    return await supabase.storage
      .from(bucketName)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: contentType
      });
  }

  // 对于大文件，使用分片上传
  const uploader = new SupabaseChunkedUploader(
    supabase, 
    file, 
    bucketName, 
    fileName, 
    options
  );
  
  return await uploader.upload();
}