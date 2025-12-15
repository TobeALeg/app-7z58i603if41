import { useState } from 'react';
import { parseCSVFile } from '@/utils/excelUtils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export default function TestCSVPage() {
  const [file, setFile] = useState<File | null>(null);
  const [content, setContent] = useState('');
  const [result, setResult] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleParseFile = async () => {
    if (!file) {
      setError('请选择文件');
      return;
    }

    try {
      const parsedData = await parseCSVFile(file);
      setResult(parsedData);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
      setResult([]);
    }
  };

  const handleParseContent = async () => {
    if (!content) {
      setError('请输入CSV内容');
      return;
    }

    // 创建一个Blob并转换为File对象进行测试
    const blob = new Blob([content], { type: 'text/csv' });
    const testFile = new File([blob], 'test.csv', { type: 'text/csv' });
    
    try {
      const parsedData = await parseCSVFile(testFile);
      setResult(parsedData);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
      setResult([]);
    }
  };

  return (
    <div className="min-h-screen py-12 bg-muted">
      <div className="max-w-7xl mx-auto px-4 xl:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text">CSV解析测试页面</h1>
          <p className="text-muted-foreground">用于调试CSV文件解析问题</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>文件上传测试</CardTitle>
              <CardDescription>上传CSV文件进行解析测试</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="block w-full text-sm text-muted-foreground
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-primary file:text-primary-foreground
                  hover:file:bg-primary/90"
              />
              <Button onClick={handleParseFile} disabled={!file}>
                解析文件
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>内容粘贴测试</CardTitle>
              <CardDescription>粘贴CSV内容进行解析测试</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="粘贴CSV内容"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={10}
              />
              <Button onClick={handleParseContent}>
                解析内容
              </Button>
            </CardContent>
          </Card>
        </div>

        {error && (
          <Card className="mt-8 bg-destructive/10 border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">错误</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{error}</p>
            </CardContent>
          </Card>
        )}

        {result.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>解析结果</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}