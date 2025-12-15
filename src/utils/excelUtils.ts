/**
 * 简化的Excel处理工具函数
 * 不依赖xlsx库，使用原生JavaScript处理CSV格式
 */

// 解析CSV文件
export const parseCSVFile = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        console.log('原始文件内容:', content.substring(0, 500) + (content.length > 500 ? '...' : '')); // 输出前500个字符
        
        // 按行分割，但要注意可能有引号包裹含换行符的内容
        const lines = content.split(/\r?\n/);
        console.log('分割后的行数:', lines.length);
        console.log('所有行内容:', lines);
        
        if (lines.length < 2) {
          const error = new Error('文件内容不足，至少需要包含表头和一行数据');
          console.error('文件内容不足:', lines.length);
          reject(error);
          return;
        }
        
        // 解析表头，处理可能的BOM标记和引号
        let headerLine = lines[0].trim();
        console.log('原始表头行:', headerLine);
        
        // 移除可能的BOM标记
        if (headerLine.charCodeAt(0) === 0xFEFF) {
          headerLine = headerLine.slice(1);
          console.log('移除BOM后的表头行:', headerLine);
        }
        
        // 解析CSV格式的表头
        const headers = parseCSVLine(headerLine);
        console.log('解析后的表头数组:', headers);
        
        // 检查表头是否正确
        if (headers.length === 0) {
          const error = new Error('无法解析表头，请检查CSV文件格式');
          console.error('表头解析失败');
          reject(error);
          return;
        }
        
        // 解析数据行
        const data = [];
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          console.log(`第${i}行原始内容:`, line);
          
          if (!line) {
            console.log(`第${i}行为空，跳过`);
            continue;
          }
          
          const values = parseCSVLine(line);
          console.log(`第${i}行解析后值:`, values);
          
          // 检查值是否正确解析
          if (values.length === 0) {
            console.log(`第${i}行解析后无有效值，跳过`);
            continue;
          }
          
          // 确保values和headers长度一致
          const row: any = {};
          for (let j = 0; j < headers.length; j++) {
            row[headers[j]] = j < values.length ? values[j] : '';
          }
          
          console.log(`第${i}行构造的row对象:`, row);
          data.push(row);
        }
        
        console.log('所有解析后的数据:', data);
        
        // 映射列名以支持中英文标题
        const mappedData = data.map((row, index) => {
          const mappedRow = {
            'group_name': row['组别名称'] || row['组别'] || row['GroupName'] || row['Group'] || '',
            'project_name': row['项目名称'] || row['项目'] || row['ProjectName'] || row['Project'] || '',
            'winner_name': row['获奖者姓名'] || row['获奖者'] || row['WinnerName'] || row['Winner'] || '',
            'award_level': row['奖项等级'] || row['AwardLevel'] || 'honorable_mention',
            'award_name': row['奖项名称'] || row['奖项'] || row['AwardName'] || row['Award'] || '',
            'ranking': row['排名'] || row['Ranking'] || null,
            'score': row['得分'] || row['Score'] || null,
            'remarks': row['备注'] || row['Remarks'] || null
          };
          console.log(`第${index}行映射后:`, mappedRow);
          return mappedRow;
        });
        
        console.log('最终映射后的所有数据:', mappedData);
        resolve(mappedData);
      } catch (error) {
        console.error('解析CSV文件时发生异常:', error);
        reject(new Error('解析CSV文件时出错: ' + (error as Error).message));
      }
    };
    
    reader.onerror = () => {
      const error = new Error('读取文件时出错');
      console.error('文件读取出错');
      reject(error);
    };
    
    console.log('开始读取文件:', file.name);
    reader.readAsText(file, 'UTF-8');
  });
};

// 解析CSV行的辅助函数
function parseCSVLine(line: string): string[] {
  console.log('开始解析CSV行:', line);
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    console.log(`处理字符: ${char} (位置: ${i}, inQuotes: ${inQuotes})`);
    
    if (char === '"') {
      // 检查是否是转义的引号
      if (i + 1 < line.length && line[i + 1] === '"') {
        current += '"';
        i++; // 跳过下一个引号
        console.log('发现转义引号，当前值:', current);
      } else {
        inQuotes = !inQuotes;
        console.log('切换引号状态:', inQuotes);
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      console.log('遇到分隔符，添加字段:', current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current);
  console.log('行末添加最后一个字段:', current);
  
  // 移除字段值两端的引号（如果有的话）
  const finalResult = result.map(field => {
    const trimmed = field.trim();
    const unquoted = trimmed.replace(/^"(.*)"$/, '$1');
    console.log(`字段处理: "${field}" -> "${trimmed}" -> "${unquoted}"`);
    return unquoted;
  });
  
  console.log('最终解析结果:', finalResult);
  return finalResult;
}

/**
 * 创建并下载CSV模板
 */
export const downloadCSVTemplate = () => {
  // 创建CSV格式的模板
  const csvContent = `"组别名称","项目名称","获奖者姓名","奖项等级","奖项名称","排名","得分","备注"\r\n"AI应用组","智能图像识别系统","张三","first_prize","一等奖","1","95.5","创新性强"\r\n"算法创新组","新型排序算法","李四","second_prize","二等奖","2","88.0",""`;

  // 创建Blob对象
  const blob = new Blob(['\uFEFF' + csvContent], { 
    type: 'text/csv;charset=utf-8;' 
  });

  // 创建下载链接
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', '比赛结果导入模板.csv');
  link.style.visibility = 'hidden';
  
  // 触发下载
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  console.log('模板文件已下载');
};

// 保留原来的函数名，但实际使用CSV处理
export const parseExcelFile = parseCSVFile;
export const downloadExcelTemplate = downloadCSVTemplate;