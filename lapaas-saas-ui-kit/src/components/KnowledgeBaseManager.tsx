import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Plus, Search, Edit2, Trash2, Eye, ThumbsUp, 
  FolderPlus, ChevronRight, X, Save, Tag, Clock
} from 'lucide-react';

interface KBCategory {
  id: string;
  orgId: string;
  name: string;
  description: string;
  icon: string;
  order: number;
  articleCount: number;
}

interface KBArticle {
  id: string;
  orgId: string;
  title: string;
  categoryId: string;
  category: string;
  content: string;
  tags: string[];
  viewCount: number;
  helpfulCount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface KnowledgeBaseManagerProps {
  isFounder: boolean;
  orgId?: string;
  userId?: string;
}

const KnowledgeBaseManager: React.FC<KnowledgeBaseManagerProps> = ({ 
  isFounder, 
  orgId = 'org-001',
  userId = 'user-001'
}) => {
  const [categories, setCategories] = useState<KBCategory[]>([]);
  const [articles, setArticles] = useState<KBArticle[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<KBArticle | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState<KBArticle | null>(null);
  const [editingCategory, setEditingCategory] = useState<KBCategory | null>(null);
  
  // Form states
  const [articleForm, setArticleForm] = useState({
    title: '',
    categoryId: '',
    content: '',
    tags: ''
  });
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    icon: '📄'
  });

  useEffect(() => {
    fetchCategories();
    fetchArticles();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/v1/kb-categories?org_id=${orgId}`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchArticles = async (categoryId?: string) => {
    try {
      setLoading(true);
      let url = `http://localhost:3000/api/v1/knowledge-base?org_id=${orgId}`;
      if (categoryId) {
        url += `&category_id=${categoryId}`;
      }
      if (searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}`;
      }
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setArticles(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    setSelectedArticle(null);
    fetchArticles(categoryId || undefined);
  };

  const handleArticleClick = async (article: KBArticle) => {
    try {
      // Fetch full article to increment view count
      const response = await fetch(`http://localhost:3000/api/v1/knowledge-base/${article.id}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedArticle(data.data);
      }
    } catch (error) {
      console.error('Error fetching article:', error);
      setSelectedArticle(article);
    }
  };

  const handleMarkHelpful = async (articleId: string) => {
    try {
      await fetch(`http://localhost:3000/api/v1/knowledge-base/${articleId}/helpful`, {
        method: 'POST'
      });
      // Refresh the selected article
      if (selectedArticle?.id === articleId) {
        setSelectedArticle({
          ...selectedArticle,
          helpfulCount: (selectedArticle.helpfulCount || 0) + 1
        });
      }
      fetchArticles(selectedCategory || undefined);
    } catch (error) {
      console.error('Error marking helpful:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchArticles(selectedCategory || undefined);
  };

  // Article CRUD
  const openArticleModal = (article?: KBArticle) => {
    if (article) {
      setEditingArticle(article);
      setArticleForm({
        title: article.title,
        categoryId: article.categoryId,
        content: article.content,
        tags: article.tags.join(', ')
      });
    } else {
      setEditingArticle(null);
      setArticleForm({
        title: '',
        categoryId: selectedCategory || (categories[0]?.id || ''),
        content: '',
        tags: ''
      });
    }
    setShowArticleModal(true);
  };

  const handleSaveArticle = async () => {
    try {
      const tags = articleForm.tags.split(',').map(t => t.trim()).filter(t => t);
      
      if (editingArticle) {
        // Update
        const response = await fetch(`http://localhost:3000/api/v1/knowledge-base/${editingArticle.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: articleForm.title,
            categoryId: articleForm.categoryId,
            content: articleForm.content,
            tags
          })
        });
        if (response.ok) {
          setShowArticleModal(false);
          fetchArticles(selectedCategory || undefined);
          fetchCategories();
        }
      } else {
        // Create
        const response = await fetch('http://localhost:3000/api/v1/knowledge-base', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orgId,
            title: articleForm.title,
            categoryId: articleForm.categoryId,
            content: articleForm.content,
            tags,
            createdBy: userId
          })
        });
        if (response.ok) {
          setShowArticleModal(false);
          fetchArticles(selectedCategory || undefined);
          fetchCategories();
        }
      }
    } catch (error) {
      console.error('Error saving article:', error);
    }
  };

  const handleDeleteArticle = async (articleId: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;
    
    try {
      const response = await fetch(`http://localhost:3000/api/v1/knowledge-base/${articleId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setSelectedArticle(null);
        fetchArticles(selectedCategory || undefined);
        fetchCategories();
      }
    } catch (error) {
      console.error('Error deleting article:', error);
    }
  };

  // Category CRUD
  const openCategoryModal = (category?: KBCategory) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({
        name: category.name,
        description: category.description,
        icon: category.icon
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({
        name: '',
        description: '',
        icon: '📄'
      });
    }
    setShowCategoryModal(true);
  };

  const handleSaveCategory = async () => {
    try {
      if (editingCategory) {
        // Update
        const response = await fetch(`http://localhost:3000/api/v1/kb-categories/${editingCategory.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(categoryForm)
        });
        if (response.ok) {
          setShowCategoryModal(false);
          fetchCategories();
        }
      } else {
        // Create
        const response = await fetch('http://localhost:3000/api/v1/kb-categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orgId,
            ...categoryForm
          })
        });
        if (response.ok) {
          setShowCategoryModal(false);
          fetchCategories();
        }
      }
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category? All articles must be moved first.')) return;
    
    try {
      const response = await fetch(`http://localhost:3000/api/v1/kb-categories/${categoryId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        if (selectedCategory === categoryId) {
          setSelectedCategory(null);
        }
        fetchCategories();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const iconOptions = ['📄', '📋', '👤', '📁', '👥', '💰', '⚙️', '🔧', '📊', '🎯', '💡', '🔒', '📱', '💻'];

  return (
    <div className="grid grid-cols-12 gap-4 h-[calc(100vh-300px)] min-h-[500px]">
      {/* Left Sidebar - Categories */}
      <div className="col-span-3 bg-slate-800 border border-slate-700 rounded-lg p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <BookOpen size={20} className="text-blue-400" />
            Categories
          </h3>
          {isFounder && (
            <button
              onClick={() => openCategoryModal()}
              className="p-1.5 bg-blue-600 hover:bg-blue-700 rounded text-white transition"
              title="Add Category"
            >
              <FolderPlus size={16} />
            </button>
          )}
        </div>

        <div className="space-y-1">
          <button
            onClick={() => handleCategoryClick(null)}
            className={`w-full text-left px-3 py-2 rounded-lg transition flex items-center justify-between ${
              selectedCategory === null
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/50'
                : 'text-gray-300 hover:bg-slate-700'
            }`}
          >
            <span className="flex items-center gap-2">
              <span>📚</span>
              <span>All Articles</span>
            </span>
            <span className="text-xs bg-slate-600 px-2 py-0.5 rounded">
              {articles.length}
            </span>
          </button>

          {categories.map((category) => (
            <div key={category.id} className="group">
              <button
                onClick={() => handleCategoryClick(category.id)}
                className={`w-full text-left px-3 py-2 rounded-lg transition flex items-center justify-between ${
                  selectedCategory === category.id
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/50'
                    : 'text-gray-300 hover:bg-slate-700'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>{category.icon}</span>
                  <span className="truncate">{category.name}</span>
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-xs bg-slate-600 px-2 py-0.5 rounded">
                    {category.articleCount}
                  </span>
                  {isFounder && (
                    <div className="hidden group-hover:flex items-center gap-1 ml-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); openCategoryModal(category); }}
                        className="p-1 hover:bg-slate-600 rounded"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteCategory(category.id); }}
                        className="p-1 hover:bg-red-600 rounded text-red-400"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}
                </div>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Middle - Article List */}
      <div className="col-span-4 bg-slate-800 border border-slate-700 rounded-lg p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Articles</h3>
          {isFounder && (
            <button
              onClick={() => openArticleModal()}
              className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded text-white text-sm transition"
            >
              <Plus size={16} />
              New Article
            </button>
          )}
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles..."
              className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </form>

        {loading ? (
          <div className="text-center py-8 text-gray-400">Loading...</div>
        ) : articles.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <BookOpen size={48} className="mx-auto mb-2 opacity-50" />
            <p>No articles found</p>
            {isFounder && (
              <button
                onClick={() => openArticleModal()}
                className="mt-2 text-blue-400 hover:text-blue-300"
              >
                Create your first article
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {articles.map((article) => (
              <button
                key={article.id}
                onClick={() => handleArticleClick(article)}
                className={`w-full text-left p-3 rounded-lg transition border ${
                  selectedArticle?.id === article.id
                    ? 'bg-blue-600/20 border-blue-500/50'
                    : 'bg-slate-700/50 border-slate-600 hover:border-blue-500/50'
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <h4 className="font-medium text-white line-clamp-1">{article.title}</h4>
                  <ChevronRight size={16} className="text-gray-400 flex-shrink-0 mt-1" />
                </div>
                <p className="text-sm text-gray-400 line-clamp-2 mb-2">
                  {article.content.substring(0, 100)}...
                </p>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Eye size={12} />
                    {article.viewCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <ThumbsUp size={12} />
                    {article.helpfulCount}
                  </span>
                  <span className="px-2 py-0.5 bg-slate-600 rounded">
                    {article.category}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right - Article Detail */}
      <div className="col-span-5 bg-slate-800 border border-slate-700 rounded-lg p-4 overflow-y-auto">
        {selectedArticle ? (
          <div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-white mb-2">{selectedArticle.title}</h2>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <span className="px-2 py-1 bg-slate-700 rounded">{selectedArticle.category}</span>
                  <span className="flex items-center gap-1">
                    <Eye size={14} />
                    {selectedArticle.viewCount} views
                  </span>
                  <span className="flex items-center gap-1">
                    <ThumbsUp size={14} />
                    {selectedArticle.helpfulCount} helpful
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isFounder && (
                  <>
                    <button
                      onClick={() => openArticleModal(selectedArticle)}
                      className="p-2 bg-slate-700 hover:bg-slate-600 rounded text-gray-300 transition"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteArticle(selectedArticle.id)}
                      className="p-2 bg-red-600/20 hover:bg-red-600 rounded text-red-400 hover:text-white transition"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="prose prose-invert max-w-none mb-6">
              <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                {selectedArticle.content}
              </div>
            </div>

            {selectedArticle.tags.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag size={14} className="text-gray-400" />
                  {selectedArticle.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-slate-700 text-gray-300 rounded text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-slate-700">
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <Clock size={12} />
                Updated {new Date(selectedArticle.updatedAt).toLocaleDateString()}
              </div>
              <button
                onClick={() => handleMarkHelpful(selectedArticle.id)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600/20 hover:bg-green-600 text-green-400 hover:text-white rounded-lg transition"
              >
                <ThumbsUp size={16} />
                Was this helpful?
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <BookOpen size={64} className="mb-4 opacity-30" />
            <p className="text-lg">Select an article to view</p>
            <p className="text-sm">Browse categories or search for help</p>
          </div>
        )}
      </div>

      {/* Article Modal */}
      {showArticleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">
                {editingArticle ? 'Edit Article' : 'New Article'}
              </h3>
              <button
                onClick={() => setShowArticleModal(false)}
                className="p-1 hover:bg-slate-700 rounded"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
                <input
                  type="text"
                  value={articleForm.title}
                  onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  placeholder="Article title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
                <select
                  value={articleForm.categoryId}
                  onChange={(e) => setArticleForm({ ...articleForm, categoryId: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Content</label>
                <textarea
                  value={articleForm.content}
                  onChange={(e) => setArticleForm({ ...articleForm, content: e.target.value })}
                  rows={10}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 resize-none"
                  placeholder="Write your article content here..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={articleForm.tags}
                  onChange={(e) => setArticleForm({ ...articleForm, tags: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  placeholder="e.g., password, account, login"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowArticleModal(false)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-gray-300 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveArticle}
                  disabled={!articleForm.title || !articleForm.categoryId || !articleForm.content}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={16} />
                  {editingArticle ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">
                {editingCategory ? 'Edit Category' : 'New Category'}
              </h3>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="p-1 hover:bg-slate-700 rounded"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Icon</label>
                <div className="flex flex-wrap gap-2">
                  {iconOptions.map((icon) => (
                    <button
                      key={icon}
                      onClick={() => setCategoryForm({ ...categoryForm, icon })}
                      className={`w-10 h-10 flex items-center justify-center text-xl rounded-lg transition ${
                        categoryForm.icon === icon
                          ? 'bg-blue-600 border-2 border-blue-400'
                          : 'bg-slate-700 hover:bg-slate-600'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  placeholder="Category name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  rows={3}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 resize-none"
                  placeholder="Brief description of this category"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-gray-300 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCategory}
                  disabled={!categoryForm.name}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={16} />
                  {editingCategory ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeBaseManager;
