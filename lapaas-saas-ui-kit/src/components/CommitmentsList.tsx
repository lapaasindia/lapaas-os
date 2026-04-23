import React from 'react';
import { Target, Edit2, Trash2 } from 'lucide-react';

interface Commitment {
  id: string;
  title: string;
  date: string;
  effort_minutes: number;
}

interface CommitmentsListProps {
  commitments: Commitment[];
  onEdit: (commitment: Commitment) => void;
  onDelete: (commitmentId: string) => void;
}

const CommitmentsList: React.FC<CommitmentsListProps> = ({
  commitments,
  onEdit,
  onDelete
}) => {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-8">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Target className="text-green-400" size={24} />
        Daily Commitments
      </h2>
      <div className="space-y-3">
        {commitments.length === 0 ? (
          <p className="text-gray-400 text-sm">No commitments for this day</p>
        ) : (
          commitments.map(commitment => (
            <div key={commitment.id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition">
              <div>
                <p className="font-semibold text-white">{commitment.title}</p>
                <p className="text-xs text-gray-400">{commitment.effort_minutes} minutes</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onEdit(commitment)}
                  className="text-blue-400 hover:text-blue-300"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => onDelete(commitment.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommitmentsList;
