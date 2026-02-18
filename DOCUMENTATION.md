# React Portfolio - Proje Dokümantasyonu

## Proje Gereksinimleri
- React tabanlı portfolyo web sitesi
- Firebase Firestore veritabanı ile portfolyo öğeleri yönetimi
- Firebase Storage ile resim yükleme/silme
- Admin paneli üzerinden CRUD işlemleri
- Anonim kimlik doğrulama ile Firebase erişimi

---

## Yapılan Görevler

### Görev 1: Firebase Firestore İzin Hatası Düzeltmesi (18 Şubat 2026)

**Sorun:** `FirebaseError: Missing or insufficient permissions` hatası alınıyordu. Admin panelinde ve portfolyo sayfasında Firestore'dan veri çekilemiyordu.

**Kök Neden:**
1. Firestore okuma/yazma işlemlerinden önce `ensureAuth()` (anonim giriş) çağrılmıyordu.
2. Firebase Console'daki Firestore güvenlik kurallarının süresi dolmuş veya izinler kısıtlanmıştı.

**Yapılan Değişiklikler:**

1. **`src/components/Admin/PortfolioAdminPanel.js`**
   - `fetchPortfolioItems()` fonksiyonuna `await ensureAuth()` eklendi (Firestore okuma öncesi)
   - `handleSubmit()` fonksiyonuna `await ensureAuth()` eklendi (Firestore yazma öncesi)

2. **`src/components/Portfolio/index.js`**
   - `ensureAuth` import edildi
   - `getPortfolio()` fonksiyonuna `await ensureAuth()` eklendi (Firestore okuma öncesi)

3. **Firebase Console Firestore Kuralları** (kullanıcı tarafından yapılması gereken):
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /portfolio/{document=**} {
         allow read: if request.auth != null;
         allow write: if request.auth != null;
       }
     }
   }
   ```

**Etkilenen Dosyalar:**
- `src/components/Admin/PortfolioAdminPanel.js`
- `src/components/Portfolio/index.js`
