import React, { useState, useCallback } from 'react';
import { useDragDrop } from '../hooks/useDragDrop';
import { processFile, validateFile, getFileType, formatFileSize } from '../hooks/useDragDrop';

const FileUpload = ({ 
  onUpload, 
  multiple = false, 
  accept = '*/*', 
  maxSize = 10 * 1024 * 1024,
  showPreview = true,
  className = ''
}) => {
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [errors, setErrors] = useState([]);

  const handleDrop = useCallback(async (dropData) => {
    setErrors([]);
    
    if (dropData.type === 'files') {
      const fileList = Array.isArray(dropData.files) ? dropData.files : [dropData.files];
      
      // Validate files
      const validFiles = [];
      const newErrors = [];
      
      for (const file of fileList) {
        const validation = validateFile(file, {
          maxSize,
          allowedTypes: accept !== '*/*' ? [accept.split('/')[0]] : []
        });
        
        if (validation.valid) {
          validFiles.push(file);
        } else {
          newErrors.push(...validation.errors.map(err => `${file.name}: ${err}`));
        }
      }
      
      if (newErrors.length > 0) {
        setErrors(newErrors);
      }
      
      if (validFiles.length > 0) {
        // Process files (resize images if needed)
        const processedFiles = await Promise.all(
          validFiles.map(file => processFile(file, { resize: true }))
        );
        
        setFiles(prev => multiple ? [...prev, ...processedFiles] : processedFiles);
        
        // Simulate upload progress
        processedFiles.forEach(file => {
          simulateUploadProgress(file);
        });
        
        onUpload?.(multiple ? processedFiles : processedFiles[0]);
      }
    } else if (dropData.type === 'text') {
      // Handle text drops
      const blob = new Blob([dropData.data], { type: 'text/plain' });
      const file = new File([blob], 'dropped-text.txt', { type: 'text/plain' });
      setFiles(prev => multiple ? [...prev, file] : [file]);
      onUpload?.(multiple ? [file] : file);
    } else if (dropData.type === 'url') {
      // Handle URL drops
      const blob = new Blob([dropData.data], { type: 'text/plain' });
      const file = new File([blob], 'dropped-url.txt', { type: 'text/plain' });
      setFiles(prev => multiple ? [...prev, file] : [file]);
      onUpload?.(multiple ? [file] : file);
    }
  }, [multiple, accept, maxSize, onUpload]);

  const simulateUploadProgress = (file) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
      }
      setUploadProgress(prev => ({
        ...prev,
        [file.name]: progress
      }));
    }, 200);
  };

  const handleFileInput = (e) => {
    const fileList = e.target.files;
    if (fileList.length > 0) {
      handleDrop({ files: Array.from(fileList), type: 'files' });
    }
  };

  const removeFile = (fileName) => {
    setFiles(prev => prev.filter(f => f.name !== fileName));
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileName];
      return newProgress;
    });
  };

  const getFileIcon = (file) => {
    const type = getFileType(file);
    const icons = {
      image: 'image',
      video: 'videocam',
      audio: 'music_note',
      pdf: 'picture_as_pdf',
      document: 'description',
      other: 'insert_drive_file'
    };
    return icons[type] || icons.other;
  };

  const getFileColor = (file) => {
    const type = getFileType(file);
    const colors = {
      image: 'text-green-600',
      video: 'text-purple-600',
      audio: 'text-blue-600',
      pdf: 'text-red-600',
      document: 'text-yellow-600',
      other: 'text-gray-600'
    };
    return colors[type] || colors.other;
  };

  const { isDragging, dragRef, dragProps } = useDragDrop(handleDrop, {
    acceptTypes: accept.split(',').map(t => t.trim().split('/')[0]),
    multiple,
    maxSize,
    onError: (error) => setErrors(prev => [...prev, error])
  });

  const renderPreview = (file) => {
    if (!showPreview) return null;
    
    const type = getFileType(file);
    
    if (type === 'image') {
      return (
        <div className="relative group">
          <img
            src={URL.createObjectURL(file)}
            alt={file.name}
            className="w-full h-32 object-cover rounded-lg"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
            <button
              onClick={() => removeFile(file.name)}
              className="text-white bg-red-500 rounded-full p-2 hover:bg-red-600"
            >
              delete
            </button>
          </div>
        </div>
      );
    }
    
    return (
      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <span className={`text-2xl ${getFileColor(file)}`}>
          {getFileIcon(file)}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {file.name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {formatFileSize(file.size)}
          </p>
        </div>
        <button
          onClick={() => removeFile(file.name)}
          className="text-gray-400 hover:text-red-500 transition-colors"
        >
          close
        </button>
      </div>
    );
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          File Upload
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Drag and drop files here or click to browse
        </p>
      </div>

      {/* Upload Area */}
      <div className="p-6">
        <div
          ref={dragRef}
          {...dragProps}
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }`}
        >
          <input
            type="file"
            multiple={multiple}
            accept={accept}
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          <div className="space-y-4">
            <div className={`text-4xl ${isDragging ? 'text-blue-500' : 'text-gray-400'}`}>
              {isDragging ? 'cloud_download' : 'cloud_upload'}
            </div>
            
            <div>
              <p className={`text-lg font-medium ${
                isDragging ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-gray-100'
              }`}>
                {isDragging ? 'Drop files here' : 'Drag & drop files here'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                or click to browse
              </p>
            </div>
            
            <div className="text-xs text-gray-400 dark:text-gray-500">
              {accept !== '*/*' && `Accepted formats: ${accept}`}
              {maxSize && ` | Max size: ${formatFileSize(maxSize)}`}
              {multiple && ' | Multiple files allowed'}
            </div>
          </div>
        </div>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="px-6 pb-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
              Upload Errors:
            </h4>
            <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
              {errors.map((error, index) => (
                <li key={index}>- {error}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="px-6 pb-6">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">
            Uploaded Files ({files.length})
          </h3>
          
          <div className="space-y-3">
            {files.map((file) => (
              <div key={file.name}>
                {renderPreview(file)}
                
                {/* Upload Progress */}
                {uploadProgress[file.name] !== undefined && uploadProgress[file.name] < 100 && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                      <span>Uploading...</span>
                      <span>{Math.round(uploadProgress[file.name])}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress[file.name]}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                {uploadProgress[file.name] === 100 && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                    <span>check_circle</span>
                    <span>Upload complete</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 rounded-b-lg">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <div>
            {files.length} file{files.length !== 1 ? 's' : ''} selected
          </div>
          {files.length > 0 && (
            <button
              onClick={() => {
                setFiles([]);
                setUploadProgress({});
                setErrors([]);
              }}
              className="text-red-600 hover:text-red-700 font-medium"
            >
              Clear All
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
