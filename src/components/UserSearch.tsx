import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { searchUsersByStudentId, searchUsersByName } from '@/db/api';
import type { Profile } from '@/types/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { 
  Command, 
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem, 
  CommandList 
} from '@/components/ui/command';

interface UserSearchProps {
  onSelect: (user: Profile) => void;
  placeholder?: string;
  disabled?: boolean;
  userTypeFilter?: 'student' | 'teacher' | 'all'; // 添加用户类型过滤器
  currentUser?: Profile; // 当前用户，用于排除自己
  maxUsers?: number; // 最大用户数量限制
  selectedUsers?: Profile[]; // 已选择的用户
}

export default function UserSearch({ 
  onSelect, 
  placeholder = "搜索用户...", 
  disabled = false,
  userTypeFilter = 'all', // 默认不过滤
  currentUser, // 当前用户
  maxUsers, // 最大用户数量
  selectedUsers = [] // 已选择的用户
}: UserSearchProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 判断用户是否为学生
  const isStudent = (user: Profile): boolean => {
    // 为了提高性能，简化判断逻辑
    if (user.identity_type) {
      const identityType = user.identity_type.toLowerCase();
      // 如果包含教师关键词，则不是学生
      return !(
        identityType.includes('教师') || 
        identityType.includes('教工') || 
        identityType.includes('职工') || 
        identityType.includes('讲师') || 
        identityType.includes('教授') || 
        identityType.includes('副教授') || 
        identityType.includes('助教') || 
        identityType.includes('faculty') || 
        identityType.includes('teacher')
      );
    }
    // 默认认为是学生
    return true;
  };

  // 判断用户是否为教师
  const isTeacher = (user: Profile): boolean => {
    if (user.identity_type) {
      const identityType = user.identity_type.toLowerCase();
      return (
        identityType.includes('教师') || 
        identityType.includes('教工') || 
        identityType.includes('职工') || 
        identityType.includes('讲师') || 
        identityType.includes('教授') || 
        identityType.includes('副教授') || 
        identityType.includes('助教') || 
        identityType.includes('faculty') || 
        identityType.includes('teacher')
      );
    }
    // 默认认为不是教师
    return false;
  };

  // 检查是否达到最大用户数限制
  const isMaxUsersReached = () => {
    if (maxUsers === undefined) return false;
    return selectedUsers.length >= maxUsers;
  };

  // 根据过滤器筛选用户
  const filterUsers = (users: Profile[]): Profile[] => {
    // 如果达到了最大用户数限制，不显示任何用户
    if (isMaxUsersReached()) {
      return [];
    }

    // 过滤掉当前用户自己
    let filteredUsers = users.filter(user => {
      // 排除当前用户
      if (currentUser && user.id === currentUser.id) {
        return false;
      }
      
      // 排除已选择的用户
      if (selectedUsers.some(selectedUser => selectedUser.id === user.id)) {
        return false;
      }
      
      return true;
    });

    // 根据用户类型过滤
    if (userTypeFilter !== 'all') {
      filteredUsers = filteredUsers.filter(user => {
        if (userTypeFilter === 'student') {
          return isStudent(user);
        } else if (userTypeFilter === 'teacher') {
          return isTeacher(user);
        }
        return true;
      });
    }

    // 限制结果数量为10个以提高性能
    return filteredUsers.slice(0, 10);
  };

  // 搜索用户
  useEffect(() => {
    if (search.trim() === '') {
      setUsers([]);
      return;
    }

    // 如果达到了最大用户数限制，不进行搜索
    if (isMaxUsersReached()) {
      setUsers([]);
      return;
    }

    // 防抖搜索
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        // 如果搜索内容看起来像学号/工号，优先按学号搜索
        let results: Profile[] = [];
        if (/^[a-zA-Z0-9]+$/.test(search) && search.length >= 2) { // 降低长度要求到2个字符
          results = await searchUsersByStudentId(search);
        }
        
        // 如果没有结果或者不是纯数字/字母，也按姓名搜索
        if (results.length === 0) {
          results = await searchUsersByName(search);
        }
        
        // 根据过滤器筛选结果
        const filteredResults = filterUsers(results);
        setUsers(filteredResults);
      } catch (error) {
        console.error('搜索用户失败:', error);
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    }, 500); // 增加防抖延迟到500ms以减少频繁请求

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [search, userTypeFilter, currentUser, selectedUsers, maxUsers]);

  const handleSelect = (user: Profile) => {
    // 检查是否达到最大用户数限制
    if (maxUsers !== undefined && selectedUsers.length >= maxUsers) {
      return;
    }
    
    onSelect(user);
    setOpen(false);
    setSearch('');
  };

  const handleClear = () => {
    setSearch('');
    setUsers([]);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isMaxUsersReached() ? `已达到最大人数限制 (${maxUsers})` : placeholder}
            disabled={disabled || isMaxUsersReached()}
            className="pr-10"
          />
          {search ? (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={handleClear}
              disabled={disabled || isMaxUsersReached()}
            >
              <X className="h-4 w-4" />
            </Button>
          ) : (
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="输入学号/工号或姓名搜索，例如：张三 或 20210001" 
            value={search}
            onValueChange={setSearch}
            disabled={isMaxUsersReached()}
          />
          <CommandList>
            {isLoading ? (
              <CommandEmpty>搜索中...</CommandEmpty>
            ) : users.length === 0 ? (
              <CommandEmpty>
                {isMaxUsersReached() 
                  ? `已达到最大人数限制 (${maxUsers})` 
                  : '未找到匹配的用户'}
              </CommandEmpty>
            ) : (
              <CommandGroup heading="搜索结果">
                {users.map((user) => (
                  <CommandItem
                    key={user.id}
                    onSelect={() => handleSelect(user)}
                    className="cursor-pointer"
                  >
                    <div>
                      <div className="font-medium">{user.real_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {user.student_id} • {user.identity_type}
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}