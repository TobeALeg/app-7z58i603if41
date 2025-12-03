import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Trophy, Users, FileText, CheckCircle, Clock } from 'lucide-react';

export default function HomePage() {
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
      <section className="gradient-bg-primary text-primary-foreground py-20">
        <div className="max-w-7xl mx-auto px-4 xl:px-8 text-center">
          <h1 className="text-4xl xl:text-6xl font-bold mb-6">
            智能体比赛报名平台
          </h1>
          <p className="text-lg xl:text-xl mb-8 opacity-90 max-w-3xl mx-auto">
            展示你的创新能力，与顶尖选手同台竞技，推动人工智能技术的发展与应用
          </p>
          <div className="flex flex-col xl:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" variant="secondary" className="gap-2 shadow-elegant">
                <FileText className="w-5 h-5" />
                立即报名
              </Button>
            </Link>
            <Link to="/rules">
              <Button size="lg" variant="outline" className="gap-2 bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                <Calendar className="w-5 h-5" />
                查看规则
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 xl:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 gradient-text">平台特色</h2>
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
