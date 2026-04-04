import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { db, storage, ensureAuth } from '../../firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { toast } from 'react-toastify';
import {
  FaPlus, FaSearch, FaSortAmountDown, FaSortAmountUp,
  FaTh, FaList, FaEdit, FaTrash, FaExternalLinkAlt,
  FaArrowLeft, FaImage, FaBriefcase, FaVideo, FaTimes,
} from 'react-icons/fa';
import ImageUploader from './ImageUploader';
import ConfirmDialog from './ConfirmDialog';
import './PortfolioManager.scss';

const DESC_MAX_LENGTH = 500;
const PEEK_VIDEO_MAX = 80 * 1024 * 1024;
const PEEK_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const COVER_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const COVER_IMAGE_MAX = 10 * 1024 * 1024;

const PortfolioManager = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // View state
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('az');

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [projectUrl, setProjectUrl] = useState('');
  const [existingImageUrl, setExistingImageUrl] = useState('');
  const [existingCoverUrl, setExistingCoverUrl] = useState('');
  const [existingCoverIsVideo, setExistingCoverIsVideo] = useState(false);
  const [coverBlobUrl, setCoverBlobUrl] = useState(null);
  const [coverMediaKind, setCoverMediaKind] = useState(null);
  const [peekVideoFile, setPeekVideoFile] = useState(null);
  const [peekBlobUrl, setPeekBlobUrl] = useState(null);
  const [existingPeekVideoUrl, setExistingPeekVideoUrl] = useState('');
  const [formErrors, setFormErrors] = useState({});

  // Delete dialog
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, name: '' });

  const portfolioRef = useMemo(() => collection(db, 'portfolio'), []);
  const peekVideoInputRef = useRef(null);
  const coverMediaInputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (peekBlobUrl) URL.revokeObjectURL(peekBlobUrl);
    };
  }, [peekBlobUrl]);

  useEffect(() => {
    return () => {
      if (coverBlobUrl) URL.revokeObjectURL(coverBlobUrl);
    };
  }, [coverBlobUrl]);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      await ensureAuth();
      const snap = await getDocs(portfolioRef);
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error('[PortfolioManager] Fetch error:', err);
      toast.error('Portfolyo öğeleri yüklenirken hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  }, [portfolioRef]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    if (searchParams.get('action') === 'new' && !showForm) {
      openNewForm();
      setSearchParams({}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const filteredItems = useMemo(() => {
    let result = [...items];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(item =>
        item.name?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q)
      );
    }
    result.sort((a, b) => {
      const nameA = (a.name || '').toLowerCase();
      const nameB = (b.name || '').toLowerCase();
      return sortOrder === 'az' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    });
    return result;
  }, [items, searchQuery, sortOrder]);

  const resetForm = useCallback(() => {
    setName('');
    setDescription('');
    setImageFile(null);
    setCoverFile(null);
    setProjectUrl('');
    setExistingImageUrl('');
    setExistingCoverUrl('');
    setExistingCoverIsVideo(false);
    setCoverBlobUrl(null);
    setCoverMediaKind(null);
    setPeekVideoFile(null);
    setPeekBlobUrl(null);
    setExistingPeekVideoUrl('');
    setCurrentItem(null);
    setShowForm(false);
    setFormErrors({});
  }, []);

  const openNewForm = useCallback(() => {
    resetForm();
    setShowForm(true);
  }, [resetForm]);

  const handleCoverMediaSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isVideo = PEEK_VIDEO_TYPES.includes(file.type);
    const isImage = COVER_IMAGE_TYPES.includes(file.type);
    if (!isVideo && !isImage) {
      toast.error('Kapak için JPG, PNG, GIF, WebP veya MP4, WebM, MOV seçin.');
      return;
    }
    if (isVideo && file.size > PEEK_VIDEO_MAX) {
      toast.error('Video boyutu en fazla 80MB olabilir.');
      return;
    }
    if (isImage && file.size > COVER_IMAGE_MAX) {
      toast.error('Görsel boyutu en fazla 10MB olabilir.');
      return;
    }
    setCoverBlobUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    setCoverFile(file);
    setCoverMediaKind(isVideo ? 'video' : 'image');
  }, []);

  const clearCoverMedia = useCallback(() => {
    setCoverBlobUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setCoverFile(null);
    setCoverMediaKind(null);
    setExistingCoverUrl('');
    setExistingCoverIsVideo(false);
    if (coverMediaInputRef.current) coverMediaInputRef.current.value = '';
  }, []);

  const handlePeekVideoSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!PEEK_VIDEO_TYPES.includes(file.type)) {
      toast.error('Peek videosu için MP4, WebM veya MOV kullanın.');
      return;
    }
    if (file.size > PEEK_VIDEO_MAX) {
      toast.error('Video boyutu en fazla 80MB olabilir.');
      return;
    }
    setPeekBlobUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    setPeekVideoFile(file);
  }, []);

  const clearPeekVideo = useCallback(() => {
    setPeekBlobUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setPeekVideoFile(null);
    setExistingPeekVideoUrl('');
    if (peekVideoInputRef.current) peekVideoInputRef.current.value = '';
  }, []);

  const openEditForm = useCallback((item) => {
    resetForm();
    setCurrentItem(item);
    setName(item.name || '');
    setDescription(item.description || '');
    setProjectUrl(item.url || '');
    setExistingImageUrl(item.image || '');
    setExistingCoverUrl(item.cover || '');
    setExistingCoverIsVideo(item.coverIsVideo === true);
    setExistingPeekVideoUrl(item.peekVideo || '');
    setPeekVideoFile(null);
    setPeekBlobUrl(null);
    setShowForm(true);
  }, [resetForm]);

  const validateForm = useCallback(() => {
    const errs = {};
    if (!name.trim()) errs.name = 'Proje adı zorunludur.';
    if (!description.trim()) errs.description = 'Açıklama zorunludur.';
    if (!imageFile && !existingImageUrl) errs.image = 'Ana görsel zorunludur.';
    if (!projectUrl.trim()) errs.url = 'Proje URL\'si zorunludur.';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  }, [name, description, imageFile, existingImageUrl, projectUrl]);

  const uploadFile = useCallback(async (file, pathPrefix) => {
    if (!file) return null;
    await ensureAuth();
    const fileRef = storageRef(storage, `${pathPrefix}/${Date.now()}_${file.name}`);
    await uploadBytes(fileRef, file);
    return getDownloadURL(fileRef);
  }, []);

  const safeDeleteStorage = useCallback(async (url) => {
    if (!url) return;
    try {
      await deleteObject(storageRef(storage, url));
    } catch (err) {
      if (err.code !== 'storage/object-not-found') {
        console.error('Storage delete error:', err);
      }
    }
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    let imageUrl = existingImageUrl;
    let coverUrl = existingCoverUrl;

    try {
      await ensureAuth();

      if (imageFile) {
        if (currentItem?.image) {
          await safeDeleteStorage(currentItem.image);
        }
        imageUrl = await uploadFile(imageFile, 'portfolio_images');
      }

      let coverIsVideoOut = existingCoverIsVideo;

      if (coverFile) {
        if (currentItem?.cover && currentItem.cover !== existingImageUrl) {
          await safeDeleteStorage(currentItem.cover);
        }
        const isVid = coverMediaKind === 'video';
        const prefix = isVid ? 'portfolio_videos' : 'portfolio_covers';
        coverUrl = await uploadFile(coverFile, prefix);
        coverIsVideoOut = isVid;
      }

      let coverOut = coverUrl || null;
      if (!coverOut) {
        coverOut = imageUrl;
        coverIsVideoOut = false;
      }

      let peekVideoUrl = existingPeekVideoUrl || null;
      if (peekVideoFile) {
        if (currentItem?.peekVideo) {
          await safeDeleteStorage(currentItem.peekVideo);
        }
        peekVideoUrl = await uploadFile(peekVideoFile, 'portfolio_videos');
      } else if (!existingPeekVideoUrl && currentItem?.peekVideo) {
        await safeDeleteStorage(currentItem.peekVideo);
        peekVideoUrl = null;
      }

      const data = {
        name: name.trim(),
        description: description.trim(),
        image: imageUrl,
        imageIsVideo: false,
        cover: coverOut,
        coverIsVideo: coverIsVideoOut,
        url: projectUrl.trim(),
        peekVideo: peekVideoUrl,
      };

      if (currentItem) {
        await updateDoc(doc(db, 'portfolio', currentItem.id), data);
        toast.success('Proje başarıyla güncellendi!');
      } else {
        await addDoc(portfolioRef, data);
        toast.success('Proje başarıyla eklendi!');
      }

      await fetchItems();
      resetForm();
    } catch (err) {
      console.error('Save error:', err);
      toast.error(currentItem ? 'Güncelleme sırasında hata oluştu.' : 'Kaydetme sırasında hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  }, [validateForm, existingImageUrl, existingCoverUrl, existingPeekVideoUrl, existingCoverIsVideo, coverMediaKind, imageFile, coverFile, peekVideoFile, currentItem, name, description, projectUrl, portfolioRef, fetchItems, resetForm, uploadFile, safeDeleteStorage]);

  const confirmDelete = useCallback(async () => {
    const { id } = deleteDialog;
    if (!id) return;

    setIsSubmitting(true);
    try {
      await ensureAuth();
      const item = items.find(i => i.id === id);
      if (item) {
        await safeDeleteStorage(item.image);
        if (item.cover && item.cover !== item.image) {
          await safeDeleteStorage(item.cover);
        }
        if (item.peekVideo) {
          await safeDeleteStorage(item.peekVideo);
        }
      }
      await deleteDoc(doc(db, 'portfolio', id));
      toast.success('Proje başarıyla silindi!');
      await fetchItems();
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Silme sırasında hata oluştu.');
    } finally {
      setIsSubmitting(false);
      setDeleteDialog({ open: false, id: null, name: '' });
    }
  }, [deleteDialog, items, fetchItems, safeDeleteStorage]);

  // --- RENDER: FORM ---
  if (showForm) {
    const coverPreviewUrl = coverBlobUrl || existingCoverUrl;
    const showCoverAsVideo =
      coverMediaKind === 'video' || (existingCoverIsVideo && !coverFile);

    return (
      <div className="pm-form-page">
        <button className="pm-back-btn" onClick={resetForm} type="button">
          <FaArrowLeft /> Listeye Dön
        </button>

        <div className="admin-page-header">
          <div className="page-header-left">
            <span className="page-eyebrow">{currentItem ? '(Pm-Ed)' : '(Pm-Nw)'}</span>
            <h1 className="page-title">{currentItem ? 'Düzenle' : 'Yeni Proje'}</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="pm-form" noValidate>
          <div className={`pm-field ${formErrors.name ? 'has-error' : ''}`}>
            <label htmlFor="pm-name">Proje Adı *</label>
            <input
              id="pm-name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Proje adını girin"
              disabled={isSubmitting}
            />
            {formErrors.name && <span className="field-error">{formErrors.name}</span>}
          </div>

          <div className={`pm-field ${formErrors.description ? 'has-error' : ''}`}>
            <label htmlFor="pm-desc">Açıklama *</label>
            <textarea
              id="pm-desc"
              value={description}
              onChange={e => setDescription(e.target.value.slice(0, DESC_MAX_LENGTH))}
              placeholder="Proje açıklamasını girin"
              rows={4}
              disabled={isSubmitting}
            />
            <div className="field-meta">
              {formErrors.description && <span className="field-error">{formErrors.description}</span>}
              <span className="char-counter">{description.length}/{DESC_MAX_LENGTH}</span>
            </div>
          </div>

          <div className={`pm-field ${formErrors.image ? 'has-error' : ''}`}>
            <ImageUploader
              label="Ana görsel *"
              existingUrl={existingImageUrl || undefined}
              onFileSelect={file => { setImageFile(file); setFormErrors(p => ({ ...p, image: undefined })); }}
              onClear={() => { setImageFile(null); setExistingImageUrl(''); }}
            />
            {formErrors.image && <span className="field-error">{formErrors.image}</span>}
          </div>

          <div className="pm-field pm-field--cover-media">
            <label className="pm-label-with-icon" htmlFor="pm-cover-media">
              <FaImage aria-hidden /> Kapak — görsel veya video (opsiyonel)
            </label>
            <p className="pm-field-hint">
              Dışarıdaki tam alan her zaman ana görseldir. Buraya video yüklerseniz video yalnızca hover ile ortadaki &quot;peek&quot; alanında oynar; kapak görseli seçerseniz klasik davranış (dışta kapak görseli, içte ikinci görsel/peek).
              Boş bırakırsanız kapak otomatik olarak ana görselle aynı olur.
            </p>
            {coverPreviewUrl ? (
              <div className="pm-main-preview">
                {showCoverAsVideo ? (
                  <video
                    src={coverPreviewUrl}
                    controls
                    muted
                    playsInline
                    className="pm-main-preview__media"
                  />
                ) : (
                  <img src={coverPreviewUrl} alt="" className="pm-main-preview__media" />
                )}
                <button
                  type="button"
                  className="pm-peek-remove"
                  onClick={clearCoverMedia}
                  aria-label="Kapak medyasını kaldır"
                >
                  <FaTimes />
                </button>
              </div>
            ) : null}
            <input
              ref={coverMediaInputRef}
              id="pm-cover-media"
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/quicktime"
              className="pm-file-input"
              onChange={handleCoverMediaSelect}
              disabled={isSubmitting}
            />
          </div>

          <div className="pm-field pm-field--peek-video">
            <label className="pm-label-with-icon" htmlFor="pm-peek-video">
              <FaVideo aria-hidden /> Peek videosu (opsiyonel)
            </label>
            <p className="pm-field-hint">
              Portföyde hover ile görünen iç alanda oynatılır; sessiz döngü önerilir. MP4, WebM veya MOV, en fazla 80MB.
            </p>
            {(peekBlobUrl || existingPeekVideoUrl) ? (
              <div className="pm-peek-preview">
                <video
                  src={peekBlobUrl || existingPeekVideoUrl}
                  controls
                  muted
                  playsInline
                  className="pm-peek-preview__video"
                />
                <button
                  type="button"
                  className="pm-peek-remove"
                  onClick={clearPeekVideo}
                  aria-label="Peek videosunu kaldır"
                >
                  <FaTimes />
                </button>
              </div>
            ) : null}
            <input
              ref={peekVideoInputRef}
              id="pm-peek-video"
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              className="pm-file-input"
              onChange={handlePeekVideoSelect}
              disabled={isSubmitting}
            />
          </div>

          <div className={`pm-field ${formErrors.url ? 'has-error' : ''}`}>
            <label htmlFor="pm-url">Proje URL *</label>
            <input
              id="pm-url"
              type="url"
              value={projectUrl}
              onChange={e => setProjectUrl(e.target.value)}
              placeholder="https://example.com/project"
              disabled={isSubmitting}
            />
            {formErrors.url && <span className="field-error">{formErrors.url}</span>}
          </div>

          <div className="pm-form-actions">
            <button type="button" className="pm-cancel-btn" onClick={resetForm} disabled={isSubmitting}>
              İptal
            </button>
            <button type="submit" className="pm-submit-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Kaydediliyor...' : (currentItem ? 'Güncelle' : 'Kaydet')}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // --- RENDER: LIST ---
  return (
    <div className="portfolio-manager">
      <div className="admin-page-header">
        <div className="page-header-left">
          <span className="page-eyebrow">(Pm-00)</span>
          <h1 className="page-title">Portfolio</h1>
        </div>
        <button className="pm-add-btn" onClick={openNewForm}>
          <FaPlus /> Yeni Proje
        </button>
      </div>

      <div className="pm-toolbar">
        <div className="pm-search">
          <FaSearch />
          <input
            type="text"
            placeholder="Proje ara..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="pm-controls">
          <button
            onClick={() => setSortOrder(prev => prev === 'az' ? 'za' : 'az')}
            title={sortOrder === 'az' ? 'A-Z sıralama' : 'Z-A sıralama'}
          >
            {sortOrder === 'az' ? <FaSortAmountDown /> : <FaSortAmountUp />}
          </button>
          <button
            className={viewMode === 'grid' ? 'active' : ''}
            onClick={() => setViewMode('grid')}
            title="Grid görünümü"
          >
            <FaTh />
          </button>
          <button
            className={viewMode === 'list' ? 'active' : ''}
            onClick={() => setViewMode('list')}
            title="Liste görünümü"
          >
            <FaList />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="pm-loading">
          <div className="admin-spinner" />
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="pm-empty">
          <FaBriefcase className="empty-icon" />
          {items.length === 0 ? (
            <>
              <h3>Henüz proje eklenmemiş</h3>
              <p>İlk projenizi ekleyerek başlayın.</p>
              <button className="pm-add-btn" onClick={openNewForm}><FaPlus /> İlk Projeyi Ekle</button>
            </>
          ) : (
            <>
              <h3>Sonuç bulunamadı</h3>
              <p>"{searchQuery}" ile eşleşen proje yok.</p>
            </>
          )}
        </div>
      ) : (
        <div className={`pm-items ${viewMode}`}>
          {filteredItems.map(item => (
            <div key={item.id} className="pm-card">
              <div className="card-thumb">
                {item.cover || item.image ? (
                  <img
                    src={
                      item.coverIsVideo && item.image
                        ? item.image
                        : item.cover || item.image
                    }
                    alt={item.name}
                    loading="lazy"
                  />
                ) : (
                  <div className="thumb-placeholder"><FaImage /></div>
                )}
              </div>
              <div className="card-body">
                <h3 className="card-name">{item.name}</h3>
                <p className="card-desc">
                  {item.description?.substring(0, viewMode === 'grid' ? 80 : 150)}
                  {item.description?.length > (viewMode === 'grid' ? 80 : 150) ? '...' : ''}
                </p>
                {item.url && (
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="card-link">
                    <FaExternalLinkAlt /> Projeye Git
                  </a>
                )}
              </div>
              <div className="card-actions">
                <button className="action-edit" onClick={() => openEditForm(item)} title="Düzenle">
                  <FaEdit />
                  {viewMode === 'list' && <span>Düzenle</span>}
                </button>
                <button
                  className="action-delete"
                  onClick={() => setDeleteDialog({ open: true, id: item.id, name: item.name })}
                  title="Sil"
                >
                  <FaTrash />
                  {viewMode === 'list' && <span>Sil</span>}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteDialog.open}
        title="Projeyi Sil"
        message={`"${deleteDialog.name}" projesini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
        confirmLabel="Sil"
        cancelLabel="İptal"
        variant="danger"
        isLoading={isSubmitting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialog({ open: false, id: null, name: '' })}
      />
    </div>
  );
};

export default PortfolioManager;
