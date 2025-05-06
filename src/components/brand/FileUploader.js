import React, { useState, useRef } from 'react';
import { storage } from '../../firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, arrayUnion, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import FilePreview from './FilePreview';

const FileUploader = ({ projectId, category, subCategory, onUploadComplete }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); // { type: 'success' | 'error', message: string }
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef();
  const [pendingUploads, setPendingUploads] = useState([]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = [...e.dataTransfer.files];
    if (files && files.length > 0) {
      await uploadFiles(files);
    }
  };

  const handleFileSelect = async (e) => {
    const files = [...e.target.files];
    if (files && files.length > 0) {
      await uploadFiles(files);
    }
  };

  const uploadFiles = async (files) => {
    setUploading(true);
    setUploadStatus(null);
    
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
    const allowedTypes = [
      'application/pdf',
      'application/illustrator',
      'image/svg+xml',
      'application/eps',
      'application/x-eps',
      'application/postscript',
      'image/x-eps',
      'image/eps',
      'image/png',
      'image/jpeg',
      'image/jpg',
      'application/octet-stream'
    ];

    const errors = {
      size: [],
      type: []
    };

    const validFiles = files.filter(file => {
      let isValid = true;

      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        errors.size.push(file.name);
        isValid = false;
      }

      // Check file type
      const isAllowedType = allowedTypes.includes(file.type) || 
                           file.name.toLowerCase().endsWith('.eps') ||
                           file.name.toLowerCase().endsWith('.ai');
      if (!isAllowedType) {
        errors.type.push(file.name);
        isValid = false;
      }

      return isValid;
    });

    // Show error messages if any
    const errorMessages = [];
    if (errors.size.length > 0) {
      errorMessages.push(`The following files exceed the 5MB size limit: ${errors.size.join(', ')}`);
    }
    if (errors.type.length > 0) {
      errorMessages.push(`The following files are not allowed (must be AI, EPS, SVG, PNG, JPG, or PDF): ${errors.type.join(', ')}`);
    }
    
    if (errorMessages.length > 0) {
      setUploadStatus({
        type: 'error',
        message: errorMessages.join('\n')
      });
    }

    if (validFiles.length === 0) {
      setUploading(false);
      return;
    }
    
    const uploadPromises = validFiles.map(async (file) => {
      try {
        const path = `projects/${projectId}/${category}/${subCategory || ''}/${file.name}`;
        const fileRef = ref(storage, path);
        await uploadBytes(fileRef, file);
        const url = await getDownloadURL(fileRef);
        return { name: file.name, url, type: file.type, path };
      } catch (error) {
        console.error('Upload error:', error);
        return { error: true, name: file.name };
      }
    });

    try {
      const results = await Promise.all(uploadPromises);
      const failures = results.filter(r => r.error);
      const successes = results.filter(r => !r.error);
      
      if (failures.length > 0) {
        setUploadStatus({
          type: 'error',
          message: `Failed to upload: ${failures.map(f => f.name).join(', ')}`
        });
      }
      
      if (successes.length > 0) {
        setUploadStatus({
          type: 'success',
          message: successes.length === 1
            ? `Successfully uploaded ${successes[0].name}`
            : `Successfully uploaded: ${successes.map(f => f.name).join(', ')}`
        });
        setPendingUploads(prev => [...prev, ...successes]);
      }
    } catch (error) {
      setUploadStatus({
        type: 'error',
        message: 'Upload failed. Please try again.'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleConfirmUploads = async () => {
    try {
      setUploading(true);
      const assetRef = doc(db, 'projects', projectId, 'assets', category);
      
      // Prepare new files data with regular timestamp
      const newFiles = pendingUploads.map(file => ({
        name: file.name,
        url: file.url,
        type: file.type,
        path: file.path,
        category,
        subCategory: subCategory || null,
        uploadedAt: new Date().toISOString() // Use ISO string instead of serverTimestamp
      }));

      // Get existing files first
      const assetDoc = await getDoc(assetRef);
      const existingFiles = assetDoc.exists() ? assetDoc.data().files || [] : [];

      // Update Firestore with combined array
      await setDoc(assetRef, {
        files: [...existingFiles, ...newFiles]
      }, { merge: true });

      // Update local state through parent component
      onUploadComplete(newFiles);
      
      // Clear pending uploads
      setPendingUploads([]);
      
      setUploadStatus({
        type: 'success',
        message: 'Files successfully saved to project!'
      });

    } catch (error) {
      console.error('Error saving files:', error);
      setUploadStatus({
        type: 'error',
        message: 'Failed to save files to project. Please try again.'
      });
    } finally {
      setUploading(false);
    }
  };

  const removePendingUpload = (fileToRemove) => {
    setPendingUploads(prev => prev.filter(file => file.url !== fileToRemove.url));
  };

  return (
    <>
      {uploadStatus && (
        <div 
          className={`alert ${uploadStatus.type === 'success' ? 'alert-success' : 'alert-danger'} mb-3`}
          style={{ fontSize: '0.9rem' }}
        >
          {uploadStatus.message}
          <button 
            type="button" 
            className="btn-close float-end" 
            onClick={() => setUploadStatus(null)}
            aria-label="Close"
          >X</button>
        </div>
      )}
      
      <div
        className={`upload-zone ${isDragging ? 'dragging' : ''} ${uploading ? 'uploading' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current.click()}
        style={{
          border: '2px dashed #ccc',
          borderRadius: '4px',
          padding: '20px',
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: isDragging ? '#f8f9fa' : 'white',
          transition: 'all 0.3s ease'
        }}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          multiple
        />
        {uploading ? (
          <div className="upload-progress">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Uploading...</span>
            </div>
            <p>Uploading files...</p>
          </div>
        ) : (
          <div>
            <i className="fas fa-cloud-upload-alt mb-2" style={{ fontSize: '2rem' }}></i>
            <p>Drag and drop files here or click to select</p>
          </div>
        )}
      </div>

      {pendingUploads.length > 0 && (
        <div className="mt-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6>Pending Uploads</h6>
            <button 
              className="btn btn-primary"
              onClick={handleConfirmUploads}
            >
              Confirm Upload
            </button>
          </div>
          <div className="d-flex flex-wrap gap-3">
            {pendingUploads.map((file, index) => (
              <div key={index} className="file-thumb position-relative mr-2 mb-2">
                <FilePreview 
                  file={file} 
                  width={80}
                />
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => removePendingUpload(file)}
                >
                  X
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default FileUploader; 