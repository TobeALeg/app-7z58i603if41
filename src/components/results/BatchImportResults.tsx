import { useState, useRef, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Download, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { downloadExcelTemplate, parseExcelFile } from '@/utils/excelUtils';

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

interface ParsedResult {
  group_name: string;
  project_name: string;
  winner_name: string;
  award_level: string;
  award_name: string;
  ranking: number | null;
  score: number | null;
  remarks: string | null;
}

export default function BatchImportResults({ 
  groups, 
  registrations, 
  onImport 
}: { 
  groups: any[]; 
  registrations: any[]; 
  onImport: (results: any[]) => Promise<ImportResult>;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [parsedResults, setParsedResults] = useState<ParsedResult[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const downloadTemplate = () => {
    console.log('开始下载模板');
    downloadExcelTemplate();
    toast({
      title: '模板下载',
      description: 'CSV模板已开始下载'
    });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    console.log('选择文件:', selectedFile?.name, selectedFile?.type, selectedFile?.size);
    
    if (selectedFile) {
      // 检查文件类型
      const fileType = selectedFile.name.split('.').pop()?.toLowerCase();
      console.log('文件扩展名:', fileType);
      
      if (fileType !== 'csv') {
        const errorMsg = '仅支持CSV格式文件';
        console.error(errorMsg);
        toast({
          title: '文件类型错误',
          description: errorMsg,
          variant: 'destructive'
        });
        return;
      }
      
      setFile(selectedFile);
      setImportResult(null);
      setParsedResults([]);
    }
  };

  const validateData = (data: ParsedResult[]): { valid: boolean; errors: string[] } => {
    console.log('开始验证数据，数据条数:', data.length);
    const errors: string[] = [];
    
    data.forEach((item, index) => {
      const rowNumber = index + 2; // 表头占一行
      console.log(`验证第${rowNumber}行数据:`, item);
      
      // 检查必填字段
      if (!item.group_name) {
        errors.push(`第${rowNumber}行: 缺少组别名称`);
      }
      
      if (!item.project_name) {
        errors.push(`第${rowNumber}行: 缺少项目名称`);
      }
      
      if (!item.winner_name) {
        errors.push(`第${rowNumber}行: 缺少获奖者姓名`);
      }
      
      if (!item.award_name) {
        errors.push(`第${rowNumber}行: 缺少奖项名称`);
      }
      
      // 检查奖项等级是否有效
      const validAwardLevels = ['first_prize', 'second_prize', 'third_prize', 'honorable_mention'];
      if (item.award_level && !validAwardLevels.includes(item.award_level)) {
        errors.push(`第${rowNumber}行: 无效的奖项等级 "${item.award_level}"`);
      }
      
      // 检查数值字段
      if (item.ranking !== null && (isNaN(Number(item.ranking)) || Number(item.ranking) <= 0)) {
        errors.push(`第${rowNumber}行: 无效的排名值`);
      }
      
      if (item.score !== null && isNaN(Number(item.score))) {
        errors.push(`第${rowNumber}行: 无效的得分值`);
      }
    });
    
    console.log('验证完成，错误数量:', errors.length);
    return { valid: errors.length === 0, errors };
  };

  const handleImport = async () => {
    console.log('开始导入文件');
    
    if (!file) {
      const errorMsg = '请先选择要导入的文件';
      console.error(errorMsg);
      toast({
        title: '错误',
        description: errorMsg,
        variant: 'destructive'
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setImportResult(null);

    try {
      // 解析文件
      console.log('开始解析文件');
      setProgress(20);
      const parsedData = await parseExcelFile(file);
      console.log('文件解析完成，数据条数:', parsedData.length);
      setParsedResults(parsedData);
      
      // 验证数据
      console.log('开始验证数据');
      setProgress(40);
      const validation = validateData(parsedData);
      console.log('数据验证结果:', validation);
      
      if (!validation.valid) {
        console.log('数据验证失败');
        setImportResult({
          success: 0,
          failed: parsedData.length,
          errors: validation.errors
        });
        setIsProcessing(false);
        return;
      }
      
      // 导入数据
      console.log('开始导入数据到系统');
      setProgress(60);
      const result = await onImport(parsedData);
      console.log('数据导入完成:', result);
      setImportResult(result);
      
      setProgress(100);
      
      toast({
        title: '导入完成',
        description: `成功导入 ${result.success} 条记录，失败 ${result.failed} 条`
      });
    } catch (error: any) {
      console.error('导入过程中发生异常:', error);
      toast({
        title: '导入失败',
        description: error.message || '导入过程中发生错误',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          批量导入比赛结果
        </CardTitle>
        <CardDescription>
          下载模板，填写数据后上传CSV文件批量导入比赛结果
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <Button onClick={downloadTemplate} variant="outline" className="flex-1 gap-2">
            <Download className="w-4 h-4" />
            下载模板
          </Button>
          
          <div className="flex-1 flex gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".csv"
              className="hidden"
            />
            <Button 
              onClick={() => fileInputRef.current?.click()} 
              variant="outline"
              className="flex-1"
            >
              {file ? file.name : '选择CSV文件'}
            </Button>
            <Button 
              onClick={handleImport} 
              disabled={!file || isProcessing}
              className="flex-1 gap-2"
            >
              <Upload className="w-4 h-4" />
              {isProcessing ? '导入中...' : '导入'}
            </Button>
          </div>
        </div>

        {isProcessing && (
          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-center text-muted-foreground">
              正在处理中... {progress}%
            </p>
          </div>
        )}

        {importResult && (
          <Alert variant={importResult.errors.length > 0 ? "destructive" : "default"}>
            {importResult.errors.length > 0 ? (
              <AlertCircle className="h-4 w-4" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            <AlertTitle>
              导入完成: 成功 {importResult.success} 条，失败 {importResult.failed} 条
            </AlertTitle>
            {importResult.errors.length > 0 && (
              <AlertDescription>
                <ul className="list-disc pl-5 space-y-1 mt-2">
                  {importResult.errors.slice(0, 5).map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                  {importResult.errors.length > 5 && (
                    <li>...还有 {importResult.errors.length - 5} 个错误</li>
                  )}
                </ul>
              </AlertDescription>
            )}
          </Alert>
        )}

        {parsedResults.length > 0 && importResult && importResult.errors.length === 0 && (
          <div className="text-sm text-muted-foreground">
            <p>预览前5条数据:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              {parsedResults.slice(0, 5).map((result, index) => (
                <li key={index}>
                  {result.project_name} - {result.award_name}
                </li>
              ))}
              {parsedResults.length > 5 && (
                <li>...还有 {parsedResults.length - 5} 条数据</li>
              )}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}