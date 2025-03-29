import axios from 'axios';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export enum TaskPriority {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

interface TaskPriorityInput {
  title: string;
  description?: string;
  dueDate?: Date;
  category?: string;
}

const API_URL = 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2';
const API_KEY = Constants.expoConfig?.extra?.huggingFaceApiKey;

export async function calculateTaskPriority(task: TaskPriorityInput): Promise<TaskPriority> {
  try {
    const prompt = `
Task Title: ${task.title}
Description: ${task.description || 'None'}
Due Date: ${task.dueDate ? task.dueDate.toLocaleDateString() : 'None'}
Category: ${task.category || 'None'}

Based on the task information above, classify this task's priority as either HIGH, MEDIUM, or LOW.
Consider the following criteria:
- Urgency (due date proximity)
- Task complexity and importance (based on description)
- Task scope and impact
- Keywords indicating priority

Respond with only one word: HIGH, MEDIUM, or LOW
`;

    const response = await axios.post(
      API_URL,
      {
        inputs: prompt,
        parameters: {
          max_new_tokens: 400,
          temperature: 0.1,
          return_full_text: true,
        },
      },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      const priority = response.data[0].generated_text.trim().toUpperCase();
      
      // Validate the response is a valid priority
      if (Object.values(TaskPriority).includes(priority as TaskPriority)) {
        return priority as TaskPriority;
      }
    }
    
    // If due date exists, calculate priority based on that
    if (task.dueDate) {
      return getPriorityFromDueDate(task.dueDate);
    }
    
    // Default to MEDIUM if no other criteria match
    return TaskPriority.MEDIUM;
  } catch (error) {
    console.error('Error calculating priority:', error);
    
    // If due date exists, use it as fallback
    if (task.dueDate) {
      return getPriorityFromDueDate(task.dueDate);
    }
    
    return TaskPriority.MEDIUM;
  }
}

// Helper function to get priority based on due date
function getPriorityFromDueDate(dueDate: Date): TaskPriority {
  const now = new Date();
  const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays <= 2) return TaskPriority.HIGH;
  if (diffDays <= 7) return TaskPriority.MEDIUM;
  return TaskPriority.LOW;
}

// Get AI response for task suggestions
export const getAIResponse = async (messages: Message[], tasks: TaskPriorityInput[]): Promise<string> => {
  try {
    // Format tasks into a structured prompt
    const taskContext = tasks.length > 0 
      ? `Here are your current tasks:\n` + tasks.map(
          (task, index) => `${index + 1}. ${task.title} - ${task.description || 'No description provided'}` 
        ).join('\n')
      : 'You have no tasks at the moment.';

    const relevantMessages = [
      { role: 'system', content: `You are a helpful AI assistant for task and productivity management. Keep your responses concise and focused on helping users manage their tasks and time effectively. ${taskContext}` },
      messages[messages.length - 1]
    ];

    const response = await axios.post(
      API_URL,
      {
        inputs: relevantMessages.map(msg => `${msg.role}: ${msg.content}`).join('\n'),
        parameters: {
          max_new_tokens: 150,
          temperature: 0.7,
          top_p: 0.95,
          do_sample: true,
        },
      },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      const generatedText = response.data[0].generated_text;
      const assistantResponse = generatedText.split('assistant:').pop()?.trim();
      return assistantResponse || 'I apologize, but I couldn\'t generate a proper response.';
    }

    throw new Error('Invalid response format from API');
  } catch (error: any) {
    console.error('AI Service Error:', error.response || error);

    if (error.response?.status === 429) {
      throw new Error('The AI service is currently busy. Please try again in a few seconds.');
    }

    if (error.response?.status === 401) {
      throw new Error('Invalid API token. Please check your API configuration.');
    }

    throw new Error(error.message || 'Failed to get AI response');
  }
};



// API key management
export async function saveApiKey(apiKey: string): Promise<void> {
  if (!apiKey.trim()) {
    throw new Error('API token cannot be empty');
  }

  if (!apiKey.startsWith('hf_')) {
    throw new Error('Invalid Hugging Face token format. It should start with "hf_".');
  }

  try {
    await SecureStore.setItemAsync('HUGGINGFACE_API_KEY', apiKey);
  } catch (error) {
    console.error('Error saving API token:', error);
    throw new Error('Failed to save API token securely');
  }
}

export async function clearApiKey(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync('HUGGINGFACE_API_KEY');
  } catch (error) {
    console.error('Error clearing API token:', error);
    throw new Error('Failed to clear API token');
  }
}

const API_URL_DeepSeek = 'https://api.deepseek.com/v1/chat/completions';
const API_KEY_DeepSeek = Constants.expoConfig?.extra?.deepseekApiKey;

interface Task {
  title: string;
  description?: string;
  due_date?: string;
  category?: string;
  tags?: string[];
}

export async function suggestTaskImprovements(task: Task): Promise<string> {
  try {
    if (!API_KEY_DeepSeek) {
      throw new Error('DeepSeek API key is not configured');
    }

    const prompt = `
      Task Improvement Analysis:
      Task Details: ${JSON.stringify(task)}
      
      Provide brief, actionable suggestions to improve this task's:
      1. Clarity
      2. Measurability
      3. Achievability
      4. Time management
      
      Keep suggestions concise and practical.
    `;

    const response = await axios.post(
      API_URL_DeepSeek,
      {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are a task optimization assistant. Provide practical suggestions to improve task definitions and execution.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 150,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY_DeepSeek}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error getting task suggestions:', error);
    return 'Unable to generate suggestions at this time.';
  }
} 