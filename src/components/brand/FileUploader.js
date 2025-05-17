import React, { useState, useRef } from 'react';
import { storage } from '../../firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, arrayUnion, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import FilePreview from './FilePreview';

const FileUploader = ({ projectId, onUploadComplete }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); // { type: 'success' | 'error', message: string }
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef();
  const [pendingUploads, setPendingUploads] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');

  const categories = {
    logos: 'Logo Files',
    brandmarks: 'Brand Marks & Icons',
    typography: 'Typography',
    colors: 'Color Palettes',
    guidelines: 'Brand Guidelines',
    templates: 'Templates & Stationery',
    other: 'Other Brand Assets'
  };

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
    
    const MAX_FILE_SIZE = 25 * 1024 * 1024; // Increased to 25MB for large brand files
    const allowedTypes = {
      logos: [
        'application/illustrator',
        'image/svg+xml',
        'application/eps',
        'image/png',
        'application/pdf'
      ],
      brandmarks: [
        'application/illustrator',
        'image/svg+xml',
        'application/eps',
        'image/png',
        'application/pdf'
      ],
      typography: [
        'application/x-font-ttf',
        'application/x-font-otf',
        'font/ttf',
        'font/otf',
        'application/pdf'
      ],
      colors: [
        'application/pdf',
        'image/png',
        'image/jpeg',
        'application/illustrator'
      ],
      guidelines: [
        'application/pdf',
        'application/illustrator'
      ],
      templates: [
        'application/pdf',
        'application/illustrator',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
        'application/msword' // .doc
      ],
      other: [
        'application/pdf',
        'application/illustrator',
        'image/svg+xml',
        'application/eps',
        'image/png',
        'image/jpeg'
      ]
    };

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

      // Check file type based on selected category
      const isAllowedType = 
        allowedTypes[selectedCategory]?.includes(file.type) ||
        (file.name.toLowerCase().endsWith('.eps') && ['logos', 'brandmarks', 'other'].includes(selectedCategory)) ||
        (file.name.toLowerCase().endsWith('.ai') && ['logos', 'brandmarks', 'guidelines', 'templates', 'other'].includes(selectedCategory)) ||
        (file.name.toLowerCase().endsWith('.ttf') && selectedCategory === 'typography') ||
        (file.name.toLowerCase().endsWith('.otf') && selectedCategory === 'typography');

      if (!isAllowedType && selectedCategory) {
        errors.type.push(file.name);
        isValid = false;
      }

      return isValid;
    });

    // Show error messages if any
    const errorMessages = [];
    if (errors.size.length > 0) {
      errorMessages.push(`The following files exceed the 25MB size limit: ${errors.size.join(', ')}`);
    }
    if (errors.type.length > 0) {
      const allowedExtensions = {
        logos: 'AI, EPS, SVG, PNG, PDF',
        brandmarks: 'AI, EPS, SVG, PNG, PDF',
        typography: 'TTF, OTF, PDF',
        colors: 'PDF, PNG, JPG, AI',
        guidelines: 'PDF, AI',
        templates: 'PDF, AI, DOC, DOCX',
        other: 'AI, EPS, SVG, PNG, JPG, PDF'
      };
      errorMessages.push(`The following files are not allowed for ${categories[selectedCategory]} (must be ${allowedExtensions[selectedCategory]}): ${errors.type.join(', ')}`);
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
        const path = `projects/${projectId}/${selectedCategory}/${file.name}`;
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
    if (!selectedCategory) {
      setUploadStatus({
        type: 'error',
        message: 'Please select a file category before confirming upload.'
      });
      return;
    }

    try {
      setUploading(true);
      const assetRef = doc(db, 'projects', projectId, 'assets', selectedCategory);
      
      const newFiles = pendingUploads.map(file => ({
        name: file.name,
        url: file.url,
        type: file.type,
        fileType: selectedCategory,
        path: file.path,
        uploadedAt: new Date().toISOString()
      }));

      const assetDoc = await getDoc(assetRef);
      const existingFiles = assetDoc.exists() ? assetDoc.data().files || [] : [];

      await setDoc(assetRef, {
        files: [...existingFiles, ...newFiles]
      }, { merge: true });

      onUploadComplete(newFiles);
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
        <div className={`alert ${uploadStatus.type === 'success' ? 'alert-success' : 'alert-danger'} mb-3`}>
          {uploadStatus.message}
          <button 
            type="button" 
            className="btn-close float-end" 
            onClick={() => setUploadStatus(null)}
          ></button>
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
            <p>Uploading brand assets...</p>
          </div>
        ) : (
          <div>
            <i className="fas fa-cloud-upload-alt mb-2" style={{ fontSize: '2rem' }}></i>
            <p>Drag and drop brand files here or click to select</p>
            <p className="text-muted small">Supported formats vary by category</p>
          </div>
        )}
      </div>

      {pendingUploads.length > 0 && (
        <div className="mt-4">
          <div className="mb-3">
            <label htmlFor="fileCategory" className="form-label mr-2">Asset Category</label>
            <select 
              id="fileCategory"
              className="form-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              required
            >
              <option value="">Select a category</option>
              {Object.entries(categories).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6>Files to Upload</h6>
            <button 
              className="btn btn-primary"
              onClick={handleConfirmUploads}
              disabled={!selectedCategory}
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