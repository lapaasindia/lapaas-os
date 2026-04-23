import React, { useState, useEffect } from 'react';
import { Calendar, Trash2, Edit2 } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import CalendarView from '../components/CalendarView';
import TimeBlockModal from '../components/TimeBlockModal';
import SubtaskModalForProductivity from '../components/SubtaskModalForProductivity';
import { useUser } from '../contexts/UserContext';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  due_at?: string;
  due_date?: string;
  time_spent_min: number;
  checklist_json: Array<{ item: string; done: boolean }>;
  type?: string;
}

interface TimeBlock {
  id: string;
  date?: string;
  start_at?: string;
  end_at?: string;
  start_time?: string;
  end_time?: string;
  startTime?: string;
  endTime?: string;
  type?: string;
  goal_minutes?: number;
  color?: string;
  notes?: string;
  title?: string;
}

interface Commitment {
  id: string;
  date: string;
  title: string;
  priority: string;
  planned_minutes?: number;
  actual_minutes?: number;
  status: string;
  effort_minutes?: number;
  type?: string;
}

interface Meeting {
  id: string;
  title: string;
  start_at: string;
  end_at: string;
  status: string;
  type?: string;
}

const FounderOSProductivity: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useUser();
  
  // Get user-specific IDs
  const userId = user?.id || '';
  const orgId = user?.orgId || 'org-001';
  
  const [subTab, setSubTab] = useState<'calendar' | 'tasks' | 'commitments' | 'blocks'>('tasks');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [blocks, setBlocks] = useState<TimeBlock[]>([]);
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'done' | 'blocked'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'P1' | 'P2' | 'P3' | 'P4'>('all');
  const [expandedTasks, setExpandedTasks] = useState<{ [key: string]: boolean }>({});
  const [showTimeBlockModal, setShowTimeBlockModal] = useState(false);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [timeBlockForm, setTimeBlockForm] = useState({ title: '', start_time: '09:00', end_time: '10:00' });
  const [showSubtaskModal, setShowSubtaskModal] = useState(false);
  const [selectedTaskForSubtasks, setSelectedTaskForSubtasks] = useState<Task | null>(null);

  // Initialize sub-tab from URL on mount
  useEffect(() => {
    const subTabFromUrl = searchParams.get('subTab') as 'calendar' | 'tasks' | 'commitments' | 'blocks' | null;
    if (subTabFromUrl && ['calendar', 'tasks', 'commitments', 'blocks'].includes(subTabFromUrl)) {
      setSubTab(subTabFromUrl);
    }
  }, []);

  // Update URL when sub-tab changes
  const handleSubTabChange = (tab: 'calendar' | 'tasks' | 'commitments' | 'blocks') => {
    setSubTab(tab);
    setSearchParams({ subTab: tab });
  };

  useEffect(() => {
    fetchProductivityData();
  }, []);

  const fetchProductivityData = async () => {
    try {
      setLoading(true);
      const userParam = userId ? `&user_id=${userId}` : '';
      const [tasksRes, blocksRes, commitmentsRes, meetingsRes] = await Promise.all([
        fetch(`http://localhost:3000/api/v1/tasks?org_id=${orgId}${userParam}`),
        fetch(`http://localhost:3000/api/v1/time-blocks?org_id=${orgId}${userParam}`),
        fetch(`http://localhost:3000/api/v1/commitments?org_id=${orgId}${userParam}`),
        fetch(`http://localhost:3000/api/v1/meetings?org_id=${orgId}${userParam}`)
      ]);

      if (tasksRes.ok) setTasks(await tasksRes.json().then(r => r.data || []));
      if (blocksRes.ok) setBlocks(await blocksRes.json().then(r => r.data || []));
      if (commitmentsRes.ok) setCommitments(await commitmentsRes.json().then(r => r.data || []));
      if (meetingsRes.ok) setMeetings(await meetingsRes.json().then(r => r.data || []));
    } catch (error) {
      console.error('Error fetching productivity data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to check if a day is completely blocked
  const isDayBlocked = (date: string): boolean => {
    return blocks.some(block => {
      const blockDate = block.date || (block.start_at ? block.start_at.split('T')[0] : null);
      return blockDate === date && block.start_time === '00:00' && block.end_time === '23:59';
    });
  };

  // Helper function to check if a time overlaps with blocked times
  const hasTimeOverlap = (date: string, startTime: string, endTime: string): boolean => {
    return blocks.some(block => {
      const blockDate = block.date || (block.start_at ? block.start_at.split('T')[0] : null);
      if (blockDate !== date) return false;
      
      // Skip whole day blocks as they're handled separately
      if (block.start_time === '00:00' && block.end_time === '23:59') return false;
      
      const blockStart = block.start_time || block.startTime || '00:00';
      const blockEnd = block.end_time || block.endTime || '23:59';
      
      // Check for time overlap
      return !(endTime <= blockStart || startTime >= blockEnd);
    });
  };

  const handleAddTask = async () => {
    const dateToUse = selectedDate || new Date().toISOString().split('T')[0];
    
    // Check if day is blocked
    if (isDayBlocked(dateToUse)) {
      alert('❌ Cannot add task: This day is completely blocked.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/v1/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          org_id: 'org-001',
          title: 'New Task',
          description: '',
          priority: 'P2',
          status: 'pending',
          due_at: dateToUse
        })
      });

      if (response.ok) {
        const result = await response.json();
        navigate(`/task/${result.data.id}`);
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleAddMeeting = async () => {
    const dateToUse = selectedDate || new Date().toISOString().split('T')[0];
    
    // Check if day is blocked
    if (isDayBlocked(dateToUse)) {
      alert('❌ Cannot add meeting: This day is completely blocked.');
      return;
    }

    // Check for time overlap (10:00-11:00 default time)
    if (hasTimeOverlap(dateToUse, '10:00', '11:00')) {
      alert('⚠️ Warning: This time slot overlaps with a blocked time. Please choose a different time.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/v1/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          org_id: 'org-001',
          title: 'New Meeting',
          start_at: selectedDate ? `${selectedDate}T10:00:00Z` : new Date().toISOString(),
          end_at: selectedDate ? `${selectedDate}T11:00:00Z` : new Date(Date.now() + 3600000).toISOString(),
          status: 'scheduled'
        })
      });

      if (response.ok) {
        const result = await response.json();
        navigate(`/meeting/${result.data.id}`);
      }
    } catch (error) {
      console.error('Error creating meeting:', error);
    }
  };

  const handleAddTimeBlock = async () => {
    setShowTimeBlockModal(true);
    setEditingBlockId(null);
    setTimeBlockForm({ title: '', start_time: '09:00', end_time: '10:00' });
  };

  const handleCreateTimeBlock = async () => {
    if (!timeBlockForm.title) return;
    try {
      const url = editingBlockId 
        ? `http://localhost:3000/api/v1/time-blocks/${editingBlockId}`
        : 'http://localhost:3000/api/v1/time-blocks';
      const method = editingBlockId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: timeBlockForm.title,
          start_at: timeBlockForm.start_time,
          end_at: timeBlockForm.end_time,
          org_id: 'org-001',
          date: selectedDate || new Date().toISOString().split('T')[0],
          color: '#3B82F6',
          goal_minutes: 60,
          notes: ''
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        if (editingBlockId) {
          setBlocks(blocks.map(b => b.id === editingBlockId ? result.data : b));
        } else {
          setBlocks([...blocks, result.data]);
        }
        setTimeBlockForm({ title: '', start_time: '09:00', end_time: '10:00' });
        setShowTimeBlockModal(false);
        setEditingBlockId(null);
      }
    } catch (error) {
      console.error('Error creating/updating time block:', error);
    }
  };

  const handleAddCommitment = async () => {
    const dateToUse = selectedDate || new Date().toISOString().split('T')[0];
    
    // Check if day is blocked
    if (isDayBlocked(dateToUse)) {
      alert('❌ Cannot add commitment: This day is completely blocked.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/v1/commitments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          org_id: 'org-001',
          date: dateToUse,
          title: 'New Commitment',
          priority: 'P2',
          planned_minutes: 60,
          status: 'pending'
        })
      });

      if (response.ok) {
        const result = await response.json();
        navigate(`/commitment/${result.data.id}`);
      }
    } catch (error) {
      console.error('Error creating commitment:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/v1/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        setTasks(tasks.filter(t => t.id !== taskId));
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-400">Loading Personal Productivity...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 sm:p-6 lg:p-8">
      <div className="w-full">
        {/* Header */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 flex items-center gap-2 sm:gap-3">
            <Calendar className="text-green-400 w-6 h-6 sm:w-8 sm:h-8" />
            Personal Productivity
          </h1>
          <p className="text-gray-400 text-sm sm:text-base">Manage your calendar, tasks, and time blocks</p>
        </div>

        {/* Sub-tabs */}
        <div className="flex gap-1.5 sm:gap-2 mb-4 sm:mb-6 border-b border-slate-700 overflow-x-auto pb-3 sm:pb-4 scrollbar-hide">
          {[
            { id: 'calendar', label: '📅 Calendar' },
            { id: 'tasks', label: '✓ Tasks' },
            { id: 'commitments', label: '📋 Commitments' },
            { id: 'blocks', label: '⏱️ Time Blocks' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => handleSubTabChange(tab.id as any)}
              className={`px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 lg:py-3 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                subTab === tab.id
                  ? 'bg-green-600 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 sm:p-4 lg:p-6">
          {/* Calendar Tab */}
          {subTab === 'calendar' && (
            <CalendarView
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              tasks={tasks}
              meetings={meetings}
              timeBlocks={blocks}
              commitments={commitments}
              onAddTask={handleAddTask}
              onAddTimeBlock={handleAddTimeBlock}
              onAddCommitment={handleAddCommitment}
              onAddMeeting={handleAddMeeting}
              onTimeBlockClick={(blockId) => {
                const block = blocks.find(b => b.id === blockId);
                if (block) {
                  setEditingBlockId(block.id);
                  setTimeBlockForm({
                    title: block.title || block.type || '',
                    start_time: block.startTime || block.start_time || (block.start_at ? block.start_at.split('T')[1]?.substring(0, 5) : '09:00'),
                    end_time: block.endTime || block.end_time || (block.end_at ? block.end_at.split('T')[1]?.substring(0, 5) : '10:00')
                  });
                  setShowTimeBlockModal(true);
                }
              }}
              onCommitmentClick={(commitmentId) => navigate(`/commitment/${commitmentId}`)}
              isDayBlocked={isDayBlocked}
              hasTimeOverlap={hasTimeOverlap}
            />
          )}

          {/* Tasks Tab */}
          {subTab === 'tasks' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  ✓ Tasks
                </h3>
                <button
                  onClick={handleAddTask}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
                >
                  + New Task
                </button>
              </div>

              {/* Status Filter Buttons */}
              <div className="flex gap-2 flex-wrap">
                <div className="flex gap-2">
                  {[
                    { id: 'all', label: '📋 All' },
                    { id: 'pending', label: '⏸️ Pending' },
                    { id: 'done', label: '✅ Done' },
                    { id: 'blocked', label: '🔒 Blocked' }
                  ].map(filter => (
                    <button
                      key={filter.id}
                      onClick={() => setTaskFilter(filter.id as any)}
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        taskFilter === filter.id
                          ? 'bg-green-600 text-white'
                          : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>

                {/* Priority Filter Buttons */}
                <div className="flex gap-2 ml-4 pl-4 border-l border-slate-600">
                  {[
                    { id: 'all', label: '⭐ All Priority' },
                    { id: 'P1', label: '🔴 P1' },
                    { id: 'P2', label: '🟠 P2' },
                    { id: 'P3', label: '🟡 P3' },
                    { id: 'P4', label: '🔵 P4' }
                  ].map(filter => (
                    <button
                      key={filter.id}
                      onClick={() => setPriorityFilter(filter.id as any)}
                      className={`px-4 py-2 rounded-lg font-medium transition text-sm ${
                        priorityFilter === filter.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tasks List */}
              <div className="space-y-3">
                {tasks.length > 0 ? (
                  tasks
                    .filter(task => {
                      // Status filter
                      let statusMatch = true;
                      if (taskFilter === 'all') statusMatch = true;
                      else if (taskFilter === 'pending') statusMatch = task.status === 'pending' || task.status === 'todo';
                      else if (taskFilter === 'done') statusMatch = task.status === 'done' || task.status === 'completed';
                      else if (taskFilter === 'blocked') statusMatch = task.status === 'blocked';

                      // Priority filter
                      let priorityMatch = true;
                      if (priorityFilter !== 'all') priorityMatch = task.priority === priorityFilter;

                      return statusMatch && priorityMatch;
                    })
                    .map(task => {
                      const subtasks = task.checklist_json || [];
                      const completedSubtasks = subtasks.filter(s => s.done).length;
                      const isExpanded = expandedTasks[task.id] || false;

                      return (
                        <div
                          key={task.id}
                          className="p-4 bg-slate-700 rounded-lg border-l-4 border-slate-600 hover:bg-slate-600 transition"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={task.status === 'done' || task.status === 'completed'}
                                  onChange={async (e) => {
                                    e.stopPropagation();
                                    const newStatus = task.status === 'done' || task.status === 'completed' ? 'pending' : 'done';
                                    try {
                                      const response = await fetch(`http://localhost:3000/api/v1/tasks/${task.id}`, {
                                        method: 'PUT',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ status: newStatus })
                                      });
                                      if (response.ok) {
                                        setTasks(tasks.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
                                      }
                                    } catch (error) {
                                      console.error('Error updating task status:', error);
                                    }
                                  }}
                                  className="w-5 h-5 rounded"
                                />
                                <p className="font-semibold text-white">{task.title}</p>
                              </div>
                              <p className="text-xs text-gray-400 mt-1 ml-7">{task.description}</p>
                              
                              {/* Subtasks */}
                              {subtasks.length > 0 && (
                                <div className="ml-7 mt-2">
                                  <button
                                    onClick={() => setExpandedTasks({ ...expandedTasks, [task.id]: !isExpanded })}
                                    className="text-xs text-gray-400 hover:text-gray-300 mb-2"
                                  >
                                    {isExpanded ? '▼' : '▶'} Subtasks ({completedSubtasks}/{subtasks.length})
                                  </button>
                                  {isExpanded && (
                                    <div className="space-y-1 mt-2">
                                      {subtasks.map((subtask, idx) => (
                                        <div key={idx} className="flex items-center gap-2 text-xs">
                                          <input
                                            type="checkbox"
                                            checked={subtask.done}
                                            onChange={async () => {
                                              const updatedSubtasks = [...subtasks];
                                              updatedSubtasks[idx].done = !updatedSubtasks[idx].done;
                                              try {
                                                const response = await fetch(`http://localhost:3000/api/v1/tasks/${task.id}`, {
                                                  method: 'PUT',
                                                  headers: { 'Content-Type': 'application/json' },
                                                  body: JSON.stringify({ checklist_json: updatedSubtasks })
                                                });
                                                if (response.ok) {
                                                  setTasks(tasks.map(t => t.id === task.id ? { ...t, checklist_json: updatedSubtasks } : t));
                                                }
                                              } catch (error) {
                                                console.error('Error updating subtask:', error);
                                              }
                                            }}
                                            className="w-4 h-4 rounded"
                                          />
                                          <span className={subtask.done ? 'line-through text-gray-500' : 'text-gray-300'}>
                                            {subtask.item}
                                          </span>
                                          <button 
                                            onClick={async () => {
                                              const updatedSubtasks = subtasks.filter((_, i) => i !== idx);
                                              try {
                                                const response = await fetch(`http://localhost:3000/api/v1/tasks/${task.id}`, {
                                                  method: 'PUT',
                                                  headers: { 'Content-Type': 'application/json' },
                                                  body: JSON.stringify({ checklist_json: updatedSubtasks })
                                                });
                                                if (response.ok) {
                                                  setTasks(tasks.map(t => t.id === task.id ? { ...t, checklist_json: updatedSubtasks } : t));
                                                }
                                              } catch (error) {
                                                console.error('Error deleting subtask:', error);
                                              }
                                            }}
                                            className="text-red-400 hover:text-red-300 ml-auto text-xs"
                                          >
                                            Delete
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  <button 
                                    onClick={() => {
                                      setSelectedTaskForSubtasks(task);
                                      setShowSubtaskModal(true);
                                    }}
                                    className="text-xs text-blue-400 hover:text-blue-300 mt-2"
                                  >
                                    + Add subtask
                                  </button>
                                </div>
                              )}

                              <div className="flex gap-2 mt-2 flex-wrap ml-7">
                                <span className={`px-2 py-1 text-xs rounded font-medium ${
                                  task.status === 'done' || task.status === 'completed'
                                    ? 'bg-green-900 text-green-200'
                                    : task.status === 'blocked'
                                    ? 'bg-red-900 text-red-200'
                                    : 'bg-yellow-900 text-yellow-200'
                                }`}>
                                  {task.status === 'done' || task.status === 'completed' ? '✅ Done' : task.status === 'blocked' ? '🔒 Blocked' : '⏸️ Pending'}
                                </span>
                                <span className={`px-2 py-1 text-xs rounded font-medium ${
                                  task.priority === 'P1'
                                    ? 'bg-red-900 text-red-200'
                                    : task.priority === 'P2'
                                    ? 'bg-orange-900 text-orange-200'
                                    : task.priority === 'P3'
                                    ? 'bg-yellow-900 text-yellow-200'
                                    : 'bg-blue-900 text-blue-200'
                                }`}>
                                  {task.priority}
                                </span>
                                <span className="px-2 py-1 text-xs rounded font-medium bg-slate-600 text-gray-200">
                                  Due: {(task.due_at || task.due_date) ? new Date(task.due_at || task.due_date || '').toLocaleDateString() : 'No date'}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/task/${task.id}`);
                                }}
                                className="text-blue-400 hover:text-blue-300 p-2"
                              >
                                <Edit2 size={18} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteTask(task.id);
                                }}
                                className="text-red-400 hover:text-red-300 p-2"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                ) : (
                  <p className="text-gray-400 text-center py-8">No tasks</p>
                )}
              </div>
            </div>
          )}

          {/* Commitments Tab */}
          {subTab === 'commitments' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">🎯 Commitments</h3>
                <button
                  onClick={handleAddCommitment}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
                >
                  + New Commitment
                </button>
              </div>

              <div className="space-y-3">
                {commitments.length > 0 ? (
                  commitments.map(commitment => (
                    <div
                      key={commitment.id}
                      className="p-4 bg-slate-700 rounded-lg border-l-4 border-purple-600 hover:bg-slate-600 transition cursor-pointer"
                      onClick={() => navigate(`/commitment/${commitment.id}`)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-white">{commitment.title}</p>
                          <div className="flex gap-2 mt-2 flex-wrap">
                            <span className={`px-2 py-1 text-xs rounded font-medium ${
                              commitment.status === 'done' || commitment.status === 'completed'
                                ? 'bg-green-900 text-green-200'
                                : 'bg-yellow-900 text-yellow-200'
                            }`}>
                              {commitment.status === 'done' || commitment.status === 'completed' ? '✅ Done' : '⏸️ Pending'}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded font-medium ${
                              commitment.priority === 'P1'
                                ? 'bg-red-900 text-red-200'
                                : commitment.priority === 'P2'
                                ? 'bg-orange-900 text-orange-200'
                                : 'bg-blue-900 text-blue-200'
                            }`}>
                              {commitment.priority}
                            </span>
                            <span className="px-2 py-1 text-xs rounded font-medium bg-slate-600 text-gray-200">
                              {commitment.effort_minutes || commitment.planned_minutes || 0} mins
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/commitment/${commitment.id}`);
                          }}
                          className="text-blue-400 hover:text-blue-300 p-2"
                        >
                          <Edit2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-center py-8">No commitments</p>
                )}
              </div>
            </div>
          )}

          {/* Time Blocks Tab */}
          {subTab === 'blocks' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">⏱️ Time Blocks</h3>
                <button
                  onClick={handleAddTimeBlock}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
                >
                  + New Time Block
                </button>
              </div>

              <div className="space-y-3">
                {blocks.length > 0 ? (
                  blocks.map(block => {
                    const startTime = block.startTime || block.start_at?.split('T')[1]?.substring(0, 5) || '09:00';
                    const endTime = block.endTime || block.end_at?.split('T')[1]?.substring(0, 5) || '10:00';
                    
                    const formatTime = (time: string) => {
                      const [hours, minutes] = time.split(':');
                      const hour = parseInt(hours);
                      const ampm = hour >= 12 ? 'PM' : 'AM';
                      const displayHour = hour % 12 || 12;
                      return `${displayHour}:${minutes}${ampm}`;
                    };

                    return (
                      <div
                        key={block.id}
                        className="p-4 bg-slate-700 rounded-lg border-l-4 border-blue-600 hover:bg-slate-600 transition"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-semibold text-white">{block.title || block.type}</p>
                            <p className="text-xs text-gray-400 mt-1">{formatTime(startTime)} - {formatTime(endTime)}</p>
                            <div className="flex gap-2 mt-2">
                              <span className="px-2 py-1 text-xs rounded font-medium bg-slate-600 text-gray-200">
                                {block.date}
                              </span>
                              {block.goal_minutes && (
                                <span className="px-2 py-1 text-xs rounded font-medium bg-slate-600 text-gray-200">
                                  {block.goal_minutes} mins
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              const index = blocks.findIndex(b => b.id === block.id);
                              const newBlocks = [...blocks];
                              newBlocks.splice(index, 1);
                              setBlocks(newBlocks);
                            }}
                            className="text-red-400 hover:text-red-300 p-2"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-400 text-center py-8">No time blocks</p>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Upcoming Meetings Section - Only on Calendar Tab */}
        {subTab === 'calendar' && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                👥 Upcoming Meetings
              </h2>
            </div>

            <div className="space-y-3">
              {meetings.length > 0 ? (
                meetings
                  .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime())
                  .map(meeting => {
                    const startTime = meeting.start_at?.split('T')[1]?.substring(0, 5) || '09:00';
                    const endTime = meeting.end_at?.split('T')[1]?.substring(0, 5) || '10:00';
                    
                    const formatTime = (time: string) => {
                      const [hours, minutes] = time.split(':');
                      const hour = parseInt(hours);
                      const ampm = hour >= 12 ? 'PM' : 'AM';
                      const displayHour = hour % 12 || 12;
                      return `${displayHour}:${minutes}${ampm}`;
                    };

                    const meetingDate = new Date(meeting.start_at);
                    const dateStr = meetingDate.toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    });

                    return (
                      <div
                        key={meeting.id}
                        className="p-4 bg-slate-700 rounded-lg border-l-4 border-blue-600 hover:bg-slate-600 transition cursor-pointer"
                        onClick={() => navigate(`/meeting/${meeting.id}`)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-semibold text-white">{meeting.title}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {dateStr} • {formatTime(startTime)} - {formatTime(endTime)}
                            </p>
                            <div className="flex gap-2 mt-2">
                              <span className={`px-2 py-1 text-xs rounded font-medium ${
                                meeting.status === 'completed'
                                  ? 'bg-green-900 text-green-200'
                                  : meeting.status === 'cancelled'
                                  ? 'bg-red-900 text-red-200'
                                  : 'bg-blue-900 text-blue-200'
                              }`}>
                                {meeting.status || 'Scheduled'}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/meeting/${meeting.id}`);
                            }}
                            className="text-blue-400 hover:text-blue-300 p-2"
                          >
                            <Edit2 size={18} />
                          </button>
                        </div>
                      </div>
                    );
                  })
              ) : (
                <p className="text-gray-400 text-center py-8">No upcoming meetings</p>
              )}
            </div>
          </div>
        )}

        {/* Time Block Modal */}
        <TimeBlockModal
          show={showTimeBlockModal}
          editingId={editingBlockId}
          timeBlockForm={timeBlockForm}
          onFormChange={setTimeBlockForm}
          onCreate={handleCreateTimeBlock}
          onClose={() => setShowTimeBlockModal(false)}
        />

        {/* Subtask Modal for Productivity */}
        <SubtaskModalForProductivity
          show={showSubtaskModal}
          taskTitle={selectedTaskForSubtasks?.title || ''}
          taskId={selectedTaskForSubtasks?.id || ''}
          subtasks={selectedTaskForSubtasks?.checklist_json || []}
          onAddSubtask={(taskId, title) => {
            const task = tasks.find(t => t.id === taskId);
            if (task) {
              const updatedSubtasks = [...(task.checklist_json || []), { item: title, done: false }];
              (async () => {
                try {
                  const response = await fetch(`http://localhost:3000/api/v1/tasks/${taskId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ checklist_json: updatedSubtasks })
                  });
                  if (response.ok) {
                    setTasks(tasks.map(t => t.id === taskId ? { ...t, checklist_json: updatedSubtasks } : t));
                    setSelectedTaskForSubtasks({ ...task, checklist_json: updatedSubtasks });
                  }
                } catch (error) {
                  console.error('Error adding subtask:', error);
                }
              })();
            }
          }}
          onDeleteSubtask={(taskId, index) => {
            const task = tasks.find(t => t.id === taskId);
            if (task) {
              const updatedSubtasks = (task.checklist_json || []).filter((_, i) => i !== index);
              (async () => {
                try {
                  const response = await fetch(`http://localhost:3000/api/v1/tasks/${taskId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ checklist_json: updatedSubtasks })
                  });
                  if (response.ok) {
                    setTasks(tasks.map(t => t.id === taskId ? { ...t, checklist_json: updatedSubtasks } : t));
                    setSelectedTaskForSubtasks({ ...task, checklist_json: updatedSubtasks });
                  }
                } catch (error) {
                  console.error('Error deleting subtask:', error);
                }
              })();
            }
          }}
          onToggleSubtask={(taskId, index) => {
            const task = tasks.find(t => t.id === taskId);
            if (task) {
              const updatedSubtasks = [...(task.checklist_json || [])];
              updatedSubtasks[index].done = !updatedSubtasks[index].done;
              (async () => {
                try {
                  const response = await fetch(`http://localhost:3000/api/v1/tasks/${taskId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ checklist_json: updatedSubtasks })
                  });
                  if (response.ok) {
                    setTasks(tasks.map(t => t.id === taskId ? { ...t, checklist_json: updatedSubtasks } : t));
                    setSelectedTaskForSubtasks({ ...task, checklist_json: updatedSubtasks });
                  }
                } catch (error) {
                  console.error('Error toggling subtask:', error);
                }
              })();
            }
          }}
          onClose={() => setShowSubtaskModal(false)}
        />
      </div>
    </div>
  );
};

export default FounderOSProductivity;
