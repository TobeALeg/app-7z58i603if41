# 文件上传大小限制问题解决方案

## 问题概述

在尝试上传大于一定大小的文件时，出现以下错误：
```
StorageApiError: The object exceeded the maximum allowed size
```

尽管数据库中存储桶配置正确设置了 200MB 限制，但上传仍失败。

## 根本原因分析

经过调查发现，该问题并非源于应用代码或数据库配置，而是 Supabase 平台本身的限制：

1. Supabase 或其底层基础设施（如 NGINX）存在默认的文件上传大小限制
2. 这个限制通常低于我们在数据库中设置的值
3. 错误的状态码为 413 (Request Entity Too Large)，这是典型的 HTTP 层面限制

## 解决方案

### 短期解决方案（已实施）

降低前端文件大小限制，从 200MB 调整为 50MB：

1. 修改了 [src/pages/SubmitWorkPage.tsx](file:///home/lw/projects/app-7z58i603if41/src/pages/SubmitWorkPage.tsx) 中的 MAX_FILE_SIZE 常量
2. 更新了用户提示信息，告知用户限制原因和替代方案

### 长期解决方案（建议实施）

1. 实施分片上传机制：
   - 创建了 [src/lib/fileChunkUploader.ts](file:///home/lw/projects/app-7z58i603if41/src/lib/fileChunkUploader.ts) 作为分片上传的基础框架
   - 可以将大文件切分为多个小块分别上传，然后在服务器端合并

2. 考虑使用 CDN 或对象存储服务：
   - 如 AWS S3、阿里云 OSS 等专门用于大文件存储的服务
   - 这些服务通常有更好的大文件处理能力和更高的限制

3. 优化用户引导：
   - 引导用户使用压缩工具减小文件大小
   - 提供通过外部链接提交大文件的选项

## 验证方法

1. 使用调整后的 50MB 限制进行文件上传测试
2. 监控控制台输出确认没有 413 错误
3. 确认各种大小的文件都能正常上传

## 后续步骤

1. 部署更新后的代码到生产环境
2. 监控用户反馈和上传成功率
3. 根据实际情况决定是否需要实施长期解决方案