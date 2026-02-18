import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { db, storage, ensureAuth } from '../../firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { toast } from 'react-toastify';
import {
  FaPlus, FaSearch, FaSortAmountDown, FaSortAmountUp,
  FaTh, FaList, FaEdit, FaTrash, FaExternalLinkAlt,
  FaArrowLeft, FaImage, FaBriefcase,
} from 'react-icons/fa';
import ImageUploader from './ImageUploader';
import ConfirmDialog from './ConfirmDialog';
import './PortfolioManager.scss';

const DESC_MAX_LENGTH = 500;

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
  const [formErrors, setFormErrors] = useState({});

  // Delete dialog
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, name: '' });

  const portfolioRef = useMemo(() => collection(db, 'portfolio'), []);

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
    setCurrentItem(null);
    setShowForm(false);
    setFormErrors({});
  }, []);

  const openNewForm = useCallback(() => {
    resetForm();
    setShowForm(true);
  }, [resetForm]);

  const openEditForm = useCallback((item) => {
    resetForm();
    setCurrentItem(item);
    setName(item.name || '');
    setDescription(item.description || '');
    setProjectUrl(item.url || '');
    setExistingImageUrl(item.image || '');
    setExistingCoverUrl(item.cover || '');
    setShowForm(true);
  }, [resetForm]);

  const validateForm = useCallback(() => {
    const errs = {};
    if (!name.trim()) errs.name = 'Proje adı zorunludur.';
    if (!description.trim()) errs.description = 'Açıklama zorunludur.';
    if (!imageFile && !existingImageUrl) errs.image = 'Ana resim zorunludur.';
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
        if (currentItem?.image && currentItem.image !== existingCoverUrl) {
          await safeDeleteStorage(currentItem.image);
        }
        imageUrl = await uploadFile(imageFile, 'portfolio_images');
      }

      if (coverFile) {
        if (currentItem?.cover && currentItem.cover !== existingImageUrl) {
          await safeDeleteStorage(currentItem.cover);
        }
        coverUrl = await uploadFile(coverFile, 'portfolio_covers');
      }

      const data = {
        name: name.trim(),
        description: description.trim(),
        image: imageUrl,
        cover: coverUrl || imageUrl,
        url: projectUrl.trim(),
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
  }, [validateForm, existingImageUrl, existingCoverUrl, imageFile, coverFile, currentItem, name, description, projectUrl, portfolioRef, fetchItems, resetForm, uploadFile, safeDeleteStorage]);

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

  // --- RENDER ---

  if (showForm) {
    return (
      <div className="pm-form-page">
        <button className="pm-back-btn" onClick={resetForm} type="button">
          <FaArrowLeft /> Listeye Dön
        </button>
        <h2 className="pm-form-title">{currentItem ? 'Projeyi Düzenle' : 'Yeni Proje Ekle'}</h2>

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
              label="Ana Resim *"
              existingUrl={existingImageUrl || undefined}
              onFileSelect={file => { setImageFile(file); setFormErrors(p => ({ ...p, image: undefined })); }}
              onClear={() => { setImageFile(null); setExistingImageUrl(''); }}
            />
            {formErrors.image && <span className="field-error">{formErrors.image}</span>}
          </div>

          <div className="pm-field">
            <ImageUploader
              label="Kapak Resmi (Opsiyonel)"
              existingUrl={existingCoverUrl || undefined}
              onFileSelect={file => setCoverFile(file)}
              onClear={() => { setCoverFile(null); setExistingCoverUrl(''); }}
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

  return (
    <div className="portfolio-manager">
      <div className="pm-header">
        <div>
          <h1>Portfolyo Yönetimi</h1>
          <p className="pm-subtitle">{items.length} proje</p>
        </div>
        <button className="pm-add-btn" onClick={openNewForm}>
          <FaPlus /> Yeni Proje
        </button>
      </div>

      <div className="pm-toolbar">
        <div className="pm-search">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Proje ara..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="pm-controls">
          <button
            className="pm-sort-btn"
            onClick={() => setSortOrder(prev => prev === 'az' ? 'za' : 'az')}
            title={sortOrder === 'az' ? 'A-Z sıralama' : 'Z-A sıralama'}
          >
            {sortOrder === 'az' ? <FaSortAmountDown /> : <FaSortAmountUp />}
          </button>
          <div className="pm-view-toggle">
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
      </div>

      {isLoading ? (
        <div className="pm-loading">
          <div className="loading-spinner" />
          <p>Yükleniyor...</p>
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
                  <img src={item.cover || item.image} alt={item.name} loading="lazy" />
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
