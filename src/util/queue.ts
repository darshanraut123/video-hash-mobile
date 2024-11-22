import AsyncStorage from '@react-native-async-storage/async-storage';

// Add a new task to the queue
export async function addTaskToQueue(task: any) {
  const tasks = await getTasksFromQueue();
  tasks.push(task);
  await AsyncStorage.setItem('TASK_QUEUE', JSON.stringify(tasks));
}

// Retrieve tasks from AsyncStorage
export async function getTasksFromQueue() {
  const tasks = await AsyncStorage.getItem('TASK_QUEUE');
  return tasks ? JSON.parse(tasks) : [];
}

// Update a task’s status in the queue
export async function updateTaskStatus(id: any, status: string) {
  const tasks = await getTasksFromQueue();
  const updatedTasks = tasks.map((task: any) =>
    task.id === id ? {...task, status} : task,
  );
  await AsyncStorage.setItem('TASK_QUEUE', JSON.stringify(updatedTasks));
}

// Remove a task from the queue
export async function removeCompletedTask(id: any) {
  const tasks = await getTasksFromQueue();
  const updatedTasks = tasks.filter((task: any) => task.id !== id);
  await AsyncStorage.setItem('TASK_QUEUE', JSON.stringify(updatedTasks));
}

export async function resetTasksOnAppStart() {
  const tasks = await getTasksFromQueue();
  // On app start, reset any tasks marked as "inprogress" to "pending"
  const resetTasks = tasks.map((task: any) =>
    task.status === 'inprogress' ? {...task, status: 'pending'} : task,
  );
  await AsyncStorage.setItem('TASK_QUEUE', JSON.stringify(resetTasks));
}
