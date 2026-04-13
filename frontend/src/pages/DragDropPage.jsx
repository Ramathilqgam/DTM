import React, { useState } from 'react';
import KanbanBoard from '../components/KanbanBoard';
import FileUpload from '../components/FileUpload';

export default function DragDropPage() {
  const [activeTab, setActiveTab] = useState('kanban');
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleFileUpload = (files) => {
    const fileList = Array.isArray(files) ? files : [files];
    setUploadedFiles(prev => [...prev, ...fileList]);
    console.log('Files uploaded:', fileList);
  };

  const tabs = [
    { id: 'kanban', label: 'Kanban Board', icon: 'view_kanban' },
    { id: 'upload', label: 'File Upload', icon: 'cloud_upload' },
    { id: 'demo', label: 'Interactive Demo', icon: 'touch_app' }
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Drag & Drop Features
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Experience intuitive drag-and-drop functionality for tasks and files
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex -mb-px">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'kanban' && (
              <div className="space-y-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    Kanban Board Demo
                  </h3>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Drag tasks between columns to change their status. You can also drag tasks to reorder them within columns.
                  </p>
                </div>
                <KanbanBoard />
              </div>
            )}

            {activeTab === 'upload' && (
              <div className="space-y-6">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                    File Upload Demo
                  </h3>
                  <p className="text-sm text-green-800 dark:text-green-200">
                    Drag and drop files onto the upload area or click to browse. Supports multiple file types with preview functionality.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <FileUpload
                    onUpload={handleFileUpload}
                    multiple={true}
                    accept="image/*,video/*,.pdf,.doc,.docx"
                    maxSize={50 * 1024 * 1024} // 50MB
                  />
                  
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                      Upload Statistics
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Files Uploaded:</span>
                        <span className="font-medium">{uploadedFiles.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Total Size:</span>
                        <span className="font-medium">
                          {uploadedFiles.reduce((total, file) => total + file.size, 0) > 0 
                            ? `${(uploadedFiles.reduce((total, file) => total + file.size, 0) / 1024 / 1024).toFixed(2)} MB`
                            : '0 MB'
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">File Types:</span>
                        <span className="font-medium">
                          {[...new Set(uploadedFiles.map(f => f.type.split('/')[0]))].join(', ') || 'None'}
                        </span>
                      </div>
                    </div>
                    
                    {uploadedFiles.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                          Recent Uploads:
                        </h4>
                        <div className="space-y-2">
                          {uploadedFiles.slice(-3).map((file, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <span>insert_drive_file</span>
                              <span>{file.name}</span>
                              <span className="text-xs">
                                ({(file.size / 1024).toFixed(1)} KB)
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'demo' && (
              <div className="space-y-6">
                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
                    Interactive Demo
                  </h3>
                  <p className="text-sm text-purple-800 dark:text-purple-200">
                    Try dragging items between different zones to see various drag-and-drop behaviors.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Draggable Items */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                      Draggable Items
                    </h3>
                    <div className="space-y-3">
                      {['Task A', 'Task B', 'Task C'].map((task, index) => (
                        <div
                          key={index}
                          draggable
                          className="bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 rounded-lg p-3 cursor-move hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', task);
                            e.dataTransfer.effectAllowed = 'move';
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <span>drag_indicator</span>
                            <span className="font-medium">{task}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Drop Zones */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                      Priority Zones
                    </h3>
                    <div className="space-y-3">
                      {['High Priority', 'Medium Priority', 'Low Priority'].map((priority, index) => (
                        <div
                          key={index}
                          className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 min-h-[60px] flex items-center justify-center text-gray-500 dark:text-gray-400 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            const task = e.dataTransfer.getData('text/plain');
                            console.log(`Dropped "${task}" into ${priority}`);
                          }}
                        >
                          <span className="text-sm">{priority}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Results */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                      Instructions
                    </h3>
                    <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-start gap-2">
                        <span className="text-blue-500">1</span>
                        <span>Drag items from the left panel</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-blue-500">2</span>
                        <span>Drop them into priority zones</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-blue-500">3</span>
                        <span>Check console for drop events</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-blue-500">4</span>
                        <span>Try the other tabs for more demos</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        <strong>Tip:</strong> This demo logs drag and drop events to the browser console.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Advanced Features */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Advanced Features
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-3xl mb-2">touch_app</div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">Touch Support</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Works on mobile devices
                      </p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-3xl mb-2">speed</div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">Performance</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Optimized for speed
                      </p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-3xl mb-2">accessibility</div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">Accessibility</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Keyboard navigation
                      </p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-3xl mb-2">devices</div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">Cross-Platform</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Works everywhere
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
