import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { createRegistration } from '@/db/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { FileText, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    school: '',
    major: '',
    team_name: '',
    project_name: '',
    project_description: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast({
        title: '错误',
        description: '请输入姓名',
        variant: 'destructive'
      });
      return false;
    }

    if (!formData.phone.trim()) {
      toast({
        title: '错误',
        description: '请输入联系电话',
        variant: 'destructive'
      });
      return false;
    }

    if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
      toast({
        title: '错误',
        description: '请输入正确的手机号码',
        variant: 'destructive'
      });
      return false;
    }

    if (!formData.email.trim()) {
      toast({
        title: '错误',
        description: '请输入电子邮箱',
        variant: 'destructive'
      });
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast({
        title: '错误',
        description: '请输入正确的邮箱地址',
        variant: 'destructive'
      });
      return false;
    }

    if (!formData.school.trim()) {
      toast({
        title: '错误',
        description: '请输入学校/单位',
        variant: 'destructive'
      });
      return false;
    }

    if (!formData.project_name.trim()) {
      toast({
        title: '错误',
        description: '请输入项目名称',
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

    const result = await createRegistration({
      user_id: user.id,
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      school: formData.school.trim(),
      major: formData.major.trim() || null,
      team_name: formData.team_name.trim() || null,
      project_name: formData.project_name.trim(),
      project_description: formData.project_description.trim() || null
    });

    setLoading(false);

    if (result) {
      toast({
        title: '报名成功',
        description: '您的报名信息已提交，请等待审核'
      });
      navigate('/my-registration');
    } else {
      toast({
        title: '报名失败',
        description: '提交失败，请稍后重试',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="min-h-screen py-12 bg-muted">
      <div className="max-w-3xl mx-auto px-4">
        <Card className="shadow-elegant">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-lg gradient-bg-primary flex items-center justify-center shadow-glow">
                <FileText className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-2xl">比赛报名</CardTitle>
                <CardDescription>请填写以下信息完成报名</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">姓名 <span className="text-destructive">*</span></Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="请输入您的姓名"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">联系电话 <span className="text-destructive">*</span></Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="请输入手机号码"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">电子邮箱 <span className="text-destructive">*</span></Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="请输入邮箱地址"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="school">学校/单位 <span className="text-destructive">*</span></Label>
                  <Input
                    id="school"
                    name="school"
                    placeholder="请输入学校或单位名称"
                    value={formData.school}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="major">专业</Label>
                  <Input
                    id="major"
                    name="major"
                    placeholder="请输入专业（选填）"
                    value={formData.major}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="team_name">团队名称</Label>
                  <Input
                    id="team_name"
                    name="team_name"
                    placeholder="如为团队参赛请填写（选填）"
                    value={formData.team_name}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="project_name">项目名称 <span className="text-destructive">*</span></Label>
                <Input
                  id="project_name"
                  name="project_name"
                  placeholder="请输入参赛项目名称"
                  value={formData.project_name}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="project_description">项目描述</Label>
                <Textarea
                  id="project_description"
                  name="project_description"
                  placeholder="请简要描述您的项目（选填）"
                  rows={5}
                  value={formData.project_description}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" className="flex-1 gap-2" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      提交中...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4" />
                      提交报名
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/')}
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
