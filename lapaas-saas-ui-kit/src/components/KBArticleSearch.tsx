import React, { useState } from 'react';
import { Search, BookOpen, ThumbsUp } from 'lucide-react';

interface KBArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  view_count: number;
  helpful_count: number;
}

interface KBArticleSearchProps {
  onArticleSelect?: (article: KBArticle) => void;
}

const KBArticleSearch: React.FC<KBArticleSearchProps> = ({ onArticleSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<KBArticle[]>([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (searchQuery: string) => {
    if (searchQuery.length < 3) {
      setResults([]);
      return;
    }

    setSearching(true);
    try {
      const response = await fetch(`http://localhost:3000/api/v1/kb-articles/search/${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        setResults(data.data || []);
      }
    } catch (error) {
      console.error('Error searching KB:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleMarkHelpful = async (articleId: string) => {
    try {
      await fetch(`http://localhost:3000/api/v1/kb-articles/${articleId}/helpful`, {
        method: 'POST'
      });
      // Refresh results
      handleSearch(query);
    } catch (error) {
      console.error('Error marking helpful:', error);
    }
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="text-blue-400" size={20} />
        <h3 className="text-lg font-semibold text-white">Knowledge Base</h3>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            handleSearch(e.target.value);
          }}
          placeholder="Search for help articles..."
          className="w-full bg-slate-700 border border-slate-600 rounded pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
      </div>

      {searching && (
        <div className="text-center py-4 text-gray-400">Searching...</div>
      )}

      {!searching && results.length === 0 && query.length >= 3 && (
        <div className="text-center py-4 text-gray-400">No articles found</div>
      )}

      <div className="space-y-3">
        {results.map((article) => (
          <div
            key={article.id}
            className="p-4 bg-slate-700/50 rounded-lg border border-slate-600 hover:border-blue-500 transition cursor-pointer"
            onClick={() => onArticleSelect && onArticleSelect(article)}
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold text-white">{article.title}</h4>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleMarkHelpful(article.id);
                }}
                className="text-gray-400 hover:text-green-400 transition"
              >
                <ThumbsUp size={16} />
              </button>
            </div>
            <p className="text-sm text-gray-300 line-clamp-2 mb-2">
              {article.content.substring(0, 150)}...
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span>{article.category}</span>
              <span>👁 {article.view_count} views</span>
              <span>👍 {article.helpful_count} helpful</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KBArticleSearch;
