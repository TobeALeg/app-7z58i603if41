export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto py-12 px-4 xl:px-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">关于比赛</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              智能体比赛旨在推动人工智能技术的创新与应用，为参赛者提供展示才华的舞台，促进学术交流与技术进步。
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">联系我们</h3>
            <div className="text-muted-foreground text-sm space-y-2">
              <p>📧 邮箱: competition@ai-contest.com</p>
              <p>📱 电话: 400-123-4567</p>
              <p>🏢 地址: 北京市海淀区中关村大街1号</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">重要时间</h3>
            <div className="text-muted-foreground text-sm space-y-2">
              <p>报名截止: 2025年12月31日</p>
              <p>作品提交: 2026年1月15日</p>
              <p>结果公布: 2026年2月1日</p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center text-muted-foreground text-sm">
          <p>{currentYear} 智能体比赛报名平台</p>
        </div>
      </div>
    </footer>
  );
}
