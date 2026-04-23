// Time Blocking Types

export type BlockType = 'deep_work' | 'admin' | 'sales' | 'custom';

export interface TimeBlock {
  id: string;
  userId: string;
  orgId: string;
  blockType: BlockType;
  title: string;
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  date: string; // YYYY-MM-DD format
  targetMinutes: number;
  actualMinutes: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WeeklyTimeBlocks {
  [date: string]: TimeBlock[];
}

export interface TimeBlockStats {
  totalPlanned: number;
  totalActual: number;
  coverage: number; // percentage
  blocksByType: Record<BlockType, number>;
}

export interface BlockTypeConfig {
  type: BlockType;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
  description: string;
}

export const BLOCK_TYPE_CONFIG: Record<BlockType, BlockTypeConfig> = {
  deep_work: {
    type: 'deep_work',
    label: 'Deep Work',
    color: 'text-purple-400',
    bgColor: 'bg-purple-900',
    borderColor: 'border-purple-600',
    icon: '🧠',
    description: 'Focused, uninterrupted work'
  },
  admin: {
    type: 'admin',
    label: 'Admin',
    color: 'text-blue-400',
    bgColor: 'bg-blue-900',
    borderColor: 'border-blue-600',
    icon: '📋',
    description: 'Administrative tasks'
  },
  sales: {
    type: 'sales',
    label: 'Sales',
    color: 'text-green-400',
    bgColor: 'bg-green-900',
    borderColor: 'border-green-600',
    icon: '💰',
    description: 'Sales and business development'
  },
  custom: {
    type: 'custom',
    label: 'Custom',
    color: 'text-orange-400',
    bgColor: 'bg-orange-900',
    borderColor: 'border-orange-600',
    icon: '⭐',
    description: 'Custom block type'
  }
};

export interface DraggedBlock {
  blockId: string;
  date: string;
  startTime: string;
  endTime: string;
}

export interface TimeSlot {
  time: string; // HH:MM format
  blocks: TimeBlock[];
  isAvailable: boolean;
}

// Helper functions
export const getBlockTypeConfig = (type: BlockType): BlockTypeConfig => {
  return BLOCK_TYPE_CONFIG[type];
};

export const timeStringToMinutes = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

export const minutesToTimeString = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};

export const calculateBlockDuration = (startTime: string, endTime: string): number => {
  const startMinutes = timeStringToMinutes(startTime);
  const endMinutes = timeStringToMinutes(endTime);
  return endMinutes - startMinutes;
};

export const isTimeSlotAvailable = (
  blocks: TimeBlock[],
  startTime: string,
  endTime: string,
  excludeBlockId?: string
): boolean => {
  const newStart = timeStringToMinutes(startTime);
  const newEnd = timeStringToMinutes(endTime);

  return !blocks.some(block => {
    if (excludeBlockId && block.id === excludeBlockId) return false;

    const blockStart = timeStringToMinutes(block.startTime);
    const blockEnd = timeStringToMinutes(block.endTime);

    // Check for overlap
    return !(newEnd <= blockStart || newStart >= blockEnd);
  });
};

export const resolveCollision = (
  blocks: TimeBlock[],
  newBlock: Omit<TimeBlock, 'id' | 'createdAt' | 'updatedAt'>
): { resolved: boolean; suggestion?: { startTime: string; endTime: string } } => {
  const duration = calculateBlockDuration(newBlock.startTime, newBlock.endTime);
  const newStart = timeStringToMinutes(newBlock.startTime);
  const newEnd = timeStringToMinutes(newBlock.endTime);

  // Check for collisions
  const collidingBlocks = blocks.filter(block => {
    const blockStart = timeStringToMinutes(block.startTime);
    const blockEnd = timeStringToMinutes(block.endTime);
    return !(newEnd <= blockStart || newStart >= blockEnd);
  });

  if (collidingBlocks.length === 0) {
    return { resolved: true };
  }

  // Try to find next available slot
  const sortedBlocks = [...blocks].sort((a, b) => 
    timeStringToMinutes(a.startTime) - timeStringToMinutes(b.startTime)
  );

  for (let i = 0; i < sortedBlocks.length; i++) {
    const blockEnd = timeStringToMinutes(sortedBlocks[i].endTime);
    const nextBlockStart = i + 1 < sortedBlocks.length 
      ? timeStringToMinutes(sortedBlocks[i + 1].startTime)
      : 24 * 60;

    if (nextBlockStart - blockEnd >= duration) {
      return {
        resolved: true,
        suggestion: {
          startTime: minutesToTimeString(blockEnd),
          endTime: minutesToTimeString(blockEnd + duration)
        }
      };
    }
  }

  return { resolved: false };
};
