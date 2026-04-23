import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { TimeBlock, BlockType, BLOCK_TYPE_CONFIG, WeeklyTimeBlocks, calculateBlockDuration } from '../types/timeBlocking';
import { timeBlockingService } from '../services/timeBlockingService';

interface Task {
  id: string;
  title: string;
  due_at: string;
  priority?: string;
  status?: string;
}

interface Commitment {
  id: string;
  title: string;
  date: string;
  priority?: string;
  status?: string;
  planned_minutes?: number;
}

interface WeekPlannerProps {
  userId: string;
  orgId: string;
  tasks?: Task[];
  commitments?: Commitment[];
  onBlockCreate?: (block: TimeBlock) => void;
  onBlockUpdate?: (block: TimeBlock) => void;
  onBlockDelete?: (blockId: string) => void;
  onAddTask?: () => void;
  onAddCommitment?: () => void;
}

const WeekPlanner: React.FC<WeekPlannerProps> = ({
  userId,
  orgId,
  tasks = [],
  commitments = [],
  onBlockCreate,
  onBlockUpdate,
  onBlockDelete,
  onAddTask,
  onAddCommitment
}) => {
  const [weekStart, setWeekStart] = useState<Date>(getMonday(new Date()));
  const [blocks, setBlocks] = useState<WeeklyTimeBlocks>({});
  const [loading, setLoading] = useState(true);
  const [selectedBlock, setSelectedBlock] = useState<TimeBlock | null>(null);
  const [draggedBlock, setDraggedBlock] = useState<TimeBlock | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    blockType: 'deep_work' as BlockType,
    title: '',
    targetMinutes: 60,
    notes: ''
  });

  useEffect(() => {
    loadWeekBlocks();
  }, [weekStart, userId, orgId]);

  function getMonday(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  const loadWeekBlocks = async () => {
    setLoading(true);
    const startDateStr = weekStart.toISOString().split('T')[0];
    const weeklyBlocks = await timeBlockingService.getWeeklyBlocks(userId, orgId, startDateStr);
    setBlocks(weeklyBlocks);
    setLoading(false);
  };

  const getDayDate = (dayOffset: number): string => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + dayOffset);
    return date.toISOString().split('T')[0];
  };

  const getDayLabel = (dayOffset: number): string => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + dayOffset);
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return `${days[dayOffset]} ${date.getDate()}`;
  };

  const handlePreviousWeek = () => {
    const newDate = new Date(weekStart);
    newDate.setDate(newDate.getDate() - 7);
    setWeekStart(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(weekStart);
    newDate.setDate(newDate.getDate() + 7);
    setWeekStart(newDate);
  };

  const handleCreateBlock = async (dayOffset: number) => {
    if (!formData.title.trim()) return;

    const date = getDayDate(dayOffset);
    const startTime = '09:00';
    const endTime = '10:00';

    const newBlock = await timeBlockingService.createBlock(userId, orgId, {
      blockType: formData.blockType,
      title: formData.title,
      startTime,
      endTime,
      date,
      targetMinutes: formData.targetMinutes,
      actualMinutes: 0,
      notes: formData.notes
    });

    if (newBlock) {
      setBlocks({
        ...blocks,
        [date]: [...(blocks[date] || []), newBlock]
      });
      onBlockCreate?.(newBlock);
      setFormData({ blockType: 'deep_work', title: '', targetMinutes: 60, notes: '' });
      setShowForm(false);
    }
  };

  const handleDeleteBlock = async (blockId: string) => {
    if (window.confirm('Delete this time block?')) {
      const success = await timeBlockingService.deleteBlock(blockId);
      if (success) {
        const updatedBlocks = { ...blocks };
        Object.keys(updatedBlocks).forEach(date => {
          updatedBlocks[date] = updatedBlocks[date].filter(b => b.id !== blockId);
        });
        setBlocks(updatedBlocks);
        onBlockDelete?.(blockId);
      }
    }
  };

  const handleDragStart = (block: TimeBlock) => {
    setDraggedBlock(block);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (dayOffset: number, e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedBlock) return;

    const newDate = getDayDate(dayOffset);
    if (draggedBlock.date === newDate) {
      setDraggedBlock(null);
      return;
    }

    const updated = await timeBlockingService.updateBlock(draggedBlock.id, {
      date: newDate
    });

    if (updated) {
      const oldDate = draggedBlock.date;
      const updatedBlocks = { ...blocks };
      updatedBlocks[oldDate] = updatedBlocks[oldDate].filter(b => b.id !== draggedBlock.id);
      updatedBlocks[newDate] = [...(updatedBlocks[newDate] || []), updated];
      setBlocks(updatedBlocks);
      onBlockUpdate?.(updated);
    }

    setDraggedBlock(null);
  };

  const getTotalMinutes = (dayOffset: number): number => {
    const date = getDayDate(dayOffset);
    return (blocks[date] || []).reduce((sum, block) => {
      const duration = calculateBlockDuration(block.startTime, block.endTime);
      return sum + duration;
    }, 0);
  };

  const getBlocksByType = (dayOffset: number, type: BlockType): TimeBlock[] => {
    const date = getDayDate(dayOffset);
    return (blocks[date] || []).filter(b => b.blockType === type);
  };

  const getTasksForDay = (dayOffset: number): Task[] => {
    const date = getDayDate(dayOffset);
    return tasks.filter(t => t.due_at === date && t.status !== 'done');
  };

  const getCommitmentsForDay = (dayOffset: number): Commitment[] => {
    const date = getDayDate(dayOffset);
    return commitments.filter(c => c.date === date && c.status !== 'done');
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-400">Loading week planner...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold text-white">Plan My Week</h1>
            <div className="flex items-center gap-4">
              <button
                onClick={handlePreviousWeek}
                className="bg-slate-700 hover:bg-slate-600 text-white p-2 rounded-lg transition"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-lg font-semibold text-white min-w-[200px] text-center">
                {weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
              <button
                onClick={handleNextWeek}
                className="bg-slate-700 hover:bg-slate-600 text-white p-2 rounded-lg transition"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
          <p className="text-gray-400">Drag blocks between days to reschedule. Click to view details.</p>
        </div>

        {/* Week Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 mb-8">
          {[0, 1, 2, 3, 4, 5, 6].map((dayOffset) => {
            const date = getDayDate(dayOffset);
            const dayBlocks = blocks[date] || [];
            const totalMinutes = getTotalMinutes(dayOffset);

            return (
              <div
                key={dayOffset}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(dayOffset, e)}
                className="bg-slate-800 border border-slate-700 rounded-lg p-4 min-h-[600px] hover:border-slate-600 transition"
              >
                {/* Day Header */}
                <div className="mb-4 pb-4 border-b border-slate-700">
                  <h3 className="text-lg font-bold text-white">{getDayLabel(dayOffset)}</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    {totalMinutes} min planned
                  </p>
                </div>

                {/* Blocks by Type */}
                <div className="space-y-3">
                  {Object.entries(BLOCK_TYPE_CONFIG).map(([type, config]) => {
                    const typeBlocks = getBlocksByType(dayOffset, type as BlockType);
                    if (typeBlocks.length === 0) return null;

                    return (
                      <div key={type}>
                        <p className="text-xs font-semibold text-gray-400 mb-2">
                          {config.icon} {config.label}
                        </p>
                        <div className="space-y-2">
                          {typeBlocks.map((block) => (
                            <div
                              key={block.id}
                              draggable
                              onDragStart={() => handleDragStart(block)}
                              onClick={() => setSelectedBlock(block)}
                              className={`p-3 rounded-lg cursor-move transition ${config.bgColor} ${config.borderColor} border-2 hover:opacity-80`}
                            >
                              <p className="font-semibold text-white text-sm">{block.title}</p>
                              <p className="text-xs text-gray-300 mt-1">
                                {block.startTime} - {block.endTime}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                Target: {block.targetMinutes} min
                              </p>
                              <div className="flex gap-2 mt-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteBlock(block.id);
                                  }}
                                  className="text-red-400 hover:text-red-300 transition"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  {/* Tasks Section */}
                  {getTasksForDay(dayOffset).length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 mb-2">📋 Tasks</p>
                      <div className="space-y-2">
                        {getTasksForDay(dayOffset).map((task) => (
                          <div key={task.id} className="p-3 rounded-lg bg-blue-900 border-2 border-blue-700 hover:opacity-80 transition">
                            <p className="font-semibold text-white text-sm">{task.title}</p>
                            <div className="flex gap-2 mt-1 flex-wrap">
                              {task.priority && <span className="text-xs px-2 py-1 bg-blue-800 rounded text-gray-300">{task.priority}</span>}
                              {task.status && <span className="text-xs px-2 py-1 bg-blue-800 rounded text-gray-300">{task.status}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Commitments Section */}
                  {getCommitmentsForDay(dayOffset).length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 mb-2">🎯 Commitments</p>
                      <div className="space-y-2">
                        {getCommitmentsForDay(dayOffset).map((commitment) => (
                          <div key={commitment.id} className="p-3 rounded-lg bg-purple-900 border-2 border-purple-700 hover:opacity-80 transition">
                            <p className="font-semibold text-white text-sm">{commitment.title}</p>
                            <div className="flex gap-2 mt-1 flex-wrap">
                              {commitment.priority && <span className="text-xs px-2 py-1 bg-purple-800 rounded text-gray-300">{commitment.priority}</span>}
                              {commitment.status && <span className="text-xs px-2 py-1 bg-purple-800 rounded text-gray-300">{commitment.status}</span>}
                              {commitment.planned_minutes && <span className="text-xs px-2 py-1 bg-purple-800 rounded text-gray-300">{commitment.planned_minutes}m</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 mt-4">
                  <button
                    onClick={() => {
                      setShowForm(true);
                      setFormData({ blockType: 'deep_work', title: '', targetMinutes: 60, notes: '' });
                    }}
                    className="w-full p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg flex items-center justify-center gap-2 transition text-sm"
                  >
                    <Plus size={16} /> Add Block
                  </button>
                  <button
                    onClick={() => onAddTask?.()}
                    className="w-full p-2 bg-blue-700 hover:bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2 transition text-sm"
                  >
                    <Plus size={16} /> Add Task
                  </button>
                  <button
                    onClick={() => onAddCommitment?.()}
                    className="w-full p-2 bg-purple-700 hover:bg-purple-600 text-white rounded-lg flex items-center justify-center gap-2 transition text-sm"
                  >
                    <Plus size={16} /> Add Commitment
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Statistics */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">Weekly Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(BLOCK_TYPE_CONFIG).map(([type, config]) => {
              const totalMinutes = [0, 1, 2, 3, 4, 5, 6].reduce((sum, day) => {
                return sum + getBlocksByType(day, type as BlockType).reduce((daySum, block) => {
                  return daySum + calculateBlockDuration(block.startTime, block.endTime);
                }, 0);
              }, 0);

              return (
                <div key={type} className="p-3 bg-slate-700 rounded-lg">
                  <p className="text-sm text-gray-400">{config.icon} {config.label}</p>
                  <p className="text-2xl font-bold text-white mt-1">{totalMinutes}</p>
                  <p className="text-xs text-gray-500 mt-1">minutes</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeekPlanner;
