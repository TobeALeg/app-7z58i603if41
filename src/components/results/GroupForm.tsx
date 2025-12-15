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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { CompetitionGroup } from '@/types/types';

const formSchema = z.object({
  name: z.string().min(1, '请输入组别名称'),
  description: z.string().nullable(),
  order_number: z.coerce.number().int().min(0, '顺序号必须大于等于0'),
});

interface GroupFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<CompetitionGroup, 'id' | 'created_at'>) => void;
  group?: CompetitionGroup | null;
}

export default function GroupForm({ open, onOpenChange, onSubmit, group }: GroupFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: group?.name || '',
      description: group?.description || '',
      order_number: group?.order_number || 0,
    },
  });

  useEffect(() => {
    if (group) {
      form.reset({
        name: group.name,
        description: group.description,
        order_number: group.order_number,
      });
    } else {
      form.reset({
        name: '',
        description: '',
        order_number: 0,
      });
    }
  }, [group, open]);

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit({
      name: values.name,
      description: values.description,
      order_number: values.order_number,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{group ? '编辑组别' : '添加组别'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>组别名称 *</FormLabel>
                  <FormControl>
                    <Input placeholder="例如：AI应用组" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>描述</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="输入组别描述"
                      className="resize-none"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="order_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>显示顺序 *</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="输入显示顺序" 
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
                {group ? '更新组别' : '添加组别'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}