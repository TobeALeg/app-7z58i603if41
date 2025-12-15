import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { searchStudentRegistrationsByProjectName } from '@/db/api';
import type { Registration } from '@/types/types';
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

interface ProjectSearchProps {
  onSelect: (registration: Registration) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function ProjectSearch({ onSelect, placeholder = "搜索项目...", disabled = false }: ProjectSearchProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 搜索项目
  useEffect(() => {
    if (search.trim() === '') {
      setRegistrations([]);
      return;
    }

    // 防抖搜索
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const results = await searchStudentRegistrationsByProjectName(search);
        setRegistrations(results.slice(0, 10)); // 限制结果数量以提高性能
      } catch (error) {
        console.error('搜索项目失败:', error);
        setRegistrations([]);
      } finally {
        setIsLoading(false);
      }
    }, 500); // 增加防抖延迟到500ms以减少频繁请求

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [search]);

  const handleSelect = (registration: Registration) => {
    onSelect(registration);
    setOpen(false);
    setSearch('');
  };

  const handleClear = () => {
    setSearch('');
    setRegistrations([]);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className="pr-10"
          />
          {search ? (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={handleClear}
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
            placeholder="输入项目名称搜索..." 
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {isLoading ? (
              <CommandEmpty>搜索中...</CommandEmpty>
            ) : registrations.length === 0 ? (
              <CommandEmpty>未找到匹配的项目</CommandEmpty>
            ) : (
              <CommandGroup heading="搜索结果">
                {registrations.map((registration) => (
                  <CommandItem
                    key={registration.id}
                    onSelect={() => handleSelect(registration)}
                    className="cursor-pointer"
                  >
                    <div>
                      <div className="font-medium">{registration.project_name}</div>
                      <div className="text-sm text-muted-foreground">
                        参赛者: {registration.name} • {registration.school}
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