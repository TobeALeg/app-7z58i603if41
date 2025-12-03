import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Users, Trophy, AlertCircle } from 'lucide-react';

export default function RulesPage() {
  return (
    <div className="min-h-screen py-12 bg-muted">
      <div className="max-w-5xl mx-auto px-4 xl:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">比赛规则</h1>
          <p className="text-muted-foreground">请仔细阅读以下比赛规则和要求</p>
        </div>

        <div className="space-y-6">
          <Card className="shadow-elegant">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg gradient-bg-primary flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary-foreground" />
                </div>
                <CardTitle>参赛要求</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">1. 参赛资格</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                  <li>面向全国高校在校学生、研究生及相关从业人员</li>
                  <li>支持个人或团队参赛（团队人数不超过5人）</li>
                  <li>每位参赛者最多可参与2个项目</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">2. 作品要求</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                  <li>作品必须为原创，不得抄袭或侵犯他人知识产权</li>
                  <li>作品应基于人工智能技术，具有创新性和实用性</li>
                  <li>作品需包含完整的项目文档和演示材料</li>
                  <li>作品提交格式：支持图片、视频、文档等多种形式</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">3. 技术要求</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                  <li>作品应展示智能体的核心功能和创新点</li>
                  <li>需提供技术架构说明和实现方案</li>
                  <li>鼓励使用开源技术和工具</li>
                  <li>作品应具有可演示性和可复现性</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-elegant">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg gradient-bg-secondary flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-secondary-foreground" />
                </div>
                <CardTitle>评分标准</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <div className="bg-muted rounded-lg p-4">
                  <h3 className="font-semibold mb-2">创新性（30分）</h3>
                  <p className="text-sm text-muted-foreground">
                    作品的创新程度、技术突破和独特性
                  </p>
                </div>

                <div className="bg-muted rounded-lg p-4">
                  <h3 className="font-semibold mb-2">实用性（25分）</h3>
                  <p className="text-sm text-muted-foreground">
                    作品的应用价值和解决实际问题的能力
                  </p>
                </div>

                <div className="bg-muted rounded-lg p-4">
                  <h3 className="font-semibold mb-2">技术水平（25分）</h3>
                  <p className="text-sm text-muted-foreground">
                    技术实现的复杂度和完整性
                  </p>
                </div>

                <div className="bg-muted rounded-lg p-4">
                  <h3 className="font-semibold mb-2">展示效果（20分）</h3>
                  <p className="text-sm text-muted-foreground">
                    作品演示的完整性和表现力
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-elegant">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg gradient-bg-primary flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary-foreground" />
                </div>
                <CardTitle>奖项设置</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-lg p-4 border-2 border-yellow-300 dark:border-yellow-700">
                  <div className="text-center">
                    <div className="text-3xl mb-2">🥇</div>
                    <h3 className="font-bold text-lg mb-2">一等奖</h3>
                    <p className="text-sm text-muted-foreground mb-2">1名</p>
                    <p className="font-semibold text-primary">奖金 10,000 元</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 rounded-lg p-4 border-2 border-gray-300 dark:border-gray-700">
                  <div className="text-center">
                    <div className="text-3xl mb-2">🥈</div>
                    <h3 className="font-bold text-lg mb-2">二等奖</h3>
                    <p className="text-sm text-muted-foreground mb-2">3名</p>
                    <p className="font-semibold text-primary">奖金 5,000 元</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-4 border-2 border-orange-300 dark:border-orange-700">
                  <div className="text-center">
                    <div className="text-3xl mb-2">🥉</div>
                    <h3 className="font-bold text-lg mb-2">三等奖</h3>
                    <p className="text-sm text-muted-foreground mb-2">5名</p>
                    <p className="font-semibold text-primary">奖金 2,000 元</p>
                  </div>
                </div>
              </div>

              <div className="bg-muted rounded-lg p-4">
                <h3 className="font-semibold mb-2">优秀奖</h3>
                <p className="text-sm text-muted-foreground">
                  若干名，颁发荣誉证书和精美纪念品
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-elegant border-destructive/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-destructive" />
                </div>
                <CardTitle className="text-destructive">注意事项</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>• 所有参赛作品的知识产权归参赛者所有，主办方拥有展示和宣传权</p>
              <p>• 参赛者需保证作品的原创性，如发现抄袭将取消参赛资格</p>
              <p>• 报名信息一经提交不可修改，请仔细核对后提交</p>
              <p>• 作品提交截止后不接受任何形式的补充或修改</p>
              <p>• 主办方保留对比赛规则的最终解释权</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
