import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Calendar, Trophy, Users, FileText, CheckCircle, Clock, Sparkles, Award, Target } from 'lucide-react';
import Autoplay from 'embla-carousel-autoplay';
import { useRef } from 'react';

export default function HomePage() {
  const plugin = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  const carouselSlides = [
    {
      image: 'https://miaoda-site-img.cdn.bcebos.com/images/e1f12d9b-6976-4367-8b6d-a1a0b552c158.jpg',
      title: '智能体比赛报名平台',
      subtitle: '展示你的创新能力，与顶尖选手同台竞技',
      cta: '立即报名',
      ctaLink: '/register'
    },
    {
      image: 'https://miaoda-site-img.cdn.bcebos.com/images/6a46fbe3-f13e-46c9-bb3e-d5a951470c3f.jpg',
      title: '创新科技 · 智能未来',
      subtitle: '推动人工智能技术的发展与应用',
      cta: '查看规则',
      ctaLink: '/rules'
    },
    {
      image: 'https://miaoda-site-img.cdn.bcebos.com/images/00cb162a-d669-4142-bd66-dc0ebace94df.jpg',
      title: '团队协作 · 共创辉煌',
      subtitle: '支持个人和团队参赛，展现协作能力',
      cta: '了解更多',
      ctaLink: '/rules'
    },
    {
      image: 'https://miaoda-site-img.cdn.bcebos.com/images/272e707a-f30f-4579-9886-fe52707d86af.jpg',
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
      <section className="relative">
        <Carousel
          plugins={[plugin.current]}
          className="w-full"
          onMouseEnter={plugin.current.stop}
          onMouseLeave={plugin.current.reset}
        >
          <CarouselContent>
            {carouselSlides.map((slide, index) => (
              <CarouselItem key={index}>
                <div className="relative h-[500px] xl:h-[600px]">
                  <div 
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${slide.image})` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
                  </div>
                  <div className="relative h-full max-w-7xl mx-auto px-4 xl:px-8 flex items-center">
                    <div className="max-w-2xl text-white">
                      <h1 className="text-4xl xl:text-6xl font-bold mb-6 animate-in fade-in slide-in-from-left duration-700">
                        {slide.title}
                      </h1>
                      <p className="text-lg xl:text-2xl mb-8 opacity-90 animate-in fade-in slide-in-from-left duration-700 delay-150">
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
          <CarouselPrevious className="left-4 xl:left-8" />
          <CarouselNext className="right-4 xl:right-8" />
        </Carousel>
      </section>

      {/* 比赛亮点 */}
      <section className="py-16 bg-gradient-to-b from-background to-muted">
        <div className="max-w-7xl mx-auto px-4 xl:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl xl:text-4xl font-bold mb-4 gradient-text">比赛亮点</h2>
            <p className="text-muted-foreground text-lg">为什么选择我们的比赛平台</p>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
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

      {/* 平台特色 */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 xl:px-8">
          <h2 className="text-3xl xl:text-4xl font-bold text-center mb-12 gradient-text">平台特色</h2>
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
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

      <section className="py-16 bg-muted">
        <div className="max-w-7xl mx-auto px-4 xl:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 gradient-text">比赛时间轴</h2>
          <div className="max-w-4xl mx-auto">
            {timeline.map((item, index) => (
              <div key={index} className="flex gap-6 mb-8 last:mb-0">
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    item.status === 'completed' ? 'bg-secondary text-secondary-foreground' :
                    item.status === 'active' ? 'bg-primary text-primary-foreground' :
                    'bg-muted-foreground/20 text-muted-foreground'
                  }`}>
                    {item.status === 'completed' ? <CheckCircle className="w-6 h-6" /> :
                     item.status === 'active' ? <Clock className="w-6 h-6" /> :
                     <Calendar className="w-6 h-6" />}
                  </div>
                  {index < timeline.length - 1 && (
                    <div className="w-0.5 h-full min-h-[60px] bg-border mt-2" />
                  )}
                </div>
                <Card className="flex-1 shadow-elegant">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                      <span className={`text-sm px-3 py-1 rounded-full ${
                        item.status === 'completed' ? 'bg-secondary/10 text-secondary' :
                        item.status === 'active' ? 'bg-primary/10 text-primary' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {item.date}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{item.description}</CardDescription>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 xl:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6 gradient-text">准备好了吗？</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            加入我们，展示你的创新能力，与全国顶尖选手同台竞技
          </p>
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
