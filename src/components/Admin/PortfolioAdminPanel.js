import React, { useState, useEffect, useCallback } from 'react';
import { db, storage, ensureAuth } from '../../firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"; // Storage fonksiyonları import edildi
import { toast } from 'react-toastify'; // toast import edildi
import './PortfolioAdminPanel.scss';

// Yükleme ikonu için basit bir SVG (isteğe bağlı)
const Spinner = () => (
    <svg className="spinner" viewBox="0 0 50 50">
        <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
    </svg>
);

const PortfolioAdminPanel = ({ onLogout }) => {
    const [portfolioItems, setPortfolioItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false); // Form gönderme/silme işlemleri için ayrı bir yükleme durumu

    const [currentItem, setCurrentItem] = useState(null);
    const [showForm, setShowForm] = useState(false);

    // Form state
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [coverFile, setCoverFile] = useState(null);
    const [projectUrl, setProjectUrl] = useState(''); // Proje URL'si (eski `url`)

    // Var olan resim URL'lerini tutmak için (düzenleme sırasında)
    const [existingImageUrl, setExistingImageUrl] = useState('');
    const [existingCoverUrl, setExistingCoverUrl] = useState('');

    // Yeni seçilen dosyalar için önizleme URL'leri
    const [imagePreview, setImagePreview] = useState(null);
    const [coverPreview, setCoverPreview] = useState(null);

    const portfolioCollectionRef = collection(db, 'portfolio');

    const fetchPortfolioItems = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getDocs(portfolioCollectionRef);
            const items = data.docs.map((d) => ({ ...d.data(), id: d.id }));
            setPortfolioItems(items);
        } catch (err) {
            console.error("[AdminPanel] Error fetching portfolio items: ", err);
            toast.error("Portfolyo öğeleri yüklenirken bir hata oluştu!");
        }
        setIsLoading(false);
    }, [portfolioCollectionRef]);

    useEffect(() => {
        fetchPortfolioItems();
        // eslint-disable-next-line react-hooks/exhaustive-deps 
    }, []);

    const handleImageFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        } else {
            setImageFile(null);
            setImagePreview(null);
        }
    };

    const handleCoverFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCoverFile(file);
            setCoverPreview(URL.createObjectURL(file));
        } else {
            setCoverFile(null);
            setCoverPreview(null);
        }
    };

    const resetForm = () => {
        setName('');
        setDescription('');
        setImageFile(null);
        setCoverFile(null);
        setProjectUrl('');
        setExistingImageUrl('');
        setExistingCoverUrl('');
        setImagePreview(null); 
        setCoverPreview(null);
        setCurrentItem(null);
        setShowForm(false);
        const imageInput = document.getElementById('imageFileInput');
        if (imageInput) imageInput.value = null;
        const coverInput = document.getElementById('coverFileInput');
        if (coverInput) coverInput.value = null;
    };

    const handleEdit = (item) => {
        setCurrentItem(item);
        setName(item.name || '');
        setDescription(item.description || '');
        setProjectUrl(item.url || ''); // `url` alanı Firestore'da proje linki için kullanılıyordu varsayımı
        setExistingImageUrl(item.image || '');
        setExistingCoverUrl(item.cover || item.image || '');
        setImageFile(null); // Düzenlemeye başlarken yeni dosya seçilmedi
        setCoverFile(null);
        setImagePreview(null); 
        setCoverPreview(null);
        setShowForm(true);
    };

    // Dosya yükleme fonksiyonu — upload öncesi anonim auth sağlanır
    const uploadFile = async (file, pathPrefix = 'portfolio_images') => {
        if (!file) return null;
        await ensureAuth();
        const fileRef = storageRef(storage, `${pathPrefix}/${Date.now()}_${file.name}`);
        await uploadBytes(fileRef, file);
        const downloadURL = await getDownloadURL(fileRef);
        return downloadURL;
    };

    const handleDelete = async (id) => {
        if (window.confirm("Bu öğeyi silmek istediğinizden emin misiniz?")) {
            setIsSubmitting(true);
            try {
                // Storage silme işlemi için anonim auth sağla
                await ensureAuth();
                // Önce Storage'dan resimleri sil (eğer URL'leri varsa)
                const itemToDelete = portfolioItems.find(item => item.id === id);
                if (itemToDelete) {
                    if (itemToDelete.image) {
                        try {
                            const imageStorageRef = storageRef(storage, itemToDelete.image);
                            await deleteObject(imageStorageRef);
                        } catch (storageError) {
                            if (storageError.code !== 'storage/object-not-found') {
                                console.error("Error deleting image from storage: ", storageError);
                            }
                        }
                    }
                    if (itemToDelete.cover && itemToDelete.cover !== itemToDelete.image) {
                        try {
                            const coverStorageRef = storageRef(storage, itemToDelete.cover);
                            await deleteObject(coverStorageRef);
                        } catch (storageError) {
                             if (storageError.code !== 'storage/object-not-found') {
                                console.error("Error deleting cover image from storage: ", storageError);
                            }
                        }
                    }
                }

                const itemDoc = doc(db, "portfolio", id);
                await deleteDoc(itemDoc);
                toast.success("Portfolyo öğesi başarıyla silindi!");
                fetchPortfolioItems();
            } catch (err) {
                console.error("Error deleting item: ", err);
                toast.error("Öğe silinirken bir hata oluştu!");
            }
            setIsSubmitting(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !description || (!imageFile && !existingImageUrl) || !projectUrl) {
            toast.warn("Lütfen tüm zorunlu alanları doldurun (İsim, Açıklama, Ana Resim, Proje URL).");
            return;
        }
        setIsSubmitting(true);
        let imageUrl = existingImageUrl;
        let coverUrl = existingCoverUrl;

        try {
            if (imageFile) {
                // Eğer eski bir resim varsa ve yeni resim yükleniyorsa, eski resmi Storage'dan sil
                if (currentItem && currentItem.image && currentItem.image !== existingCoverUrl) { // Cover ile aynı değilse sil
                    try {
                        const oldImageRef = storageRef(storage, currentItem.image);
                        await deleteObject(oldImageRef);
                    } catch (delError) { if(delError.code !== 'storage/object-not-found') console.error("Error deleting old image: ", delError);}
                }
                imageUrl = await uploadFile(imageFile, 'portfolio_images');
            }
            if (coverFile) {
                 // Eğer eski bir kapak resmi varsa ve yeni kapak yükleniyorsa, eski kapağı Storage'dan sil
                if (currentItem && currentItem.cover && currentItem.cover !== existingImageUrl) { // Ana resimle aynı değilse sil
                     try {
                        const oldCoverRef = storageRef(storage, currentItem.cover);
                        await deleteObject(oldCoverRef);
                    } catch (delError) { if(delError.code !== 'storage/object-not-found') console.error("Error deleting old cover: ", delError);}
                }
                coverUrl = await uploadFile(coverFile, 'portfolio_covers');
            }

            const finalImageUrl = imageUrl;
            const finalCoverUrl = coverUrl || finalImageUrl; // Kapak yoksa ana resmi kullan

            const newItemData = {
                name,
                description,
                image: finalImageUrl,
                cover: finalCoverUrl,
                url: projectUrl,
            };

            if (currentItem) {
                const itemDoc = doc(db, "portfolio", currentItem.id);
                await updateDoc(itemDoc, newItemData);
                toast.success("Portfolyo öğesi başarıyla güncellendi!");
            } else {
                await addDoc(portfolioCollectionRef, newItemData);
                toast.success("Portfolyo öğesi başarıyla eklendi!");
            }
            fetchPortfolioItems();
            resetForm();
        } catch (err) {
            console.error("Error saving item: ", err);
            toast.error(currentItem ? "Öğe güncellenirken bir hata oluştu!" : "Öğe kaydedilirken bir hata oluştu!");
        }
        setIsSubmitting(false);
    };

    if (isLoading && !showForm && portfolioItems.length === 0) { // Sadece ilk yüklemede ve form kapalıyken göster
        return <div className="full-page-loader"><Spinner /> <p>Portfolyo öğeleri yükleniyor...</p></div>;
    }

    return (
        <div className="admin-panel-container">
            <div className="panel-header">
                <h1>Portfolyo Yönetim Paneli</h1>
                <button onClick={onLogout} className="logout-button">Çıkış Yap</button>
            </div>

            <button onClick={() => { resetForm(); setShowForm(true); }} className="add-new-button">
                <span className="plus-icon">+</span> Yeni Portfolyo Öğesi Ekle
            </button>

            {showForm && (
                <div className="form-modal">
                    <form onSubmit={handleSubmit} className="portfolio-form">
                        <h3>{currentItem ? 'Öğeyi Düzenle' : 'Yeni Öğe Ekle'}</h3>
                        <div className="form-group">
                            <label htmlFor="itemName">İsim:</label>
                            <input id="itemName" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="itemDesc">Açıklama:</label>
                            <textarea id="itemDesc" value={description} onChange={(e) => setDescription(e.target.value)} required />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="imageFileInput">Ana Resim (Değiştirmek istemiyorsanız boş bırakın):</label>
                            <input id="imageFileInput" type="file" onChange={handleImageFileChange} accept="image/*" />
                            {imagePreview && <div className="image-preview-container">Yeni Seçilen: <img src={imagePreview} alt="Yeni ana resim önizlemesi" className="form-image-preview"/></div>}
                            {!imagePreview && existingImageUrl && <div className="image-preview-container">Mevcut: <img src={existingImageUrl} alt="Mevcut ana resim" className="form-image-preview"/></div>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="coverFileInput">Kapak Resmi (Farklı bir kapak istemiyorsanız veya değiştirmek istemiyorsanız boş bırakın):</label>
                            <input id="coverFileInput" type="file" onChange={handleCoverFileChange} accept="image/*" />
                            {coverPreview && <div className="image-preview-container">Yeni Seçilen: <img src={coverPreview} alt="Yeni kapak resmi önizlemesi" className="form-image-preview"/></div>}
                            {!coverPreview && existingCoverUrl && existingCoverUrl !== existingImageUrl && <div className="image-preview-container">Mevcut: <img src={existingCoverUrl} alt="Mevcut kapak resmi" className="form-image-preview"/></div>}
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="itemUrl">Proje URL:</label>
                            <input id="itemUrl" type="url" value={projectUrl} onChange={(e) => setProjectUrl(e.target.value)} placeholder="https://example.com/project" required />
                        </div>
                        
                        <div className="form-actions">
                            <button type="submit" disabled={isSubmitting} className="save-button">
                                {isSubmitting ? <Spinner /> : (currentItem ? 'Güncelle' : 'Kaydet')}
                            </button>
                            <button type="button" onClick={resetForm} disabled={isSubmitting} className="cancel-button">
                                İptal
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {isLoading && portfolioItems.length > 0 && <div className="subtle-loader">Liste güncelleniyor... <Spinner /></div>}

            <div className="items-list">
                <h2>Mevcut Öğeler</h2>
                {portfolioItems.length === 0 && !isLoading && <p>Gösterilecek portfolyo öğesi bulunmamaktadır.</p>}
                <ul>
                    {portfolioItems.map((item) => (
                        <li key={item.id} className="portfolio-item-admin">
                            <div className="item-info">
                                <img src={item.cover || item.image} alt={item.name} className="item-thumbnail" />
                                <div>
                                    <h4>{item.name}</h4>
                                    <p className="desc-preview">{item.description?.substring(0, 100)}{item.description?.length > 100 ? '...' : ''}</p>
                                    {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer" className="project-link">Projeye Git</a>}
                                </div>
                            </div>
                            <div className="item-actions">
                                <button onClick={() => handleEdit(item)} className="edit-button" disabled={isSubmitting}>Düzenle</button>
                                <button onClick={() => handleDelete(item.id)} disabled={isSubmitting} className="delete-button">
                                    {isSubmitting && currentItem?.id !== item.id ? <Spinner/> : 'Sil'}
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default PortfolioAdminPanel; 