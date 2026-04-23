export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const getPriorityColor = (priority: string): string => {
  const colors: { [key: string]: string } = {
    'P1': 'bg-red-900 text-red-200 border-red-700',
    'P2': 'bg-orange-900 text-orange-200 border-orange-700',
    'P3': 'bg-yellow-900 text-yellow-200 border-yellow-700',
    'P4': 'bg-blue-900 text-blue-200 border-blue-700'
  };
  return colors[priority] || 'bg-gray-700 text-gray-200';
};
