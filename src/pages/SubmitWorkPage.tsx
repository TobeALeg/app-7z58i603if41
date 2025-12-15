import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getRegistrationsByUserId, createWork, uploadWorkFile } from '@/db/api';
import { compressImage, formatFileSize, validateImageFile } from '@/lib/imageCompression';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Upload, Loader2, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { RegistrationWithWorks } from '@/types/types';

// 设置200MB的文件大小限制（以字节为单位）
const MAX_FILE_SIZE = 200 * 1024 * 1024;

export default function SubmitWorkPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [registrations, setRegistrations] = useState<RegistrationWithWorks[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [compressionInfo, setCompressionInfo] = useState<string>('');

  const [formData, setFormData] = useState({
    registration_id: '',
    work_title: '',
    work_description: '',
    work_url: ''
  });

  useEffect(() => {
    if (user) {
      loadRegistrations();
    }
  }, [user]);

  const loadRegistrations = async () => {
    if (!user) return;
    const data = await getRegistrationsByUserId(user.id);
    setRegistrations(data.filter(r => r.status === 'approved'));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 检查文件大小
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: '文件过大',
        description: `文件大小不能超过200MB，当前文件大小为${formatFileSize(file.size)}`,
        variant: 'destructive'
      });
      e.target.value = '';
      return;
    }

    // 检查是否为图片或压缩文件
    let isImage = file.type.startsWith('image/');
    let isCompressed = file.type === 'application/zip' || 
                       file.type === 'application/x-zip-compressed' || // Windows系统常用ZIP MIME类型
                       file.type === 'application/x-rar-compressed' || 
                       file.type === 'application/x-7z-compressed' || 
                       file.type === 'application/x-tar';

    // 对于某些浏览器，可能无法正确识别文件类型，我们通过文件扩展名再检查一遍
    if (!isImage && !isCompressed) {
      const fileName = file.name.toLowerCase();
      if (fileName.endsWith('.zip') || fileName.endsWith('.rar') || 
          fileName.endsWith('.7z') || fileName.endsWith('.tar')) {
        isCompressed = true;
      }
    }

    if (!isImage && !isCompressed) {
      toast({
        title: '文件格式错误',
        description: '仅支持 JPEG、PNG、GIF、WEBP 格式的图片和 ZIP、RAR、7Z、TAR 格式的压缩包',
        variant: 'destructive'
      });
      e.target.value = '';
      return;
    }

    try {
      const result = await compressImage(file);
      setSelectedFile(result.file);
      
      if (result.compressed) {
        const info = `图片已自动压缩：${formatFileSize(result.originalSize)} → ${formatFileSize(result.finalSize)}`;
        setCompressionInfo(info);
        toast({
          title: '图片已压缩',
          description: info
        });
      } else {
        setCompressionInfo('');
        if (isCompressed) {
          toast({
            title: '文件已选择',
            description: `${file.name} (${formatFileSize(file.size)})`
          });
        }
      }
    } catch (error) {
      toast({
        title: '文件处理失败',
        description: error instanceof Error ? error.message : '文件处理失败',
        variant: 'destructive'
      });
      e.target.value = '';
    }
  };

  const validateForm = () => {
    if (!formData.registration_id) {
      toast({
        title: '错误',
        description: '请选择报名记录',
        variant: 'destructive'
      });
      return false;
    }

    if (!formData.work_title.trim()) {
      toast({
        title: '错误',
        description: '请输入作品标题',
        variant: 'destructive'
      });
      return false;
    }

    if (!selectedFile && !formData.work_url.trim()) {
      toast({
        title: '错误',
        description: '请上传作品文件或填写作品链接',
        variant: 'destructive'
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: '错误',
        description: '请先登录',
        variant: 'destructive'
      });
      navigate('/login');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    let filePath: string | null = null;

    if (selectedFile) {
      setUploading(true);
      setUploadProgress(0); // 初始化进度为0
      
      // 添加上传前的调试信息
      console.log("开始上传文件:", {
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type
      });
      
      // 使用支持分片上传和进度回调的新函数
      filePath = await uploadWorkFile(selectedFile, (progress) => {
        setUploadProgress(progress);
      });
      
      setUploading(false);
      setUploadProgress(null); // 清除进度

      if (!filePath) {
        toast({
          title: '上传失败',
          description: '文件上传失败，请稍后重试',
          variant: 'destructive'
        });
        setLoading(false);
        return;
      }
    }

    const result = await createWork({
      registration_id: formData.registration_id,
      work_title: formData.work_title.trim(),
      work_description: formData.work_description.trim() || null,
      work_url: formData.work_url.trim() || null,
      file_path: filePath
    });

    setLoading(false);

    if (result) {
      toast({
        title: '提交成功',
        description: '您的作品已成功提交'
      });
      navigate('/my-registration');
    } else {
      toast({
        title: '提交失败',
        description: '作品提交失败，请稍后重试',
        variant: 'destructive'
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen py-12 bg-muted">
        <div className="max-w-3xl mx-auto px-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>需要登录</AlertTitle>
            <AlertDescription>
              请先登录后再提交作品
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (registrations.length === 0) {
    return (
      <div className="min-h-screen py-12 bg-muted">
        <div className="max-w-3xl mx-auto px-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>暂无可用报名</AlertTitle>
            <AlertDescription>
              您还没有已通过审核的报名记录，请先完成报名并等待审核通过
            </AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button onClick={() => navigate('/register')}>
              前往报名
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-muted">
      <div className="max-w-3xl mx-auto px-4">
        <Card className="shadow-elegant">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-lg gradient-bg-secondary flex items-center justify-center shadow-glow">
                <Upload className="w-6 h-6 text-secondary-foreground" />
              </div>
              <div>
                <CardTitle className="text-2xl">提交作品</CardTitle>
                <CardDescription>上传您的参赛作品</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="registration_id">选择报名记录 <span className="text-destructive">*</span></Label>
                <Select
                  value={formData.registration_id}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, registration_id: value }))}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="请选择报名记录" />
                  </SelectTrigger>
                  <SelectContent>
                    {registrations.map((reg) => (
                      <SelectItem key={reg.id} value={reg.id}>
                        {reg.project_name} - {reg.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="work_title">作品标题 <span className="text-destructive">*</span></Label>
                <Input
                  id="work_title"
                  name="work_title"
                  placeholder="请输入作品标题"
                  value={formData.work_title}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="work_description">作品描述</Label>
                <Textarea
                  id="work_description"
                  name="work_description"
                  placeholder="请描述您的作品（选填）"
                  rows={4}
                  value={formData.work_description}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="work_url">作品链接</Label>
                <Input
                  id="work_url"
                  name="work_url"
                  type="url"
                  placeholder="如有在线作品链接请填写（选填）"
                  value={formData.work_url}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="file">上传作品文件</Label>
                <Input
                  id="file"
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp,application/zip,application/x-zip-compressed,application/x-rar-compressed,application/x-7z-compressed,application/x-tar"
                  onChange={handleFileChange}
                  disabled={loading}
                  className="cursor-pointer"
                />
                <p className="text-sm text-muted-foreground">
                  支持 JPEG、PNG、GIF、WEBP 图片格式和 ZIP、RAR、7Z、TAR 压缩包格式，文件大小限制 200MB
                </p>
                {selectedFile && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>文件已选择</AlertTitle>
                    <AlertDescription>
                      {selectedFile.name} ({formatFileSize(selectedFile.size)})
                      {compressionInfo && <div className="mt-1 text-xs">{compressionInfo}</div>}
                      {uploadProgress !== null && (
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${uploadProgress}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            上传进度: {uploadProgress.toFixed(1)}%
                          </div>
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" className="flex-1 gap-2" disabled={loading}>
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      上传中...
                    </>
                  ) : loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      提交中...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4" />
                      提交作品
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/my-registration')}
                  disabled={loading}
                >
                  取消
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}