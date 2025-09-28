import { z } from 'zod';
import { Project, Task, ProjectStatus, Priority, ProjectType } from '@/types/project';

// Project validation schemas
export const projectFormSchema = z.object({
  name: z.string()
    .trim()
    .min(1, 'Project name is required')
    .max(100, 'Project name must be less than 100 characters')
    .refine(name => !/<script|javascript:|data:/i.test(name), 'Invalid characters in project name'),
  
  description: z.string()
    .trim()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  
  type: z.enum(['development', 'marketing', 'design', 'research', 'maintenance']),
  
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  
  budget: z.number()
    .min(0, 'Budget must be a positive number')
    .max(10000000, 'Budget exceeds maximum allowed value'),
  
  startDate: z.date()
    .refine(date => date >= new Date('2020-01-01'), 'Start date must be after 2020')
    .refine(date => date <= new Date('2030-12-31'), 'Start date must be before 2030'),
  
  dueDate: z.date()
    .refine(date => date >= new Date('2020-01-01'), 'Due date must be after 2020')
    .refine(date => date <= new Date('2030-12-31'), 'Due date must be before 2030'),
  
  client: z.string()
    .trim()
    .max(100, 'Client name must be less than 100 characters')
    .optional(),
}).refine(data => data.dueDate > data.startDate, {
  message: 'Due date must be after start date',
  path: ['dueDate']
});

export const taskFormSchema = z.object({
  title: z.string()
    .trim()
    .min(1, 'Task title is required')
    .max(200, 'Task title must be less than 200 characters'),
  
  description: z.string()
    .trim()
    .max(2000, 'Description must be less than 2000 characters')
    .optional(),
  
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  
  estimatedHours: z.number()
    .min(0, 'Estimated hours must be positive')
    .max(1000, 'Estimated hours cannot exceed 1000'),
  
  dueDate: z.date()
    .refine(date => date >= new Date(), 'Due date must be in the future'),
  
  tags: z.array(z.string().trim().max(50)).max(10, 'Maximum 10 tags allowed')
});

export type ProjectFormData = z.infer<typeof projectFormSchema>;
export type TaskFormData = z.infer<typeof taskFormSchema>;

// Validation functions
export const validateProject = (data: unknown): { success: boolean; data?: ProjectFormData; errors?: string[] } => {
  try {
    const validatedData = projectFormSchema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => err.message)
      };
    }
    return {
      success: false,
      errors: ['Invalid project data']
    };
  }
};

export const validateTask = (data: unknown): { success: boolean; data?: TaskFormData; errors?: string[] } => {
  try {
    const validatedData = taskFormSchema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => err.message)
      };
    }
    return {
      success: false,
      errors: ['Invalid task data']
    };
  }
};

// Type guards
export const isValidProjectStatus = (status: unknown): status is ProjectStatus => {
  return typeof status === 'string' && 
    ['not-started', 'in-progress', 'on-hold', 'completed', 'cancelled'].includes(status);
};

export const isValidPriority = (priority: unknown): priority is Priority => {
  return typeof priority === 'string' && 
    ['low', 'medium', 'high', 'urgent'].includes(priority);
};

export const isValidProjectType = (type: unknown): type is ProjectType => {
  return typeof type === 'string' && 
    ['development', 'marketing', 'design', 'research', 'maintenance'].includes(type);
};

// Sanitization functions
export const sanitizeProjectInput = (input: string): string => {
  return input
    .trim()
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/on\w+\s*=/gi, '');
};

export const sanitizeNumericInput = (input: unknown): number => {
  const num = Number(input);
  return isNaN(num) ? 0 : Math.max(0, num);
};

// Date validation helpers
export const isValidDateRange = (start: Date, end: Date): boolean => {
  return start < end && start >= new Date('2020-01-01') && end <= new Date('2030-12-31');
};

export const formatDateForInput = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const parseDateFromInput = (dateString: string): Date | null => {
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
};