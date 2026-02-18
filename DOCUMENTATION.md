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

---

### Görev 2: Firebase Storage İzin Hatası Düzeltmesi (18 Şubat 2026)

**Sorun:** `FirebaseError: Firebase Storage: User does not have permission to access` (storage/unauthorized - 403) hatası. Admin panelinden resim yüklenemiyor.

**Kök Neden:**
Firebase Console'daki Storage güvenlik kurallarının süresi dolmuş veya izinler kısıtlanmıştı. Kod tarafında `ensureAuth()` zaten doğru şekilde çağrılıyordu.

**Çözüm — Firebase Console Storage Kuralları** (kullanıcı tarafından yapılması gereken):
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /portfolio_images/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null
                   && request.resource.size < 10 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
    }
    match /portfolio_covers/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null
                   && request.resource.size < 10 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
    }
  }
}
```

**Kural Açıklamaları:**
- `allow read: if true` — Herkes resimleri görebilir (portfolyo sayfası için gerekli)
- `allow write: if request.auth != null` — Sadece giriş yapmış kullanıcılar yükleyebilir
- `request.resource.size < 10 * 1024 * 1024` — Maksimum 10MB dosya boyutu
- `request.resource.contentType.matches('image/.*')` — Sadece resim dosyaları kabul edilir

---

### Görev 3: Firebase Auth Hata Ayıklama Logları (18 Şubat 2026)

**Sorun:** Firestore izin hatası devam ediyordu. Anonim auth'un çalışıp çalışmadığı belirsizdi.

**Yapılan Değişiklikler:**
- `src/firebase.js` — `ensureAuth()` fonksiyonuna detaylı console.log/error mesajları eklendi
- Auth başarılı olduğunda UID loglanıyor
- Auth başarısız olduğunda hata kodu ve mesajı loglanıyor

**Kontrol Listesi (Firebase Console):**
1. **Authentication > Sign-in method** — "Anonymous" sağlayıcısının **Enabled** olduğunu doğrulayın
2. **Firestore Database > Rules** — Kuralların güncellendiğini doğrulayın
3. **Storage > Rules** — Kuralların güncellendiğini doğrulayın
