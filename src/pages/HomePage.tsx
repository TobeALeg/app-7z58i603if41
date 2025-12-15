import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Calendar, Trophy, Users, FileText, CheckCircle, Clock, Sparkles, Award, Target, Download, User, FileTextIcon, Upload, Medal } from 'lucide-react';
import Autoplay from 'embla-carousel-autoplay';
import { useRef, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getRegistrationsByUserId } from '@/db/api';

export default function HomePage() {
  const plugin = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );
  
  const [attachments, setAttachments] = useState<{name: string, url: string}[]>([]);
  const { user, profile } = useAuth();
  const [userRegistration, setUserRegistration] = useState<any>(null);
  const [loadingRegistration, setLoadingRegistration] = useState(false);

  useEffect(() => {
    // 从localStorage加载附件列表
    const savedAttachments = localStorage.getItem('competition-attachments');
    if (savedAttachments) {
      setAttachments(JSON.parse(savedAttachments));
    }
  }, []);

  useEffect(() => {
    const fetchUserRegistration = async () => {
      if (user) {
        setLoadingRegistration(true);
        const registrations = await getRegistrationsByUserId(user.id);
        if (registrations.length > 0) {
          setUserRegistration(registrations[0]); // 假设每个用户只有一个报名
        }
        setLoadingRegistration(false);
      }
    };

    fetchUserRegistration();
  }, [user]);

  const carouselSlides = [
    {
      image: '/images/downloaded-image.png',
      title: 'AI智能体创新应用大赛',
      subtitle: '展示你的创新能力，与顶尖选手同台竞技',
      cta: '立即报名',
      ctaLink: '/register'
    },
    {
      image: '/images/downloaded-image1.png',
      title: '创新科技 · 智能未来',
      subtitle: '推动人工智能技术的发展与应用',
      cta: '查看规则',
      ctaLink: '/rules'
    },
    {
      image: '/images/downloaded-image2.png',
      title: '团队协作 · 共创辉煌',
      subtitle: '支持个人和团队参赛，展现协作能力',
      cta: '了解更多',
      ctaLink: '/rules'
    },
    {
      image: 'images/downloaded-image3.png',
      title: '智能时代 · 无限可能',
      subtitle: '探索人工智能的无限可能性',
      cta: '开始参赛',
      ctaLink: '/register'
    }
  ];

  const features = [
    {
      icon: <FileText className="w-8 h-8 text-primary" />,
      title: '在线报名',
      description: '便捷的在线报名系统，快速提交参赛信息'
    },
    {
      icon: <Trophy className="w-8 h-8 text-secondary" />,
      title: '作品提交',
      description: '支持多种格式的作品上传和管理'
    },
    {
      icon: <Users className="w-8 h-8 text-primary" />,
      title: '团队协作',
      description: '支持个人和团队参赛，展现协作能力'
    },
    {
      icon: <CheckCircle className="w-8 h-8 text-secondary" />,
      title: '状态查询',
      description: '实时查看报名状态和审核进度'
    }
  ];

  const highlights = [
    {
      icon: <Sparkles className="w-12 h-12 text-primary" />,
      title: '创新驱动',
      description: '鼓励创新思维，展示独特创意'
    },
    {
      icon: <Award className="w-12 h-12 text-secondary" />,
      title: '丰厚奖励',
      description: '优秀作品将获得丰厚奖金和证书'
    },
    {
      icon: <Target className="w-12 h-12 text-primary" />,
      title: '专业评审',
      description: '业界专家组成的评审团队'
    }
  ];

  const timeline = [
    {
      date: '2025年11月1日',
      title: '报名开始',
      description: '开放在线报名通道',
      status: 'completed'
    },
    {
      date: '2025年12月31日',
      title: '报名截止',
      description: '停止接收新的报名申请',
      status: 'active'
    },
    {
      date: '2026年1月15日',
      title: '作品提交截止',
      description: '所有参赛作品必须在此日期前提交',
      status: 'upcoming'
    },
    {
      date: '2026年1月31日',
      title: '评审阶段',
      description: '专家评审团对作品进行评审',
      status: 'upcoming'
    },
    {
      date: '2026年2月1日',
      title: '结果公布',
      description: '公布比赛结果和获奖名单',
      status: 'upcoming'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* 大屏轮播图 Hero Section */}
      <section className="">
        <Carousel
          plugins={[plugin.current]}
          className="w-full"
          onMouseEnter={plugin.current.stop}
          onMouseLeave={plugin.current.reset}
        >
          <CarouselContent>
            {carouselSlides.map((slide, index) => (
              <CarouselItem key={index}>
                <div className="relative h-screen max-h-[1080px]">
                  <div 
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${slide.image})` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
                  </div>
                  <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
                    <div className="max-w-2xl text-white">
                      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-in fade-in slide-in-from-left duration-700">
                        {slide.title}
                      </h1>
                      <p className="text-lg md:text-xl lg:text-2xl mb-8 opacity-90 animate-in fade-in slide-in-from-left duration-700 delay-150">
                        {slide.subtitle}
                      </p>
                      <Link to={slide.ctaLink}>
                        <Button size="lg" className="gap-2 shadow-glow animate-in fade-in slide-in-from-left duration-700 delay-300">
                          <FileText className="w-5 h-5" />
                          {slide.cta}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-4 md:left-8" />
          <CarouselNext className="right-4 md:right-8" />
        </Carousel>
      </section>

      {/* 比赛亮点 */}
      <section className="py-16 bg-gradient-to-b from-background to-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">比赛亮点</h2>
            <p className="text-muted-foreground text-lg">聚焦人工智能，探索智能教育新形态</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {highlights.map((highlight, index) => (
              <Card key={index} className="text-center shadow-elegant hover:shadow-glow transition-smooth border-2">
                <CardHeader>
                  <div className="flex justify-center mb-4">{highlight.icon}</div>
                  <CardTitle className="text-2xl">{highlight.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{highlight.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 赛程进度 */}
      {user && (
        <section className="py-16 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 gradient-text">我的赛程进度</h2>
            <div className="max-w-4xl mx-auto">
              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    {loadingRegistration ? (
                      <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
                    ) : userRegistration ? (
                      <span>{userRegistration.project_name}</span>
                    ) : (
                      <span>暂未报名</span>
                    )}
                  </CardTitle>
                  <CardDescription>
                    跟踪您的比赛进度和下一步操作
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingRegistration ? (
                    <div className="space-y-4">
                      <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  ) : userRegistration ? (
                    <div className="space-y-6">
                      {/* 报名状态 */}
                      <div className="flex items-center gap-4">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${userRegistration.status === 'approved' ? 'bg-green-100 text-green-600' : userRegistration.status === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                          <FileTextIcon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">报名提交</h3>
                          <p className="text-sm text-muted-foreground">
                            {userRegistration.status === 'approved' ? '已通过审核' : 
                             userRegistration.status === 'rejected' ? '未通过审核' : '等待审核'}
                          </p>
                        </div>
                        <div className={`px-2 py-1 rounded text-xs ${userRegistration.status === 'approved' ? 'bg-green-100 text-green-800' : userRegistration.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                          {userRegistration.status === 'approved' ? '已完成' : 
                           userRegistration.status === 'rejected' ? '已拒绝' : '进行中'}
                        </div>
                      </div>
                      
                      {/* 作品提交 */}
                      <div className="flex items-center gap-4">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${userRegistration.status === 'approved' && userRegistration.works && userRegistration.works.length > 0 ? 'bg-green-100 text-green-600' : userRegistration.status === 'approved' ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-400'}`}>
                          <Upload className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">作品提交</h3>
                          <p className="text-sm text-muted-foreground">
                            {userRegistration.status === 'approved' && userRegistration.works && userRegistration.works.length > 0 
                              ? `已提交 ${userRegistration.works.length} 个作品` 
                              : userRegistration.status === 'approved' 
                                ? '等待提交作品' 
                                : '需先通过报名审核'}
                          </p>
                        </div>
                        <div className={`px-2 py-1 rounded text-xs ${userRegistration.status === 'approved' && userRegistration.works && userRegistration.works.length > 0 ? 'bg-green-100 text-green-800' : userRegistration.status === 'approved' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                          {userRegistration.status === 'approved' && userRegistration.works && userRegistration.works.length > 0 
                            ? '已完成' 
                            : userRegistration.status === 'approved' 
                              ? '待完成' 
                              : '未开始'}
                        </div>
                      </div>
                      
                      {/* 结果公布 */}
                      <div className="flex items-center gap-4">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${userRegistration.status === 'approved' ? 'bg-gray-100 text-gray-400' : 'bg-gray-100 text-gray-400'}`}>
                          <Medal className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">结果公布</h3>
                          <p className="text-sm text-muted-foreground">
                            比赛评审完成后公布结果
                          </p>
                        </div>
                        <div className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">
                          未开始
                        </div>
                      </div>
                      
                      <div className="pt-4">
                        <Link to="/my-registration">
                          <Button variant="outline" size="sm">
                            查看详情
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-muted-foreground mb-4">您尚未报名参加比赛</p>
                      <Link to="/register">
                        <Button>
                          立即报名
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* 平台特色 */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 gradient-text">平台功能</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="shadow-elegant hover:shadow-glow transition-smooth">
                <CardHeader>
                  <div className="mb-4">{feature.icon}</div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 附件下载区域 */}
      <section className="py-16 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">比赛资料下载</h2>
            <p className="text-muted-foreground text-lg">下载最新的比赛章程和相关资料</p>
          </div>
          
          {attachments.length === 0 ? (
            <Card className="max-w-2xl mx-auto">
              <CardContent className="py-12 text-center">
                <FileText className="w-16 h-16 mx-auto mb-6 text-muted-foreground opacity-50" />
                <h3 className="text-xl font-semibold mb-2">暂无附件</h3>
                <p className="text-muted-foreground">管理员尚未上传比赛相关资料</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {attachments.map((attachment, index) => (
                <Card key={index} className="hover:shadow-glow transition-smooth">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <FileText className="w-8 h-8 text-primary" />
                      <CardTitle className="text-lg line-clamp-2">{attachment.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <a 
                      href={attachment.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full"
                    >
                      <Button className="w-full gap-2">
                        <Download className="w-4 h-4" />
                        点击下载
                      </Button>
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6 gradient-text">准备好了吗？</h2>
          <Link to="/register">
            <Button size="lg" className="gap-2 shadow-elegant">
              <FileText className="w-5 h-5" />
              立即报名参赛
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}