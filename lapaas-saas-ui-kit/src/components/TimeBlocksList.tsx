import React from 'react';
import { Clock, Edit2, Trash2 } from 'lucide-react';

interface TimeBlock {
  id: string;
  title?: string;
  start_time?: string;
  end_time?: string;
  startTime?: string;
  endTime?: string;
  date: string;
}

interface TimeBlocksListProps {
  timeBlocks: TimeBlock[];
  onEdit: (block: TimeBlock) => void;
  onDelete: (blockId: string) => void;
}

const TimeBlocksList: React.FC<TimeBlocksListProps> = ({
  timeBlocks,
  onEdit,
  onDelete
}) => {
  // Filter out empty time blocks - accept any block with an id
  const validBlocks = timeBlocks.filter(block => block && block.id);
  
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-8">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Clock className="text-blue-400" size={24} />
        Time Blocks
      </h2>
      <div className="space-y-3">
        {validBlocks.length === 0 ? (
          <p className="text-gray-400 text-sm">No time blocks scheduled</p>
        ) : (
          validBlocks.map(block => {
            const startTime = block.startTime || block.start_time || '09:00';
            const endTime = block.endTime || block.end_time || '10:00';
            
            // Format time to 12-hour format
            const formatTime = (time: string) => {
              const [hours, minutes] = time.split(':');
              const hour = parseInt(hours);
              const ampm = hour >= 12 ? 'PM' : 'AM';
              const displayHour = hour % 12 || 12;
              return `${displayHour}:${minutes}${ampm}`;
            };
            
            return (
              <div key={block.id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition">
                <div>
                  <p className="font-semibold text-white">{block.title}</p>
                  <p className="text-xs text-gray-400">{formatTime(startTime)} - {formatTime(endTime)}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(block)}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => onDelete(block.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TimeBlocksList;
