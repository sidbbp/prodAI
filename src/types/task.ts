export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  priority: number;
  status: 'pending' | 'in_progress' | 'completed' | 'archived';
  due_date?: string;
  ai_priority_score?: number;
  completed_at?: string;
  category?: string;
  tags?: string[];
  parent_task_id?: string;
  estimated_duration?: number;
  actual_duration?: number;
  recurring_pattern?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
    end_date?: string;
    days_of_week?: number[];
  };
  created_at: string;
  updated_at: string;
} 