import React, { useState, useCallback } from 'react';
import { useDraggable, useDroppable } from '../hooks/useDragDrop';

const KanbanBoard = () => {
  const [tasks, setTasks] = useState([
    // Backlog tasks
    { id: '1', title: 'Design new dashboard', status: 'backlog', priority: 'high', assignee: 'John Doe', tags: ['design', 'ui'] },
    { id: '2', title: 'Implement user authentication', status: 'backlog', priority: 'high', assignee: 'Jane Smith', tags: ['backend', 'security'] },
    { id: '3', title: 'Create API documentation', status: 'backlog', priority: 'medium', assignee: 'Mike Johnson', tags: ['docs', 'api'] },
    
    // In Progress tasks
    { id: '4', title: 'Build task management component', status: 'in-progress', priority: 'high', assignee: 'Sarah Wilson', tags: ['frontend', 'react'] },
    { id: '5', title: 'Setup CI/CD pipeline', status: 'in-progress', priority: 'medium', assignee: 'Tom Brown', tags: ['devops', 'automation'] },
    
    // Review tasks
    { id: '6', title: 'Review pull request #42', status: 'review', priority: 'medium', assignee: 'Emily Davis', tags: ['review', 'code'] },
    { id: '7', title: 'Test new features', status: 'review', priority: 'low', assignee: 'Chris Lee', tags: ['testing', 'qa'] },
    
    // Done tasks
    { id: '8', title: 'Fix navigation bug', status: 'done', priority: 'high', assignee: 'Alex Kim', tags: ['bug', 'frontend'] },
    { id: '9', title: 'Update dependencies', status: 'done', priority: 'low', assignee: 'Pat Moore', tags: ['maintenance', 'deps'] },
  ]);

  const columns = [
    { id: 'backlog', title: 'Backlog', color: 'bg-gray-500' },
    { id: 'in-progress', title: 'In Progress', color: 'bg-blue-500' },
    { id: 'review', title: 'Review', color: 'bg-yellow-500' },
    { id: 'done', title: 'Done', color: 'bg-green-500' }
  ];

  const handleTaskDrop = useCallback((dragData, e) => {
    const { data: task } = dragData;
    const columnId = e.currentTarget.dataset.columnId;
    
    setTasks(prevTasks => 
      prevTasks.map(t => 
        t.id === task.id ? { ...t, status: columnId } : t
      )
    );
  }, []);

  const handleFileDrop = useCallback((dropData) => {
    if (dropData.type === 'files') {
      console.log('Files dropped:', dropData.files);
      // Handle file upload logic here
    } else if (dropData.type === 'text') {
      console.log('Text dropped:', dropData.data);
      // Handle text drop logic here
    }
  }, []);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const TaskCard = ({ task }) => {
    const { isDragging, draggableProps } = useDraggable(task, {
      dragType: 'task',
      onDragStart: () => console.log('Task drag started:', task.id),
      onDragEnd: () => console.log('Task drag ended:', task.id)
    });

    return (
      <div
        ref={draggableProps.dragRef}
        {...draggableProps}
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 cursor-move transition-all duration-200 hover:shadow-md ${
          isDragging ? 'opacity-50 rotate-2' : ''
        }`}
      >
        <div className="flex items-start justify-between mb-3">
          <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm flex-1">
            {task.title}
          </h4>
          <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>
        </div>
        
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
            {task.assignee.split(' ').map(n => n[0]).join('')}
          </div>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {task.assignee}
          </span>
        </div>

        <div className="flex flex-wrap gap-1">
          {task.tags.map((tag, index) => (
            <span
              key={index}
              className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const Column = ({ column }) => {
    const columnTasks = tasks.filter(task => task.status === column.id);
    const { isHovered, droppableProps } = useDroppable(handleTaskDrop, {
      acceptTypes: ['task'],
      onDragEnter: () => console.log('Drag entered column:', column.id),
      onDragLeave: () => console.log('Drag left column:', column.id)
    });

    return (
      <div
        ref={droppableProps.dropRef}
        {...droppableProps}
        data-column-id={column.id}
        className={`flex-1 min-h-96 rounded-lg border-2 border-dashed transition-colors duration-200 ${
          isHovered 
            ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50'
        }`}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${column.color}`}></div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                {column.title}
              </h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ({columnTasks.length})
              </span>
            </div>
            <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              add
            </button>
          </div>
        </div>
        
        <div className="p-4 space-y-3">
          {columnTasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
          
          {columnTasks.length === 0 && (
            <div className="text-center py-8 text-gray-400 dark:text-gray-500">
              <div className="text-4xl mb-2">inbox</div>
              <p className="text-sm">Drop tasks here</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Kanban Board
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Drag and drop tasks to organize your workflow
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Add Task
            </button>
            <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
              Filter
            </button>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="p-6">
        <div className="flex gap-6 overflow-x-auto pb-4">
          {columns.map(column => (
            <Column key={column.id} column={column} />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 rounded-b-lg">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <div>
            Total tasks: {tasks.length} | 
            High priority: {tasks.filter(t => t.priority === 'high').length} | 
            In progress: {tasks.filter(t => t.status === 'in-progress').length}
          </div>
          <div>
            Drag tasks between columns to update status
          </div>
        </div>
      </div>
    </div>
  );
};

export default KanbanBoard;
