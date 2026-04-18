import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import fetchApi from '../fetchApi';
import TaskDetailsModal from './TaskDetailsModal';
import { Search, X, GripVertical } from 'lucide-react';

const COLUMNS = {
  'To-Do': { id: 'To-Do', title: 'TO DO', color: 'bg-slate-50/50 dark:bg-slate-900/20' },
  'In Progress': { id: 'In Progress', title: 'IN PROGRESS', color: 'bg-blue-50/50 dark:bg-blue-900/20' },
  'Review': { id: 'Review', title: 'IN REVIEW', color: 'bg-amber-50/50 dark:bg-amber-900/20' },
  'Done': { id: 'Done', title: 'DONE', color: 'bg-emerald-50/50 dark:bg-emerald-900/20' },
};

const KanbanBoard = ({ projectId, refreshTrigger, userRole }) => {
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [localRefresh, setLocalRefresh] = useState(0); 

  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterAssignee, setFilterAssignee] = useState('');

  useEffect(() => {
    const loadBoardData = async () => {
      if (!projectId) return;
      setLoading(true);
      try {
        const taskData = await fetchApi(`/tasks/project/${projectId}`);
        setTasks(taskData.tasks || []);
        const projectData = await fetchApi(`/projects/${projectId}`);
        setMembers(projectData.project.members || []);
      } catch (error) {
        console.error("Board load fail:", error);
      } finally {
        setLoading(false);
      }
    };
    loadBoardData();
  }, [projectId, refreshTrigger, localRefresh]);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = filterPriority ? task.priority === filterPriority : true;
    const matchesAssignee = filterAssignee 
      ? (filterAssignee === 'unassigned' ? !task.assignee : (task.assignee?._id === filterAssignee || task.assignee === filterAssignee))
      : true;
    return matchesSearch && matchesPriority && matchesAssignee;
  });

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;
    if (userRole === 'Viewer') return alert("Access Denied: Viewers cannot move tasks.");

    const newStatus = destination.droppableId;
    const originalTasks = [...tasks];
    setTasks(prev => prev.map(t => String(t._id) === draggableId ? { ...t, status: newStatus } : t));

    try {
      await fetchApi(`/tasks/${draggableId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
    } catch (error) {
      setTasks(originalTasks);
    }
  };

  if (loading && tasks.length === 0) {
    return <div className="flex items-center justify-center h-64 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] animate-pulse">Syncing Agile Board...</div>;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-white dark:bg-[#0f172a] border-b dark:border-slate-800">
        <div className="relative flex-1 min-w-[140px]">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Filter issues..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-[11px] border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="text-[10px] font-bold px-2 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 dark:text-slate-300 outline-none">
            <option value="">Priority</option>
            {['Urgent', 'High', 'Medium', 'Low'].map(p => <option key={p} value={p}>{p}</option>)}
          </select>

          <select value={filterAssignee} onChange={(e) => setFilterAssignee(e.target.value)} className="text-[10px] font-bold px-2 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 dark:text-slate-300 outline-none">
            <option value="">Assignee</option>
            <option value="unassigned">Unassigned</option>
            {members.map(m => <option key={m.user?._id || m._id} value={m.user?._id || m._id}>{m.user?.name || m.name}</option>)}
          </select>

          {(searchQuery || filterPriority || filterAssignee) && (
            <button onClick={() => {setSearchQuery(''); setFilterPriority(''); setFilterAssignee('');}} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-full shrink-0"><X size={14}/></button>
          )}
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        {/* 🔥 MOBILE-FIRST FIX: flex-col on small, flex-row on medium+ */}
        <div className="flex flex-col md:flex-row flex-1 overflow-y-auto md:overflow-x-auto md:overflow-y-hidden gap-4 p-4 min-h-0 bg-[#F9FAFB] dark:bg-[#0b1120] custom-scrollbar">
          {Object.values(COLUMNS).map(column => (
            <div key={column.id} className="flex flex-col w-full md:w-72 md:shrink-0 h-auto md:h-full mb-6 md:mb-0">
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  {column.title} 
                  <span className="bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[9px] text-slate-600 dark:text-slate-400">
                    {filteredTasks.filter(t => t.status === column.id).length}
                  </span>
                </h3>
              </div>

              {/* 🔥 FIXED ERRORS: added all required props with boolean values */}
              <Droppable 
                droppableId={column.id} 
                isCombineEnabled={false} 
                isDropDisabled={false} 
                ignoreContainerClipping={false}
              >
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`flex-1 rounded-xl p-2 transition-all duration-200 border-2 border-transparent ${column.color} ${
                      snapshot.isDraggingOver ? 'border-blue-400/50 bg-blue-500/5' : ''
                    } min-h-[100px] md:overflow-y-auto custom-scrollbar`}
                  >
                    {filteredTasks.filter(t => t.status === column.id).map((task, index) => (
                      <Draggable key={String(task._id)} draggableId={String(task._id)} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => setSelectedTask(task)}
                            className={`bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700/50 mb-2 group hover:border-blue-400 transition-all ${
                              snapshot.isDragging ? 'rotate-2 shadow-2xl ring-2 ring-blue-500/50' : ''
                            }`}
                          >
                            <div className="flex justify-between items-start gap-2 mb-2">
                              <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 leading-snug line-clamp-2">{task.title}</p>
                              <GripVertical className="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100 shrink-0" />
                            </div>
                            <div className="flex justify-between items-center">
                              <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border ${
                                task.priority === 'High' || task.priority === 'Urgent' ? 'bg-red-50 text-red-600 border-red-100 dark:bg-red-950 dark:text-red-400 dark:border-red-900' : 
                                task.priority === 'Medium' ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-900' : 
                                'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-900'
                              }`}>
                                {task.priority}
                              </span>
                              {task.assignee ? (
                                <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[9px] border border-white dark:border-slate-800 shadow-sm" title={task.assignee.name}>
                                  {(task.assignee.name || 'U').charAt(0)}
                                </div>
                              ) : (
                                <div className="w-5 h-5 rounded-full border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400 text-[9px]">?</div>
                              )}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {selectedTask && (
        <TaskDetailsModal 
          task={selectedTask}
          projectId={projectId}
          userRole={userRole}
          closeModal={() => setSelectedTask(null)}
          refreshBoard={() => setLocalRefresh(prev => prev + 1)}
        />
      )}
    </div>
  );
};

export default KanbanBoard;