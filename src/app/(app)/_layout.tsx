import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="task/[id]"
        options={{
          title: 'Task Details',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="ai-chat"
        options={{
          title: 'AI Assistant',
          headerShown: true,
        }}
      />
    </Stack>
  );
} 