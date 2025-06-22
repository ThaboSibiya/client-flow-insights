
export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  employeeName: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  dueDate: string;
  estimatedHours: number;
  category: string;
}

export interface NewTask {
  title: string;
  description: string;
  assignedTo: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  dueDate: string;
  estimatedHours: number;
  category: string;
}
