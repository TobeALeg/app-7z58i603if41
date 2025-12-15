import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Users, Trophy, AlertCircle, Download } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function RulesPage() {
  const [attachments, setAttachments] = useState<{name: string, url: string}[]>([]);

  useEffect(() => {
    // 从localStorage加载附件列表
    const savedAttachments = localStorage.getItem('competition-attachments');
    if (savedAttachments) {
      setAttachments(JSON.parse(savedAttachments));
    }
  }, []);

  return (
    <div className="min-h-screen py-12 bg-muted">
      <div className="max-w-5xl mx-auto px-4 xl:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2 text-center">关于举办温州商学院首届<span className="font-bold">"AI智能体创新应用大赛"</span>的通知</h1>
        </div>

        <div className="space-y-6">
          <Card className="shadow-elegant">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg gradient-bg-primary flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary-foreground" />
                </div>
                <CardTitle className="font-bold">比赛章程</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-bold mb-3 text-lg">大赛平台：<a href="https://agent.wzbc.edu.cn" style={{ color: 'blue' }}>HiAgent智能体开发平台</a></h3>
              </div>
              <div>
                <h3 className="font-bold mb-3 text-lg">1. 大赛宗旨</h3>
                <div className="ml-4 space-y-2">
                  <p className="text-sm text-muted-foreground">
                    本次大赛旨在汇聚师生智慧，基于学校统一的HiAgent智能体开发平台，围绕<span className="font-bold">真实教育教学场景</span>，设计、开发具有<span className="font-bold">创新性、实用性和示范性</span>的智能体应用，以<span className="font-bold">人工智能技术</span>赋能<span className="font-bold">教学、科研、管理与服务</span>，探索<span className="font-bold">智能教育新形态</span>，提升学校整体<span className="font-bold">数智化育人水平与治理效能</span>。
                  </p>
                </div>

              </div>

              <div>
                <h3 className="font-bold mb-3 text-lg">2. 报名要求</h3>
                <div className="ml-4 space-y-3">
                  <div>
                    <p className="font-semibold text-sm mb-1"><span className="font-bold">参赛对象</span>：</p>
                    <p className="text-sm text-muted-foreground ml-4">
                      本校所有教师和所有在校生。<span className="font-bold">可个人参赛或团队参赛</span>，参赛选手专业不限，鼓励<span className="font-bold">跨学科、跨专业组队</span>。
                    </p>
                  </div>
                  
                  <div>
                    <p className="font-semibold text-sm mb-1"><span className="font-bold">参赛赛道</span>：</p>
                    <div className="text-sm text-muted-foreground ml-4 space-y-2">
                      <p>
                        <span className="font-bold">教师赛道</span>：教师个人参赛或教师团队参赛（<span className="text-red-500">教师成员不超过3人</span>），教师也可作为学生团队的<span className="font-bold">指导教师</span>参赛。<span className="font-bold">教师只可从教师赛道和学生赛道</span>（指导教师）<span className="font-bold">二选一</span>。
                      </p>
                      <p>
                        <span className="font-bold">学生赛道</span>：学生个人参赛或学生团队参赛（<span className="text-red-500">学生成员不超过5人</span>）。学生团队参赛需明确<span className="font-bold">团队队长</span>，需指定一名<span className="font-bold">指导教师</span>，<span className="font-bold">每位学生只能加入一个学生团队参赛</span>。
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-bold mb-3 text-lg">3. 报名方式及时间</h3>
                <div className="ml-4 space-y-2">
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                    <li><span className="font-bold">报名时间</span>：自本通知发布起至<span className="text-red-500">2026年1月7日24点</span>，逾期不再受理。</li>
                    <li>参赛流程:参赛选手登录报名平台选择大赛报名，按要求填写个人/团队信息等相关材料，<span className="text-red-500">团体赛由队长统一在报名系统拉取队员并提交报名，队员无需重复报名。</span></li>
                    <li><span className="font-bold">智能体开发</span>:参赛选手登录HiAgent智能体开发平台进行智能体开发，开发完毕选择发布，完成作品上传备案。</li>
                    <li><span className="font-bold">作品提交</span>：参赛选手登录学校报名平台选择作品提交，所有材料命名为"<span className="font-bold">XX赛道+作品名称+个人/团队（队长姓名）</span>"，按要求提交相关材料。</li>
                    <li><span className="font-bold">成绩公布</span>:参赛选手根据成绩公布时间之日起登录报名平台查看成绩</li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="font-bold mb-3 text-lg">4. 组织机构</h3>
                <div className="ml-4 space-y-2">
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                    <li><span className="font-bold">主办单位</span>：<span className="font-bold">信息服务中心、教务部</span></li>
                    <li><span className="font-bold">协办单位</span>：<span className="font-bold">各学院、各部门</span></li>
                    <li><span className="font-bold">技术支持</span>：<span className="font-bold">HiAgent智能体开发平台</span></li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="font-bold mb-3 text-lg">5. 作品要求</h3>
                <div className="ml-4 space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-bold">参赛作品</span>须基于学校自建的HiAgent智能体开发平台"进行设计与开发，围绕<span className="font-bold">校园真实教育教学、管理服务等场景</span>打造，确保作品的<span className="font-bold">实用性与落地性。涉及复杂智能体开发可基于HiAgent智能体开发平台自行接入第三方平台的插件、MCP、智能体或业务系统等</span>。
                    </p>
                  </div>
                  
                  <div>
                    <p className="font-semibold text-sm mb-1"><span className="font-bold">智能体作品核心要求</span>：</p>
                    <div className="text-sm text-muted-foreground ml-4 space-y-2">
                      <p>
                        <span className="font-bold">场景真实性</span>：需详细描述智能体应用的具体<span className="font-bold">校园微场景</span>，精准定位师生或管理服务人员的<span className="font-bold">实际需求</span>，作品设计紧扣<span className="font-bold">需求痛点</span>，具有明确的<span className="font-bold">应用价值</span>。
                      </p>
                      <p>
                        <span className="font-bold">功能实用性</span>：功能设计需针对性解决<span className="font-bold">目标场景中的问题</span>，操作流程<span className="font-bold">简洁易用</span>，符合<span className="font-bold">目标用户群体的使用习惯</span>；同时具备一定的<span className="font-bold">可扩展性</span>，可根据<span className="font-bold">实际应用反馈</span>进行功能迭代。
                      </p>
                      <p>
                        <span className="font-bold">创新突破性</span>：作品在<span className="font-bold">设计理念、技术实现方式、应用场景拓展、服务模式</span>等方面需具备<span className="font-bold">创新性</span>，能够体现对<span className="font-bold">传统场景的优化升级</span>或<span className="font-bold">新应用场景的开拓</span>。
                      </p>
                      <p>
                        <span className="font-bold">原创合规性</span>：<span className="text-red-500">参赛作品必须为参赛团队（个人）原创，未侵犯任何第三方的知识产权、商业秘密等合法权益；严禁抄袭、剽窃他人作品，或使用未经授权的技术、数据、素材。参赛团队需签署原创承诺书，对作品原创性负责</span>。
                      </p>
                      <p>
                        <span className="font-bold">运行稳定性</span>：作品需经过<span className="font-bold">实际场景测试验证</span>，确保<span className="font-bold">核心功能完整、运行稳定</span>，无明显<span className="font-bold">漏洞</span>；能够适应一定规模的<span className="font-bold">用户使用需求</span>，具备<span className="font-bold">实际落地应用的基础条件</span>。
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="font-semibold text-sm mb-1"><span className="font-bold">材料清单</span>：</p>
                    <div className="text-sm text-muted-foreground ml-4 space-y-2">
                      <p>
                        <span className="font-bold">演示视频</span>：清晰展示智能体的<span className="font-bold">应用场景、设计思路、核心技术、功能操作流程及实际应用效果</span>。<span className="text-red-500">视频时长不超过3分钟</span>，<span className="text-red-500">分辨率不低于1920*1080</span>，<span className="font-bold">格式为MP4</span>，<span className="text-red-500">大小不超过500MB</span>，视频开头需注明<span className="text-red-500">智能体名称、参赛赛道、个人/团队（队长）信息</span>。
                      </p>
                      <p>
                        <span className="font-bold">说明文档</span>：提交<span className="font-bold">PDF格式</span>《<span className="text-red-500">智能体作品说明文档</span>》，内容需涵盖<span className="font-bold">应用背景、调研分析、设计思路、智能体解决方案（含架构设计）、技术实现方案（平台调用方式等）、功能使用说明、实际测试效果、创新点分析、应用前景</span>等，文档中需明确标注<span className="font-bold">智能体名称和在HiAgent平台的唯一ID</span>。
                      </p>
                      <p>
                        <span className="font-bold">作品封面</span>：每个参赛作品需提交<span className="font-bold">清晰的能体现作品特色的宣传图</span>（<span className="font-bold">JPG/PNG格式</span>，<span className="font-bold">比例16:9</span>，<span className="font-bold">分辨率不低于300dpi</span>），需包含<span className="font-bold">智能体名称、参赛赛道、个人/团队名称等基本信息</span>。
                      </p>
                      <p>
                        <span className="text-red-500">原创承诺书</span>：参赛团队所有成员（个人参赛为本人）<span className="font-bold">签字确认</span>，确保<span className="font-bold">作品原创性</span>。
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-bold mb-3 text-lg">6. 大赛安排</h3>
                <div className="ml-4 space-y-2">
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                    <li><span className="font-bold">报名时间</span>：<span className="font-bold">即日起至2026年1月7日</span>。</li>
                    <li><span className="font-bold">材料提交</span>：<span className="text-red-500">2026年3月1日前提交作品</span>。</li>
                    <li><span className="font-bold">作品评审</span>：<span className="text-red-500">2026年3月-4月进行评审</span>。</li>
                    <li><span className="font-bold">结果公布</span>：<span className="text-red-500">2026年5月</span>（具体日期另行通知）。</li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="font-bold mb-3 text-lg">7. 其他说明</h3>
                <div className="ml-4 space-y-2">
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                    <li><span className="font-bold">赛事培训</span>：为帮助参赛师生熟悉HiAgent智能体开发平台使用，学校将定期组织<span className="font-bold">平台操作培训</span>，请及时关注<span className="font-bold">超星学习通培训通知</span>，参赛师生及时报名参加。</li>
                    <li><span className="font-bold">知识产权</span>：参赛作品必须为<span className="text-red-500">原创</span>，<span className="text-red-500">严禁抄袭、剽窃他人作品</span>，<span className="text-red-500">不得侵犯他人知识产权</span>。学校享有对<span className="font-bold">优秀作品</span>的<span className="text-red-500">展示、推广、转化使用</span>的权利，使用前将与作者协商确认。</li>
                    <li><span className="font-bold">联系方式</span>：大赛最新动态、平台使用培训等将通过<span className="font-bold">学习通和大赛官方交流群</span>发布，请<span className="font-bold">密切关注</span>。</li>
                    <li><span className="font-bold">大赛负责人联系方式</span>：[<span className="font-bold">信息服务中心陈晓辉，13858811551</span>]，<span className="font-bold">技术支持联系方式</span>：[<span className="font-bold">信息服务中心李玮，联系电话：15803639729</span>]</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-elegant">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg gradient-bg-secondary flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-secondary-foreground" />
                </div>
                <CardTitle className="font-bold">智能体应用方向</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <div className="bg-muted rounded-lg p-4">
                  <h3 className="font-bold mb-2">教学赋能</h3>
                  <p className="text-sm text-muted-foreground">
                    聚焦<span className="font-bold">人工智能</span>在<span className="font-bold">课堂教学、课后辅导、自主学习、教学评价</span>等环节的<span className="font-bold">创新应用</span>，助力<span className="font-bold">教师提升教学质量、优化学生学习体验</span>，促进<span className="font-bold">大规模个性化学习与教学模式创新</span>。
                  </p>
                </div>

                <div className="bg-muted rounded-lg p-4">
                  <h3 className="font-bold mb-2">科研增效</h3>
                  <p className="text-sm text-muted-foreground">
                    探索<span className="font-bold">人工智能</span>在<span className="font-bold">文献检索与分析、实验设计优化、数据处理与可视化、科研成果撰写辅助</span>等方面的应用，助力<span className="font-bold">科研人员提高科研效率</span>，<span className="font-bold">突破科研瓶颈</span>，推动<span className="font-bold">科研创新发展</span>
                  </p>
                </div>

                <div className="bg-muted rounded-lg p-4">
                  <h3 className="font-bold mb-2">管理提效</h3>
                  <p className="text-sm text-muted-foreground">
                    关注<span className="font-bold">校园教学管理、学生管理、资产管理、行政办公</span>等领域的<span className="font-bold">智能化升级</span>，<span className="font-bold">优化管理流程</span>，实现<span className="font-bold">自动化、智能化办公</span>，提升<span className="font-bold">管理效率</span>。
                  </p>
                </div>

                <div className="bg-muted rounded-lg p-4">
                  <h3 className="font-bold mb-2">服务提质</h3>
                  <p className="text-sm text-muted-foreground">
                    着眼于<span className="font-bold">改善师生校园生活体验</span>，围绕<span className="font-bold">校园餐饮、住宿、交通、文化活动、身心健康</span>等场景开发<span className="font-bold">智能体应用</span>，提高<span className="font-bold">校园服务品质</span>。
                  </p>
                </div>

                <div className="bg-muted rounded-lg p-4">
                  <h3 className="font-bold mb-2">其他方向</h3>
                  <p className="text-sm text-muted-foreground">
                    参赛团队可结合<span className="font-bold">自身专业优势</span>，自行确定具有<span className="font-bold">明确应用价值与创新性</span>的<span className="font-bold">校园应用场景</span>，开展<span className="font-bold">创新设计与应用</span>。
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
                <CardTitle className="font-bold">奖项设置</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-lg p-4 border-2 border-yellow-300 dark:border-yellow-700">
                  <div className="text-center">
                    <div className="text-3xl mb-2">🥇</div>
                    <h3 className="font-bold text-lg mb-2">一等奖</h3>
                    <p className="text-sm text-muted-foreground mb-2"><span className="font-bold">2名</span></p>
                    <p className="font-semibold text-primary"><span className="font-bold">获奖证书以及奖品</span></p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 rounded-lg p-4 border-2 border-gray-300 dark:border-gray-700">
                  <div className="text-center">
                    <div className="text-3xl mb-2">🥈</div>
                    <h3 className="font-bold text-lg mb-2">二等奖</h3>
                    <p className="text-sm text-muted-foreground mb-2"><span className="font-bold">3名</span></p>
                    <p className="font-semibold text-primary"><span className="font-bold">获奖证书以及奖品</span></p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-4 border-2 border-orange-300 dark:border-orange-700">
                  <div className="text-center">
                    <div className="text-3xl mb-2">🥉</div>
                    <h3 className="font-bold text-lg mb-2">三等奖</h3>
                    <p className="text-sm text-muted-foreground mb-2"><span className="font-bold">5名</span></p>
                    <p className="font-semibold text-primary"><span className="font-bold">获奖证书以及奖品</span></p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 border-2 border-yellow-300 dark:border-yellow-700">
                  <div className="text-center">
                    <div className="text-3xl mb-2">🥇</div>
                    <h3 className="font-bold text-lg mb-2">最佳创新设计奖</h3>
                    <p className="text-sm text-muted-foreground mb-2"><span className="font-bold">2名</span></p>
                    <p className="font-semibold text-primary"><span className="font-bold">获奖证书以及奖品</span></p>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 border-2 border-yellow-300 dark:border-yellow-700">
                  <div className="text-center">
                    <div className="text-3xl mb-2">🥇</div>
                    <h3 className="font-bold text-lg mb-2">最佳创新应用奖</h3>
                    <p className="text-sm text-muted-foreground mb-2"><span className="font-bold">2名</span></p>
                    <p className="font-semibold text-primary"><span className="font-bold">获奖证书以及奖品</span></p>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 border-2 border-yellow-300 dark:border-yellow-700">
                  <div className="text-center">
                    <div className="text-3xl mb-2">🥇</div>
                    <h3 className="font-bold text-lg mb-2">指导教师奖项</h3>
                    <p className="text-sm text-muted-foreground mb-2"><span className="font-bold">若干</span></p>
                    <p className="font-semibold text-primary"><span className="font-bold">获奖证书以及奖品</span></p>
                  </div>
                </div>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <h3 className="font-bold mb-2">成果认定</h3>
                <p className="text-sm text-muted-foreground">
                  <span className="font-bold">教师赛道获奖成果</span>按照<span className="text-red-500">校级教学竞赛标准认定</span>；<span className="font-bold">学生赛道获奖成果</span>按照<span className="text-red-500">校级学科竞赛标准认定</span>；<span className="font-bold">指导学生获奖的教师</span>，按照<span className="text-red-500">指导校级学科竞赛的标准</span>予以<span className="font-bold">成果认定</span>。<span className="font-bold">获奖作品</span>将纳入<span className="text-red-500">学校AI赋能教育教学应用案例库</span>。
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
                <CardTitle className="text-destructive font-bold">注意事项</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>• <span className="font-bold">提交方式</span>：登录报名网站，按要求提交相关材料。所有材料命名为"<span className="font-bold">XX赛道+作品名称+个人/团队（队长姓名）</span>"，同时在<span className="text-red-500">HiAgent平台</span>完成作品上传备案。</p>
              <p>• 参赛者需保证作品的<span className="font-bold">原创性</span>，如发现<span className="font-bold">抄袭</span>将取消<span className="font-bold">参赛资格</span></p>
              <p>• <span className="font-bold">报名信息一经提交不可修改</span>，请<span className="font-bold">仔细核对后提交</span></p>
              <p>• <span className="font-bold">作品提交截止后不接受任何形式的补充或修改</span></p>
              <p>• <span className="font-bold">主办方保留对比赛规则的最终解释权</span></p>
            </CardContent>
          </Card>

          {/* 附件下载区域 */}
          <Card className="shadow-elegant">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg gradient-bg-primary flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary-foreground" />
                </div>
                <CardTitle className="font-bold">相关附件下载</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {attachments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>暂无附件</p>
                  <p className="text-sm mt-2">请等待管理员上传比赛相关资料</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {attachments.map((attachment, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-4 bg-muted rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium text-sm">{attachment.name}</div>
                        </div>
                      </div>
                      <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                        <button className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 transition-colors">
                          <Download className="w-4 h-4" />
                          下载
                        </button>
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}