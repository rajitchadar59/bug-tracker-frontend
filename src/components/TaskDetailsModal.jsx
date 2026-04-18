import { useState, useEffect } from 'react';
import fetchApi from '../fetchApi';
import { useAuth } from '../context/AuthContext';
import { X, Trash2, Save, Send, MessageSquare, Clock, User as UserIcon } from 'lucide-react';

const TaskDetailsModal = ({ task, closeModal, projectId, refreshBoard, userRole = 'Developer' }) => {
  const { user } = useAuth(); 

  const [formData, setFormData] = useState({
    title: task.title || '',
    description: task.description || '',
    priority: task.priority || 'Medium',
    status: task.status || 'To-Do',
    assignee: task.assignee?._id || ''
  });
  
  const [members, setMembers] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  const isViewer = userRole === 'Viewer';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const projData = await fetchApi(`/projects/${projectId}`);
        setMembers(projData.project.members || []);
        const commentData = await fetchApi(`/comments/${task._id}`);
        setComments(commentData.comments || []);
      } catch (err) {
        console.error("Failed to load data", err);
      }
    };
    fetchData();
  }, [projectId, task._id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setIsEditing(true); 
  };

  const handleUpdate = async () => {
    setLoading(true);

    // 🔥 FIX: Assignee field ko sanitize karna before saving
    const payload = {
      ...formData,
      assignee: formData.assignee === "" ? null : formData.assignee
    };

    try {
      await fetchApi(`/tasks/${task._id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      refreshBoard();
      closeModal();
    } catch (err) {
      alert(err.message || "Update failed");
    } finally {
      setLoading(false);
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure? This ticket will be gone forever.")) {
      try {
        await fetchApi(`/tasks/${task._id}`, { method: 'DELETE' });
        refreshBoard();
        closeModal();
      } catch (err) {
        alert(err.message || "Delete failed");
      }
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setCommentLoading(true);
    try {
      const data = await fetchApi(`/comments/${task._id}`, {
        method: 'POST',
        body: JSON.stringify({ text: newComment })
      });
      setComments([data.comment, ...comments]);
      setNewComment('');
    } catch (err) {
      console.error("Comment failed", err);
    } finally {
      setCommentLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 md:p-4 z-[100] animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] md:max-h-[90vh] overflow-hidden flex flex-col border dark:border-slate-800">
        
        {/* Modal Header */}
        <div className="px-4 py-3 md:px-6 md:py-4 border-b dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded text-[10px] font-black tracking-widest uppercase">
              TASK-{task._id.substring(task._id.length - 4)}
            </span>
          </div>
          <div className="flex gap-2 items-center">
            {!isViewer && isEditing && (
              <button onClick={handleUpdate} disabled={loading} className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-lg shadow-blue-500/20 active:scale-95">
                <Save size={14} /> {loading ? 'Saving...' : 'Save'}
              </button>
            )}
            {!isViewer && (
              <button onClick={handleDelete} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition" title="Delete Task">
                <Trash2 size={16} />
              </button>
            )}
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>
            <button onClick={closeModal} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition text-slate-500 dark:text-slate-400"><X size={20} /></button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex flex-col lg:flex-row overflow-y-auto custom-scrollbar">
          
          {/* Main Content (Left) */}
          <div className="flex-1 p-4 md:p-8 space-y-8 border-b lg:border-b-0 lg:border-r dark:border-slate-800">
            <div>
              <input 
                type="text" 
                name="title"
                value={formData.title} 
                onChange={handleChange}
                disabled={isViewer}
                className="w-full text-xl md:text-2xl font-black text-slate-800 dark:text-white bg-transparent border-none focus:ring-0 placeholder:text-slate-300 dark:placeholder:text-slate-700 p-0 mb-2 outline-none disabled:opacity-70"
                placeholder="Issue Title"
              />
            </div>
            
            <div>
              <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">Description</h3>
              <textarea 
                name="description"
                value={formData.description} 
                onChange={handleChange}
                disabled={isViewer}
                placeholder="Describe this task in detail..."
                className="w-full min-h-[140px] md:min-h-[180px] p-4 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 outline-none resize-none transition-all disabled:opacity-70"
              />
            </div>

            {/* COMMENTS SECTION */}
            <div className="pt-4">
              <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-5 flex items-center gap-2">
                <MessageSquare size={12} /> Discussion
              </h3>
              
              <form onSubmit={handleCommentSubmit} className="mb-8 flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-md">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full pl-4 pr-12 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition shadow-sm"
                  />
                  <button 
                    type="submit" 
                    disabled={!newComment.trim() || commentLoading}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 text-blue-600 disabled:text-slate-300 transition-colors"
                  >
                    {commentLoading ? <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div> : <Send size={16} />}
                  </button>
                </div>
              </form>

              <div className="space-y-6">
                {comments.length === 0 ? (
                  <div className="text-center py-6 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl text-xs text-slate-400 font-medium italic">No comments yet. Start the conversation!</div>
                ) : (
                  comments.map(comment => (
                    <div key={comment._id} className="flex gap-3 group animate-in slide-in-from-left-2 duration-300">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center font-bold text-xs shrink-0 border dark:border-slate-700">
                        {comment.user?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-xs text-slate-800 dark:text-slate-200">{comment.user?.name}</span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1"><Clock size={10}/> {new Date(comment.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl rounded-tl-none border dark:border-slate-800/50">
                          {comment.text}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Area (Right) */}
          <div className="w-full lg:w-80 bg-slate-50/50 dark:bg-[#0c1222] p-6 space-y-8">
            <div className="space-y-6">
              <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b dark:border-slate-800 pb-2">Properties</h4>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-tighter">Status</label>
                  <select name="status" value={formData.status} onChange={handleChange} disabled={isViewer} className="w-full px-3 py-2 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 cursor-pointer focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-70 transition-all">
                    <option value="To-Do">TO DO</option>
                    <option value="In Progress">IN PROGRESS</option>
                    <option value="Review">IN REVIEW</option>
                    <option value="Done">DONE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-tighter">Assignee</label>
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold text-xs shrink-0 shadow-inner overflow-hidden border dark:border-slate-700">
                      {formData.assignee ? (
                        members.find(m => (m.user?._id || m._id) === formData.assignee)?.user?.name?.charAt(0).toUpperCase()
                      ) : <UserIcon size={16} className="opacity-40" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <select 
                        name="assignee" 
                        value={formData.assignee} 
                        onChange={handleChange} 
                        disabled={isViewer}
                        className="w-full px-3 py-2 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-green-600 dark:text-green-400 cursor-pointer focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-70 transition-all"
                      >
                        <option value="">Unassigned</option>
                        {members.filter(m => m.role !== 'Viewer').map(member => (
                          <option key={member._id} value={member.user?._id || member._id}>{member.user?.name || member.name}</option>
                        ))}
                      </select>
                      {!isViewer && formData.assignee !== user?._id && (
                        <button type="button" onClick={() => handleChange({ target: { name: 'assignee', value: user?._id }})} className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-bold mt-0.5">Assign to me</button>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-tighter">Priority Level</label>
                  <select name="priority" value={formData.priority} onChange={handleChange} disabled={isViewer} className={`w-full px-3 py-2 text-xs font-bold border dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-70 transition-all ${
                    formData.priority === 'High' || formData.priority === 'Urgent' ? 'text-red-500' : formData.priority === 'Medium' ? 'text-amber-500' : 'text-emerald-500'
                  }`}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="pt-6 border-t dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Reporter</span>
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{task.reporter?.name || 'Automated System'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Created</span>
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{new Date(task.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsModal;