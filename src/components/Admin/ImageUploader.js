import React, { useState, useRef, useCallback } from 'react';
import { FaCloudUploadAlt, FaTimes, FaImage } from 'react-icons/fa';
import './ImageUploader.scss';

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

const ImageUploader = ({ label, existingUrl, onFileSelect, onClear }) => {
  const [preview, setPreview] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const validateFile = useCallback((file) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Desteklenmeyen dosya formatı. JPG, PNG, GIF veya WebP kullanın.';
    }
    if (file.size > MAX_SIZE) {
      return 'Dosya boyutu 10MB\'dan büyük olamaz.';
    }
    return null;
  }, []);

  const handleFile = useCallback((file) => {
    if (!file) return;
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setPreview(URL.createObjectURL(file));
    onFileSelect(file);
  }, [validateFile, onFileSelect]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleInputChange = useCallback((e) => {
    const file = e.target.files[0];
    handleFile(file);
  }, [handleFile]);

  const handleRemove = useCallback(() => {
    setPreview(null);
    setError('');
    if (inputRef.current) inputRef.current.value = '';
    onClear();
  }, [onClear]);

  const displayUrl = preview || existingUrl;

  return (
    <div className="image-uploader">
      {label && <label className="uploader-label">{label}</label>}

      {displayUrl ? (
        <div className="uploader-preview">
          <img src={displayUrl} alt="Önizleme" />
          <button type="button" className="remove-btn" onClick={handleRemove} aria-label="Resmi kaldır">
            <FaTimes />
          </button>
          <button
            type="button"
            className="change-btn"
            onClick={() => inputRef.current?.click()}
          >
            Değiştir
          </button>
        </div>
      ) : (
        <div
          className={`uploader-dropzone ${isDragOver ? 'drag-over' : ''} ${error ? 'has-error' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
        >
          <FaCloudUploadAlt className="dropzone-icon" />
          <p className="dropzone-text">
            Dosyayı sürükleyip bırakın veya <span className="dropzone-link">tıklayarak seçin</span>
          </p>
          <p className="dropzone-hint">JPG, PNG, GIF, WebP — Maks. 10MB</p>
        </div>
      )}

      {error && <p className="uploader-error">{error}</p>}

      {!displayUrl && !error && existingUrl === undefined && (
        <div className="uploader-empty-hint">
          <FaImage className="empty-icon" />
          <span>Henüz resim seçilmedi</span>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleInputChange}
        className="uploader-hidden-input"
      />
    </div>
  );
};

export default ImageUploader;
