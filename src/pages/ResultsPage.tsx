import { useState, useEffect } from 'react';
import { getAllCompetitionGroups, getPublishedCompetitionResults } from '@/db/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Medal, Award } from 'lucide-react';
import type { CompetitionGroup, CompetitionResultWithDetails } from '@/types/types';

export default function ResultsPage() {
  const [groups, setGroups] = useState<CompetitionGroup[]>([]);
  const [results, setResults] = useState<CompetitionResultWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [groupsData, resultsData] = await Promise.all([
      getAllCompetitionGroups(),
      getPublishedCompetitionResults()
    ]);
    setGroups(groupsData);
    setResults(resultsData);
    setLoading(false);
  };

  // 获取赛道类型显示文本
  const getTrackTypeText = (trackType: string) => {
    switch (trackType) {
      case 'student-individual':
        return '学生个人赛';
      case 'student-team':
        return '学生团队赛';
      case 'teacher-individual':
        return '教职工个人赛';
      case 'teacher-team':
        return '教职工团队赛';
      case 'student-instructor':
        return '学生赛道（指导教师）';
      default:
        return '未知赛道';
    }
  };

  // 按用户类型分组结果
  const groupResultsByUserType = () => {
    const studentResults: CompetitionResultWithDetails[] = [];
    const staffResults: CompetitionResultWithDetails[] = [];
    
    results.forEach(result => {
      const trackType = result.registration?.track_type;
      if (trackType && (
        trackType === 'student-individual' || 
        trackType === 'student-team' || 
        trackType === 'student-instructor')) {
        studentResults.push(result);
      } else if (trackType && (
        trackType === 'teacher-individual' || 
        trackType === 'teacher-team')) {
        staffResults.push(result);
      }
    });
    
    return { studentResults, staffResults };
  };

  const getAwardIcon = (awardLevel: string) => {
    switch (awardLevel) {
      case 'first_prize':
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 'second_prize':
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 'third_prize':
        return <Medal className="w-5 h-5 text-amber-700" />;
      default:
        return <Award className="w-5 h-5 text-blue-500" />;
    }
  };

  const getAwardColor = (awardLevel: string) => {
    switch (awardLevel) {
      case 'first_prize':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'second_prize':
        return 'bg-gray-400/10 text-gray-400 border-gray-400/20';
      case 'third_prize':
        return 'bg-amber-700/10 text-amber-700 border-amber-700/20';
      default:
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    }
  };

  const { studentResults, staffResults } = groupResultsByUserType();

  const groupedStudentResults = groups.map(group => ({
    ...group,
    results: studentResults.filter(result => result.group_id === group.id)
  }));

  const groupedStaffResults = groups.map(group => ({
    ...group,
    results: staffResults.filter(result => result.group_id === group.id)
  }));

  return (
    <div className="min-h-screen py-12 bg-muted">
      <div className="max-w-7xl mx-auto px-4 xl:px-8">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg gradient-bg-primary flex items-center justify-center shadow-glow">
              <Trophy className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold gradient-text">比赛结果公布</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            感谢所有参赛者的积极参与，以下是本次比赛的获奖结果
          </p>
        </div>

        {loading ? (
          <div className="space-y-6">
            <Skeleton className="h-12 w-64 mx-auto" />
            <div className="grid gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="shadow-elegant">
                  <CardHeader>
                    <Skeleton className="h-6 w-1/3" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[1, 2, 3].map((j) => (
                      <div key={j} className="space-y-2">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-16 w-full" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : groups.length === 0 ? (
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle>暂无比赛组别</CardTitle>
              <CardDescription>尚未设置比赛组别信息</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <Tabs defaultValue="student" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="student" className="gap-2">
                学生赛道
              </TabsTrigger>
              <TabsTrigger value="staff" className="gap-2">
                教职工赛道
              </TabsTrigger>
            </TabsList>

            <TabsContent value="student" className="space-y-6">
              <Tabs defaultValue={groups[0]?.id} className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
                  {groups.map((group) => (
                    <TabsTrigger key={group.id} value={group.id} className="gap-2">
                      {group.name}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {groupedStudentResults.map((group) => (
                  <TabsContent key={group.id} value={group.id} className="space-y-4">
                    {group.results.length === 0 ? (
                      <Card className="shadow-elegant">
                        <CardHeader>
                          <CardTitle>暂无结果</CardTitle>
                          <CardDescription>该组别尚未公布学生赛道比赛结果</CardDescription>
                        </CardHeader>
                      </Card>
                    ) : (
                      <div className="space-y-6">
                        {/* 按奖项级别分组显示结果 */}
                        {['first_prize', 'second_prize', 'third_prize', 'honorable_mention'].map(level => {
                          const levelResults = group.results.filter(r => r.award_level === level);
                          if (levelResults.length === 0) return null;
                          
                          const awardNames: Record<string, string> = {
                            'first_prize': '一等奖',
                            'second_prize': '二等奖',
                            'third_prize': '三等奖',
                            'honorable_mention': '优秀奖'
                          };
                          
                          return (
                            <div key={level} className="space-y-4">
                              <div className="flex items-center gap-2">
                                {getAwardIcon(level)}
                                <h3 className="text-xl font-semibold">{awardNames[level]}</h3>
                                <Badge variant="secondary">{levelResults.length} 项</Badge>
                              </div>
                              
                              <div className="grid gap-4">
                                {levelResults.map((result) => (
                                  <Card key={result.id} className="shadow-elegant hover:shadow-glow transition-smooth">
                                    <CardContent className="p-6">
                                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex-1">
                                          <div className="flex items-start gap-3">
                                            {getAwardIcon(result.award_level)}
                                            <div>
                                              <h4 className="text-lg font-semibold">{result.registration?.project_name}</h4>
                                              <p className="text-muted-foreground">
                                                参赛者: {result.registration?.name}
                                                {result.registration?.team_name && ` (${result.registration.team_name})`}
                                              </p>
                                              {result.registration?.track_type && (
                                                <Badge variant="outline" className="mt-1">
                                                  {getTrackTypeText(result.registration.track_type)}
                                                </Badge>
                                              )}
                                              {result.remarks && (
                                                <p className="mt-2 text-sm italic">{result.remarks}</p>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                        <Badge className={`${getAwardColor(result.award_level)} gap-1 whitespace-nowrap`}>
                                          {result.award_name}
                                        </Badge>
                                      </div>
                                      
                                      {result.registration?.project_description && (
                                        <div className="mt-4 pt-4 border-t border-border">
                                          <p className="text-sm">{result.registration.project_description}</p>
                                        </div>
                                      )}
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </TabsContent>

            <TabsContent value="staff" className="space-y-6">
              <Tabs defaultValue={groups[0]?.id} className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
                  {groups.map((group) => (
                    <TabsTrigger key={group.id} value={group.id} className="gap-2">
                      {group.name}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {groupedStaffResults.map((group) => (
                  <TabsContent key={group.id} value={group.id} className="space-y-4">
                    {group.results.length === 0 ? (
                      <Card className="shadow-elegant">
                        <CardHeader>
                          <CardTitle>暂无结果</CardTitle>
                          <CardDescription>该组别尚未公布教职工赛道比赛结果</CardDescription>
                        </CardHeader>
                      </Card>
                    ) : (
                      <div className="space-y-6">
                        {/* 按奖项级别分组显示结果 */}
                        {['first_prize', 'second_prize', 'third_prize', 'honorable_mention'].map(level => {
                          const levelResults = group.results.filter(r => r.award_level === level);
                          if (levelResults.length === 0) return null;
                          
                          const awardNames: Record<string, string> = {
                            'first_prize': '一等奖',
                            'second_prize': '二等奖',
                            'third_prize': '三等奖',
                            'honorable_mention': '优秀奖'
                          };
                          
                          return (
                            <div key={level} className="space-y-4">
                              <div className="flex items-center gap-2">
                                {getAwardIcon(level)}
                                <h3 className="text-xl font-semibold">{awardNames[level]}</h3>
                                <Badge variant="secondary">{levelResults.length} 项</Badge>
                              </div>
                              
                              <div className="grid gap-4">
                                {levelResults.map((result) => (
                                  <Card key={result.id} className="shadow-elegant hover:shadow-glow transition-smooth">
                                    <CardContent className="p-6">
                                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex-1">
                                          <div className="flex items-start gap-3">
                                            {getAwardIcon(result.award_level)}
                                            <div>
                                              <h4 className="text-lg font-semibold">{result.registration?.project_name}</h4>
                                              <p className="text-muted-foreground">
                                                参赛者: {result.registration?.name}
                                                {result.registration?.team_name && ` (${result.registration.team_name})`}
                                              </p>
                                              {result.registration?.track_type && (
                                                <Badge variant="outline" className="mt-1">
                                                  {getTrackTypeText(result.registration.track_type)}
                                                </Badge>
                                              )}
                                              {result.remarks && (
                                                <p className="mt-2 text-sm italic">{result.remarks}</p>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                        <Badge className={`${getAwardColor(result.award_level)} gap-1 whitespace-nowrap`}>
                                          {result.award_name}
                                        </Badge>
                                      </div>
                                      
                                      {result.registration?.project_description && (
                                        <div className="mt-4 pt-4 border-t border-border">
                                          <p className="text-sm">{result.registration.project_description}</p>
                                        </div>
                                      )}
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}