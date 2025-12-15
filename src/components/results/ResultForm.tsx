import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { CompetitionResult, CompetitionGroup, RegistrationWithWorks } from '@/types/types';

const formSchema = z.object({
  registration_id: z.string().min(1, '请选择参赛项目'),
  group_id: z.string().min(1, '请选择组别'),
  award_level: z.enum(['first_prize', 'second_prize', 'third_prize', 'honorable_mention']),
  award_name: z.string().min(1, '请输入奖项名称'),
  ranking: z.coerce.number().nullable(),
  score: z.coerce.number().nullable(),
  remarks: z.string().nullable(),
});

interface ResultFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<CompetitionResult, 'id' | 'created_at' | 'updated_at' | 'published' | 'published_at'>) => void;
  groups: CompetitionGroup[];
  registrations: RegistrationWithWorks[];
  result?: CompetitionResult | null;
}

export default function ResultForm({ open, onOpenChange, onSubmit, groups, registrations, result }: ResultFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      registration_id: result?.registration_id || '',
      group_id: result?.group_id || '',
      award_level: result?.award_level || 'first_prize',
      award_name: result?.award_name || '',
      ranking: result?.ranking || null,
      score: result?.score || null,
      remarks: result?.remarks || '',
    },
  });

  const awardLevels = [
    { value: 'first_prize', label: '一等奖' },
    { value: 'second_prize', label: '二等奖' },
    { value: 'third_prize', label: '三等奖' },
    { value: 'honorable_mention', label: '优秀奖' },
  ];

  useEffect(() => {
    if (result) {
      form.reset({
        registration_id: result.registration_id,
        group_id: result.group_id,
        award_level: result.award_level,
        award_name: result.award_name,
        ranking: result.ranking,
        score: result.score,
        remarks: result.remarks,
      });
    } else {
      form.reset({
        registration_id: '',
        group_id: '',
        award_level: 'first_prize',
        award_name: '',
        ranking: null,
        score: null,
        remarks: '',
      });
    }
  }, [result, open]);

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit({
      registration_id: values.registration_id,
      group_id: values.group_id,
      award_level: values.award_level,
      award_name: values.award_name,
      ranking: values.ranking,
      score: values.score,
      remarks: values.remarks,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{result ? '编辑比赛结果' : '添加比赛结果'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="group_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>组别 *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="选择组别" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {groups.map((group) => (
                        <SelectItem key={group.id} value={group.id}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="registration_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>参赛项目 *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="选择参赛项目" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {registrations.map((reg) => (
                        <SelectItem key={reg.id} value={reg.id}>
                          {reg.project_name} ({reg.name}{reg.team_name && ` - ${reg.team_name}`})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="award_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>奖项等级 *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择奖项等级" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {awardLevels.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="award_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>奖项名称 *</FormLabel>
                    <FormControl>
                      <Input placeholder="例如：一等奖" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="ranking"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>排名</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="输入排名" 
                        {...field} 
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="score"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>得分</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="输入得分" 
                        {...field} 
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>备注</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="输入备注信息"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                取消
              </Button>
              <Button type="submit">
                {result ? '更新结果' : '添加结果'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}