-- 添加对Windows ZIP文件格式的支持
UPDATE storage.buckets 
SET 
  file_size_limit = 209715200, -- 200MB
  allowed_mime_types = ARRAY[
    'image/jpeg', 
    'image/png', 
    'image/gif', 
    'image/webp',
    'application/zip',
    'application/x-zip-compressed',  -- Windows系统常用ZIP MIME类型
    'application/x-rar-compressed',
    'application/x-7z-compressed',
    'application/x-tar'
  ]
WHERE id = 'app-7z58i603if41_works_images';