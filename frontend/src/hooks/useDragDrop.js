import { useState, useRef, useCallback } from 'react';

export const useDragDrop = (onDrop, options = {}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);
  const dragRef = useRef(null);

  const {
    acceptTypes = [],
    multiple = false,
    maxSize = 10 * 1024 * 1024, // 10MB
    onDragEnter,
    onDragLeave,
    onDragOver,
    onError
  } = options;

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => prev + 1);
    
    if (dragCounter === 0) {
      setIsDragging(true);
    }
    
    onDragEnter?.(e);
  }, [dragCounter, onDragEnter]);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => prev - 1);
    
    if (dragCounter === 1) {
      setIsDragging(false);
    }
    
    onDragLeave?.(e);
  }, [dragCounter, onDragLeave]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    onDragOver?.(e);
  }, [onDragOver]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setDragCounter(0);

    const files = Array.from(e.dataTransfer.files);
    const items = Array.from(e.dataTransfer.items);

    // Handle file drops
    if (files.length > 0) {
      const validFiles = files.filter(file => {
        if (acceptTypes.length > 0 && !acceptTypes.some(type => file.type.includes(type))) {
          onError?.(`Invalid file type: ${file.type}`);
          return false;
        }
        if (file.size > maxSize) {
          onError?.(`File too large: ${file.name}`);
          return false;
        }
        return true;
      });

      if (!multiple && validFiles.length > 1) {
        onError?.('Only single file allowed');
        return;
      }

      onDrop({ files: multiple ? validFiles : validFiles[0], type: 'files' });
      return;
    }

    // Handle text/URL drops
    const text = e.dataTransfer.getData('text');
    const url = e.dataTransfer.getData('text/uri-list');
    
    if (url) {
      onDrop({ data: url, type: 'url' });
    } else if (text) {
      onDrop({ data: text, type: 'text' });
    }
  }, [acceptTypes, multiple, maxSize, onDrop, onError]);

  const setupDragEvents = useCallback((element) => {
    if (!element) return;

    const el = element;
    el.addEventListener('dragenter', handleDragEnter);
    el.addEventListener('dragleave', handleDragLeave);
    el.addEventListener('dragover', handleDragOver);
    el.addEventListener('drop', handleDrop);

    return () => {
      el.removeEventListener('dragenter', handleDragEnter);
      el.removeEventListener('dragleave', handleDragLeave);
      el.removeEventListener('dragover', handleDragOver);
      el.removeEventListener('drop', handleDrop);
    };
  }, [handleDragEnter, handleDragLeave, handleDragOver, handleDrop]);

  return {
    isDragging,
    dragRef,
    setupDragEvents,
    dragProps: {
      onDragEnter: handleDragEnter,
      onDragLeave: handleDragLeave,
      onDragOver: handleDragOver,
      onDrop: handleDrop
    }
  };
};

export const useDraggable = (data, options = {}) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef(null);

  const {
    dragType = 'item',
    onDragStart,
    onDragEnd,
    disabled = false
  } = options;

  const handleDragStart = useCallback((e) => {
    if (disabled) {
      e.preventDefault();
      return;
    }

    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/json', JSON.stringify({
      type: dragType,
      data: data
    }));

    // Create custom drag image
    const dragImage = dragRef.current?.cloneNode(true);
    if (dragImage) {
      dragImage.style.position = 'absolute';
      dragImage.style.top = '-1000px';
      dragImage.style.opacity = '0.8';
      dragImage.style.transform = 'rotate(5deg)';
      document.body.appendChild(dragImage);
      e.dataTransfer.setDragImage(dragImage, e.offsetX, e.offsetY);
      setTimeout(() => document.body.removeChild(dragImage), 0);
    }

    onDragStart?.(e);
  }, [data, dragType, disabled, onDragStart]);

  const handleDragEnd = useCallback((e) => {
    setIsDragging(false);
    onDragEnd?.(e);
  }, [onDragEnd]);

  return {
    isDragging,
    dragRef,
    draggableProps: {
      draggable: !disabled,
      onDragStart: handleDragStart,
      onDragEnd: handleDragEnd
    }
  };
};

export const useDroppable = (onDrop, options = {}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const dropRef = useRef(null);

  const {
    acceptTypes = ['item'],
    multiple = false,
    onDragEnter,
    onDragLeave,
    onDragOver,
    onError
  } = options;

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const dragData = getDragData(e);
    if (!dragData || !acceptTypes.includes(dragData.type)) {
      onError?.(`Invalid drag type: ${dragData?.type}`);
      return;
    }

    setIsHovered(true);
    onDragEnter?.(e, dragData);
  }, [acceptTypes, onDragEnter, onError]);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsHovered(false);
    onDragLeave?.(e);
  }, [onDragLeave]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    onDragOver?.(e);
  }, [onDragOver]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsHovered(false);
    setIsActive(false);

    const dragData = getDragData(e);
    if (!dragData || !acceptTypes.includes(dragData.type)) {
      onError?.(`Invalid drag type: ${dragData?.type}`);
      return;
    }

    onDrop(dragData, e);
  }, [acceptTypes, onDrop, onError]);

  return {
    isHovered,
    isActive,
    dropRef,
    droppableProps: {
      onDragEnter: handleDragEnter,
      onDragLeave: handleDragLeave,
      onDragOver: handleDragOver,
      onDrop: handleDrop
    }
  };
};

// Helper function to extract drag data
const getDragData = (e) => {
  try {
    const data = e.dataTransfer.getData('application/json');
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

// File processing utilities
export const processFile = async (file, options = {}) => {
  const {
    resize = false,
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
    format = 'image/jpeg'
  } = options;

  if (!file.type.startsWith('image/')) {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      let { width, height } = img;

      // Resize if needed
      if (resize && (width > maxWidth || height > maxHeight)) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob((blob) => {
        const processedFile = new File([blob], file.name, {
          type: format,
          lastModified: Date.now()
        });
        resolve(processedFile);
      }, format, quality);
    };

    img.src = URL.createObjectURL(file);
  });
};

// Drag and drop validation utilities
export const validateFile = (file, rules = {}) => {
  const {
    maxSize = 10 * 1024 * 1024,
    allowedTypes = [],
    required = false
  } = rules;

  const errors = [];

  if (required && !file) {
    errors.push('File is required');
    return { valid: false, errors };
  }

  if (!file) {
    return { valid: true, errors: [] };
  }

  if (file.size > maxSize) {
    errors.push(`File size exceeds ${maxSize / 1024 / 1024}MB`);
  }

  if (allowedTypes.length > 0 && !allowedTypes.some(type => file.type.includes(type))) {
    errors.push(`File type ${file.type} not allowed`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

// File type utilities
export const getFileType = (file) => {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  if (file.type.startsWith('audio/')) return 'audio';
  if (file.type.includes('pdf')) return 'pdf';
  if (file.type.includes('document') || file.type.includes('text')) return 'document';
  return 'other';
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Drag preview utilities
export const createDragPreview = (element, options = {}) => {
  const {
    opacity = 0.8,
    transform = 'rotate(5deg)',
    scale = 1.0
  } = options;

  const preview = element.cloneNode(true);
  preview.style.position = 'absolute';
  preview.style.top = '-1000px';
  preview.style.opacity = opacity;
  preview.style.transform = `${transform} scale(${scale})`;
  preview.style.pointerEvents = 'none';
  preview.style.zIndex = '9999';
  
  document.body.appendChild(preview);
  return preview;
};

export default useDragDrop;
