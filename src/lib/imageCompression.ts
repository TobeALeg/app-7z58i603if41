// 图片压缩工具函数

const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200MB
const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1080;

export interface CompressionResult {
  file: File;
  compressed: boolean;
  originalSize: number;
  finalSize: number;
}

/**
 * 压缩图片文件
 * @param file 原始文件
 * @returns 压缩后的文件信息
 */
export async function compressImage(file: File): Promise<CompressionResult> {
  const originalSize = file.size;

  // 检查文件类型
  const isImage = validateImageFile(file);
  const isCompressed = validateCompressedFile(file);

  // 如果不是图片也不是压缩文件，则报错
  if (!isImage && !isCompressed) {
    throw new Error('文件格式不支持，请上传图片或压缩包文件');
  }

  // 如果是压缩文件且小于200MB，直接返回
  if (isCompressed) {
    if (originalSize <= MAX_FILE_SIZE) {
      return {
        file,
        compressed: false,
        originalSize,
        finalSize: originalSize
      };
    } else {
      throw new Error('压缩包文件大小超出限制，最大支持200MB');
    }
  }

  // 如果是图片且小于1MB，直接返回
  if (originalSize <= 1024 * 1024) {
    return {
      file,
      compressed: false,
      originalSize,
      finalSize: originalSize
    };
  }

  // 检查文件名是否包含中文
  if (/[\u4e00-\u9fa5]/.test(file.name)) {
    throw new Error('文件名不能包含中文字符，请使用英文或数字命名');
  }

  try {
    // 读取图片
    const img = await loadImage(file);
    
    // 计算新尺寸
    let { width, height } = calculateNewDimensions(img.width, img.height);
    
    // 创建 canvas
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('无法创建 canvas 上下文');
    }
    
    // 绘制图片
    ctx.drawImage(img, 0, 0, width, height);
    
    // 尝试不同的质量级别进行压缩
    let quality = 0.8;
    let compressedFile: File | null = null;
    
    while (quality > 0.1) {
      const blob = await canvasToBlob(canvas, 'image/webp', quality);
      
      if (blob.size <= 1024 * 1024) { // 保持原来的1MB图片限制
        // 生成新文件名（保留原始文件名，但改为 .webp）
        const newFileName = file.name.replace(/\.[^.]+$/, '.webp');
        compressedFile = new File([blob], newFileName, { type: 'image/webp' });
        break;
      }
      
      quality -= 0.1;
    }
    
    // 如果压缩后仍然超过1MB，进一步缩小尺寸
    if (!compressedFile || compressedFile.size > 1024 * 1024) {
      width = Math.floor(width * 0.8);
      height = Math.floor(height * 0.8);
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      
      const blob = await canvasToBlob(canvas, 'image/webp', 0.7);
      const newFileName = file.name.replace(/\.[^.]+$/, '.webp');
      compressedFile = new File([blob], newFileName, { type: 'image/webp' });
    }
    
    return {
      file: compressedFile,
      compressed: true,
      originalSize,
      finalSize: compressedFile.size
    };
  } catch (error) {
    console.error('图片压缩失败:', error);
    throw error;
  }
}

/**
 * 加载图片
 */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('图片加载失败'));
    };
    
    img.src = url;
  });
}

/**
 * 计算新尺寸（保持宽高比）
 */
function calculateNewDimensions(width: number, height: number): { width: number; height: number } {
  if (width <= MAX_WIDTH && height <= MAX_HEIGHT) {
    return { width, height };
  }
  
  const widthRatio = MAX_WIDTH / width;
  const heightRatio = MAX_HEIGHT / height;
  const ratio = Math.min(widthRatio, heightRatio);
  
  return {
    width: Math.floor(width * ratio),
    height: Math.floor(height * ratio)
  };
}

/**
 * Canvas 转 Blob
 */
function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Canvas 转换失败'));
        }
      },
      type,
      quality
    );
  });
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`;
  } else if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  } else {
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }
}

/**
 * 验证文件类型
 */
export function validateImageFile(file: File): boolean {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  return allowedTypes.includes(file.type);
}

/**
 * 验证压缩文件类型
 */
export function validateCompressedFile(file: File): boolean {
  const allowedTypes = [
    'application/zip', 
    'application/x-zip-compressed',  // Windows系统常用ZIP MIME类型
    'application/x-rar-compressed', 
    'application/x-7z-compressed', 
    'application/x-tar'
  ];
  
  // 首先检查 MIME 类型
  if (allowedTypes.includes(file.type)) {
    return true;
  }
  
  // 如果 MIME 类型检查失败，通过文件扩展名再检查一遍
  // 某些浏览器或操作系统可能无法正确识别压缩文件的 MIME 类型
  const fileName = file.name.toLowerCase();
  if (fileName.endsWith('.zip') || fileName.endsWith('.rar') || 
      fileName.endsWith('.7z') || fileName.endsWith('.tar')) {
    return true;
  }
  
  return false;
}