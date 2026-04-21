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

---

### Görev 4: Firebase Kurallarının CLI ile Deploy Edilmesi (18 Şubat 2026)

**Sorun:** Kullanıcı Firebase Console'dan kuralları güncelleyemediği için Storage izin hatası devam ediyordu.

**Yapılan Değişiklikler:**
1. **`.firebaserc`** oluşturuldu — Varsayılan proje `portfolio-b0e27` olarak ayarlandı
2. **`firebase.json`** oluşturuldu — Firestore ve Storage kural dosyaları tanımlandı
3. **`firestore.rules`** oluşturuldu — Anonim auth kullanıcılarına `portfolio` koleksiyonu için okuma/yazma izni
4. **`storage.rules`** oluşturuldu — Anonim auth kullanıcılarına `portfolio_images/` ve `portfolio_covers/` için yazma izni, herkese okuma izni
5. `firebase deploy --only firestore:rules,storage` komutu ile kurallar başarıyla deploy edildi

**Deploy Edilen Kurallar:**
- Firestore: `request.auth != null` koşulu ile okuma/yazma
- Storage: Herkes okuyabilir (`if true`), yazma için `request.auth != null` gerekli

---

### Görev 5: Admin Paneli Tam Yeniden Tasarım (18 Şubat 2026)

**Amaç:** Admin panelini modern bir dashboard yapısıyla tamamen yeniden tasarlamak: sidebar navigasyon, dashboard istatistikleri, gelişmiş portfolyo yönetimi ve genişleyebilir mimari.

**Oluşturulan Yeni Dosyalar:**

1. **`src/components/Admin/AdminLayout.js`** + **`AdminLayout.scss`**
   - Sidebar navigasyonlu ana kabuk bileşeni
   - React Router `<Outlet />` ile nested routing
   - Desktop'ta daraltılabilir sidebar, mobilde hamburger menü
   - Dashboard ve Portfolyo navigasyon linkleri
   - Çıkış butonu

2. **`src/components/Admin/Dashboard.js`** + **`Dashboard.scss`**
   - Toplam proje sayısı ve özel kapak resmi sayısı istatistik kartları
   - Son eklenen projelerin listesi
   - Hızlı işlem butonları (Yeni Proje Ekle, Projeleri Yönet)
   - Boş durum mesajı

3. **`src/components/Admin/PortfolioManager.js`** + **`PortfolioManager.scss`**
   - Gelişmiş liste görünümü: Grid ve Liste modları
   - Arama çubuğu ile anlık filtreleme
   - A-Z / Z-A sıralama
   - Sayfa içi form (modal yerine): daha geniş çalışma alanı
   - Drag & drop resim yükleme (ImageUploader bileşeni)
   - Karakter sayacı (açıklama alanı)
   - Inline form doğrulama hata mesajları
   - Özel silme onay dialogu (ConfirmDialog bileşeni)

4. **`src/components/Admin/ConfirmDialog.js`** + **`ConfirmDialog.scss`**
   - `window.confirm` yerine modern modal dialog
   - Danger ve Warning varyantları
   - Escape tuşu ile kapatma, loading durumu
   - Animasyonlu giriş efekti

5. **`src/components/Admin/ImageUploader.js`** + **`ImageUploader.scss`**
   - Native HTML5 Drag & Drop API ile dosya sürükle-bırak
   - Tıklayarak dosya seçme
   - Resim önizleme ve değiştirme/silme
   - İstemci tarafı doğrulama (10MB limit, sadece resim formatları)
   - Mevcut resmi gösterme

**Güncellenen Dosyalar:**

- **`src/App.js`** — Admin route'ları nested route yapısına çevrildi. AdminLayout, Dashboard ve PortfolioManager lazy-loaded.
- **`src/components/Admin/Login.js`** — Şifre göster/gizle butonu, boş şifre kontrolü, yeni tasarım.
- **`src/components/Admin/Login.scss`** — Yeniden tasarlandı (Google-benzeri minimal stil).

**Silinen Dosyalar:**
- `src/components/Admin/PortfolioAdminPanel.js` (yerine PortfolioManager.js)
- `src/components/Admin/PortfolioAdminPanel.scss` (yerine PortfolioManager.scss)
- `src/components/Admin/.gitkeep`

**Admin Dosya Yapısı:**
```
src/components/Admin/
  AdminLayout.js / .scss     — Sidebar + content wrapper
  Dashboard.js / .scss       — İstatistik sayfası
  PortfolioManager.js / .scss — Portfolyo CRUD yönetimi
  ConfirmDialog.js / .scss   — Özel onay dialogu
  ImageUploader.js / .scss   — Drag & drop resim yükleme
  Login.js / .scss           — Giriş sayfası
```

**Mimari Notlar:**
- Genişleyebilir yapı: İleride About, Contact gibi bölümler `AdminLayout` altında yeni Route ve sidebar linki olarak eklenebilir
- Tüm Firebase işlemleri öncesinde `ensureAuth()` çağrılıyor
- Mevcut renk paleti (`_variables.scss`) korundu

---

### Görev 6: Çıkış Yönlendirmesi ve Portfolyo Scroll-Reveal Tasarımı (18 Şubat 2026)

**Sorunlar:**
1. Admin panelinden çıkış yapınca anasayfaya dönülmüyordu.
2. Portfolyo bölümünün tasarımı basit bir grid'di, daha etkileyici bir görünüm isteniyordu.

**Yapılan Değişiklikler:**

#### 1. Çıkış → Anasayfa Yönlendirmesi
- **`src/App.js`** — `handleLogout` fonksiyonuna `window.location.href = '/'` eklendi. Çıkış yapıldığında tam sayfa yenilemesiyle anasayfaya dönülür.

#### 2. Portfolyo Scroll-Reveal Galeri Tasarımı
- **`src/components/Portfolio/index.js`** — Tamamen yeniden yazıldı:
  - 3 sütunlu grid yerine **scroll-reveal galeri** yapısı
  - Her proje kendi "sahnesinde" — büyük görsel + metin zigzag düzeninde
  - `ProjectScene` bileşeni ile modüler yapı
  - Framer Motion `whileInView` ile scroll tetiklemeli animasyonlar:
    - Görseller: `scale(0.85→1)`, `opacity(0→1)`, `y(60→0)`
    - Metinler: staggered `translateY` ile sıralı giriş
  - Proje numarası (`01`, `02`...) ile görsel hiyerarşi
  - İç scroll alanı (`.portfolio-scroll-area`) ile ana sayfa scroll-snap'ten bağımsız çalışma
  - Akıllı wheel handler: İç içerik scroll edilebilirken parent snap engellenir, sınırlara ulaşınca parent'a bırakılır

- **`src/components/Portfolio/index.scss`** — Tamamen yeniden yazıldı:
  - Zigzag layout: Tek sayılı projeler görsel solda/metin sağda, çift sayılılar tersi
  - Büyük görseller (`16:10` aspect ratio, yuvarlak köşeler, gölge)
  - Hover efekti: Görsel hafif zoom (`scale(1.04)`), gölge derinleşir
  - CTA butonu: Alt çizgi + ok animasyonu
  - Skeleton loading: Yeni layout'a uygun tam genişlik iskelet
  - Responsive: Tablet'te daraltılmış, mobilde dikey yığılma
  - Reduced motion desteği
  - Özel scrollbar stillemesi

**Etkilenen Dosyalar:**
- `src/App.js` (handleLogout)
- `src/components/Portfolio/index.js` (tamamen yeniden)
- `src/components/Portfolio/index.scss` (tamamen yeniden)

---

### Görev 7: Contact Bölümü Gradient Dalga Efekti (18 Şubat 2026)

**Amaç:** Contact bölümünün en altında, scroll hızına fiziksel tepki veren canlı bir sıvı/dalga efekti oluşturmak. Canvas tabanlı gradient dalga animasyonu.

**Konsept:**
- **Durgun:** Çok hafif, neredeyse fark edilmeyen nazik dalgalanma (idle animation)
- **Yavaş scroll:** Hafif dalgalanma başlar, amplitüd artar
- **Hızlı scroll:** Belirgin yüksek dalgalar, frekans artar, "sert su" hissi
- **Scroll durduğunda:** Dalgalar yavaşça söner, tekrar sakin yüzeye döner (damping/friction)

**Oluşturulan Yeni Dosyalar:**

1. **`src/components/Contact/LiquidWave.js`**
   - HTML5 Canvas API ile 3 katmanlı sine dalga sistemi (ön, orta, arka)
   - `requestAnimationFrame` döngüsü ile 60fps animasyon
   - Dalga renkleri: `rgba(232,234,237,0.5)` (açık), `rgba(95,99,104,0.35)` (orta), `rgba(32,33,36,0.55)` (koyu)
   - Scroll hızı takibi: Ana `.scroll-container`'ı dinleyerek velocity hesaplaması
   - Fizik simülasyonu: `currentAmplitude` → `targetAmplitude` lerp/damping ile yakınsama
   - `ResizeObserver` ile parent genişliğine uyum
   - `devicePixelRatio` ile retina desteği (max 2x)

2. **`src/components/Contact/LiquidWave.scss`**
   - `.liquid-wave-container`: `position: absolute; bottom: 0` ile sayfanın en altına konumlanma
   - `pointer-events: none` ile altındaki içerikle etkileşimi engellememe
   - Responsive yükseklik: 120px (desktop) → 80px (tablet) → 60px (mobil)

**Güncellenen Dosyalar:**

- **`src/components/Contact/index.js`** — `LiquidWave` bileşeni import edilip `.contact-page` div'inin en altına eklendi
- **`src/components/Contact/index.scss`** — `padding-bottom: 140px` eklendi (dalga için yer açmak), `overflow: hidden` eklendi (dalga taşmasın), responsive media query'lerde padding-bottom ayarları

**Teknik Detaylar:**
- Dalga parametreleri: Her katmanın farklı frekans (`freq`, `freq2`), hız (`speed`, `speed2`), temel amplitüd (`baseAmp`), ve scroll tepki çarpanı (`scrollBoost`) var
- Damping faktörü: 0.92 — scroll durduğunda amplitude doğal şekilde söner
- Lerp hızı: 0.08 — yumuşak geçiş için
- Velocity ölçekleme: 0.15, max amplitude: 1.0

---

### Görev 8: Scroll Sorunu Kapsamlı Debug Analizi (2 Nisan 2026)

**Sorun:** Sayfa scroll'u beklenen şekilde çalışmıyor — takılıyor, kilitlenmiş gibi davranıyor veya tamamen gizlenmiş durumda.

**Kapsam:** 4 ana başlıkta kod tabanı tarandı:
1. Global CSS ve Layout Hataları
2. JavaScript/Event Müdahaleleri
3. Modal/Menü Scroll Kilidi Yan Etkileri
4. Bileşen Taşkınları (Overflow)

---

#### Bulgu 1: `html` + `body` Elementlerinde Scroll Kilidi (KRİTİK)

**Dosya:** `src/App.scss` — Satırlar 59-94

`html` ve `body` elementlerinde **aynı anda** aşağıdaki kurallar mevcut:
```css
html {
  height: 100%;
  overflow: hidden;       ← Doğal scroll'u tamamen devre dışı bırakıyor
}
body {
  overflow: hidden;        ← Tekrar scroll kilidi
  position: fixed;         ← Body'yi viewport'a sabitliyor
  height: 100%;
  width: 100%;
  top: 0;
  left: 0;
}
```

**Neden kırıcı:** `position: fixed` + `overflow: hidden` kombinasyonu body'nin herhangi bir scroll hareketini imkansız kılıyor. Tüm sayfa içeriği viewport boyutuna kilitleniyor. Tasarım amacı "custom scroll container" yapısı kurmak ancak bu yaklaşım içerik taştığında erişilemez hâle getiriyor.

**Çözüm:**
```css
html {
  scroll-behavior: smooth;
  height: auto;
  overflow: auto;        ← auto yap
}
body {
  overflow: auto;        ← auto yap
  overflow-x: hidden;    ← yatay scroll engeli kalsın
  height: auto;          ← auto yap
  position: static;      ← static yap
  width: 100%;
}
```

---

#### Bulgu 2: Custom Scroll Container Scroll-Snap Takılma (KRİTİK)

**Dosya:** `src/App.scss` — Satırlar 96-134

Bütün uygulama `.one-page-app > .scroll-container` yapısında:
```css
.one-page-app {
  height: 100vh;
  overflow: hidden;       ← Taşan içeriği gizliyor
}
.scroll-container {
  height: 100vh;
  overflow-y: auto;
  scroll-snap-type: y mandatory;  ← Her section'a "yapışıyor"
}
```

`scroll-snap-type: y mandatory` özellikle:
- Uzun içerikli bölümlerde (Portfolio) içerik tam okunamadan snap atlıyor
- Mobilde "yaklaş" (proximity) yerine "zorunlu" (mandatory) snap agresif davranıyor
- `overflow: hidden` ile dışarı taşan içerik erişilemez oluyor

**Çözüm:**
```css
.one-page-app {
  min-height: 100vh;
  overflow: visible;     ← visible yap
}
.scroll-container {
  min-height: 100vh;
  scroll-snap-type: y proximity;  ← mandatory → proximity (daha yumuşak)
  /* veya tamamen kaldır: scroll-snap-type: none */
}
```

---

#### Bulgu 3: Modal Scroll Kilidi Çelişkisi (ORTA)

**Dosya:** `src/components/Admin/ConfirmDialog.js` — Satırlar 22-31

```javascript
useEffect(() => {
  if (isOpen) {
    document.body.style.overflow = 'hidden';  ← Zaten CSS'te hidden, tekrar set
  }
  return () => {
    document.body.style.overflow = '';         ← Inline temizleniyor ama CSS'te hâlâ hidden
  };
}, [isOpen, handleKeyDown]);
```

**Sorun:** `App.scss` body'ye zaten `overflow: hidden` veriyor. Modal inline `overflow: hidden` ekliyor, cleanup'ta inline stil'i siliyor ama App.scss kuralı geçerli kalıyor. Gerçek bir değişiklik yok ama kod kafa karıştırıcı ve bakım zorluğu yaratıyor.

**Çözüm:** Body CSS'i `overflow: auto` yapıldıktan sonra bu bileşen modal açıldığında `hidden`, kapandığında `auto` set etmeli:
```javascript
useEffect(() => {
  if (isOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = 'auto';
  }
  return () => {
    document.body.style.overflow = 'auto';
  };
}, [isOpen, handleKeyDown]);
```

---

#### Bulgu 4: `.page-section` Overflow Çakışması (ORTA)

**Dosya:** `src/App.scss` — Satırlar 148, 155, 250

```css
.page-section {
  overflow: hidden;           ← Varsayılan: gizle
  &#portfolio {
    overflow: visible;        ← Portfolio: göster
  }
}
@media (max-width: 768px) {
  .page-section#portfolio {
    overflow: hidden;         ← Mobilde tekrar gizle ← Çelişki!
  }
}
```

**Sorun:** Portfolio bölümü desktop'ta `visible` ama mobilde `hidden`. Uzun portfolio içerikleri mobilde kırpılabilir.

---

#### Bulgu 5: Etkileşim Yok — `e.preventDefault()` Form Submit dışında scroll'u engellmiyor

**Taranan Dosyalar:**
- `src/components/Contact/index.js:83` — form submit (ilgili değil)
- `src/components/Admin/ImageUploader.js:37,45,51` — drag-drop (ilgili değil)
- `src/components/Admin/PortfolioManager.js:149` — form submit (ilgili değil)
- `src/components/Admin/Login.js:12` — form submit (ilgili değil)
- `src/components/Admin/PortfolioAdminPanel.js:166` — form submit (ilgili değil)

Hiçbiri `wheel`, `scroll` veya `touchmove` event'lerini engellemiyor. **Bu kategori temiz.**

---

#### Bulgu 6: `100vw` Yatay Scroll Sorunu Yok

Proje genelinde `width: 100vw` kullanılmamış. **Bu kategori temiz.**

---

#### Öncelikli Düzeltme Sırası

| # | Öncelik | Dosya | Değişiklik |
|---|---------|-------|------------|
| 1 | 🔴 Kritik | `src/App.scss:59-67` | `html` → `overflow: auto; height: auto` |
| 2 | 🔴 Kritik | `src/App.scss:69-94` | `body` → `overflow: auto; position: static; height: auto` |
| 3 | 🔴 Kritik | `src/App.scss:96-104` | `.one-page-app` → `overflow: visible; min-height: 100vh` |
| 4 | 🟡 Orta | `src/App.scss:107-114` | `.scroll-container` → `scroll-snap-type: y proximity` |
| 5 | 🟡 Orta | `src/App.scss:246-251` | `.page-section#portfolio` mobil → `overflow: visible` |
| 6 | 🟡 Orta | `src/components/Admin/ConfirmDialog.js:22-31` | `overflow: auto` cleanup |

---

#### Not: Mevcut Mimari Anlayışı

Bu proje bir "tek sayfa scroll-snap" mimarisi kullanıyor. Tüm bölümler (home, about, portfolio, contact) `.scroll-container` içinde ve her biri viewport yüksekliğinde. Amaç sayfa scroll'u yerine container scroll kullanmak. Ancak `position: fixed` + `overflow: hidden` kombinasyonu bu yapının da dışına taşan her şeyi erişilemez kılıyor. Düzeltme sonrası scroll hem doğal hem de snap-tabanlı olarak çalışmalı.

---

#### ✅ Yapılan Düzeltmeler (2 Nisan 2026 — Uygulandı)

**1. `src/App.scss` — Global html/body scroll kilidi kaldırıldı:**

| Özellik | Önceki | Sonraki | Neden |
|---------|--------|---------|-------|
| `html` height | `100%` | `auto` | Sabit yükseklik yerine dinamik |
| `html` overflow | `hidden` | `auto` | Doğal scroll'a izin ver |
| `body` overflow | `hidden` | `auto` | Scroll kilidi kaldırıldı |
| `body` position | `fixed` | `static` | Body artık viewport'a sabit değil |
| `body` height | `100%` | `auto` | İçerik yüksekliğine uyum |
| `body #root` height | `100%` | `auto` | Container da dinamik |

**2. `src/App.scss` — `.one-page-app` ve `.scroll-container` güncellendi:**

| Özellik | Önceki | Sonraki | Neden |
|---------|--------|---------|-------|
| `.one-page-app` height | `100vh/100dvh` | `min-height: 100vh/100dvh` | İçerik taşabilir olmalı |
| `.one-page-app` overflow | `hidden` | `visible` | Taşan içerik erişilebilir |
| `.scroll-container` height | `100vh/100dvh` | `min-height: 100vh/100dvh` | Dinamik yükseklik |
| `.scroll-container` scroll-snap-type | `y mandatory` | `y proximity` | Daha yumuşak snap, takılma yok |

**3. `src/App.scss` — Mobil portfolio overflow düzeltildi:**

| Özellik | Önceki | Sonraki | Neden |
|---------|--------|---------|-------|
| `.page-section#portfolio` height (mobil) | `100vh/100dvh` | `auto` + `min-height: 100dvh` | Uzun içerik kırpılmıyor |
| `.page-section#portfolio` overflow (mobil) | `hidden` | `visible` | Taşan içerik erişilebilir |

**4. `src/components/Admin/ConfirmDialog.js` — Modal scroll kilidi düzeltildi:**

| Özellik | Önceki | Sonraki | Neden |
|---------|--------|---------|-------|
| `else` bloğu | yok | `document.body.style.overflow = 'auto'` | Modal kapalıyken scroll açık |
| cleanup return | `overflow = ''` | `overflow = 'auto'` | Explicit olarak scroll aç |

---

### Görev 9: Portfolio Scroll Takılması ve LiquidWave Dalgalanma Düzeltmesi (2 Nisan 2026)

**Sorun 1:** `scroll-snap-type: y proximity` portfolio bölümünün uzun içeriğiyle çakışıyor, scroll takılıyordu.

**Çözüm:**
- `.scroll-container` → `scroll-snap-type: none` (tamamen kaldırıldı)
- `.page-section#portfolio` → `scroll-snap-align: none` (portfolio section snap noktası iptal)

**Sorun 2:** `.one-page-app` `min-height` + `overflow: visible` yapısı `.scroll-container`'ın içinde scroll yapmasını engelliyor, LiquidWave scroll velocity'si hep 0 kalıyordu.

**Çözüm:**
- `.one-page-app` → `height: 100vh` + `overflow: hidden` (container'ı viewport'a sabit tut, scroll container çalışsın)
- `.scroll-container` → `flex: 1 0 0` (kalan alanı kapla, kendi içinde scroll yap)

**Neden bu yapı çalışıyor:**
1. `.one-page-app` sabit yükseklikte (`height: 100vh`) → overflow taşanları gizliyor
2. `.scroll-container` flex ile kalan alanı kaplıyor → `flex: 1 0 0` → kendi içinde scroll yapılabiliyor
3. Scroll event'leri `.scroll-container` üzerinde tetikleniyor → LiquidWave `onScroll` handler'ı çalışıyor
4. `body` artık `position: static` → doğal scroll akışı bozulmuyor (gerekirse)

**Dosyalar:**
- `src/App.scss` — 3 değişiklik (scroll-snap none, flex düzeltme, portfolio snap-align none)

---

#### 📊 Sonuç

Tüm 6 tespit edilen sorun düzeltildi. Scroll artık hem doğal hem de snap-tabanlı (proximity) olarak çalışmalı. Mobilde uzun portfolio içerikleri artık kırpılmıyor. Admin modal'ı açılıp kapandığında scroll doğru şekilde geri geliyor.

---

### Görev 10: Portfolio “Premium Proje Vitrini” Izgara Tasarımı (4 Nisan 2026)

**İstek:** Work / portfolio bölümü, verilen HTML örneğindeki gibi tam ekran ızgara kartlar, hover’da merkez “peek” görseli, yan etiketler ve tıklanınca blur’lu detay katmanı ile güncellensin; renkler mevcut portföy koyu temasıyla (#0d0d0d, #f0ede8) uyumlu olsun.

**Yapılanlar:**

1. **`src/components/Portfolio/index.js`**
   - Liste satırı + imleç önizlemesi kaldırıldı; Firebase’den gelen projeler `premium-grid` içinde kart olarak gösteriliyor.
   - Arka plan görseli: `cover || image`; hover iç görsel: `image` kapaktan farklıysa `image`, aksi halde tek görsel kullanımı.
   - Sol etiket: ilk `tags` değeri (veya proje adından üretilmiş kısa etiket); sağ: `( PEEK )`.
   - Detay: başlık, açıklama, kapatma (sonradan Görev 12’de ikon + backdrop + Escape); isteğe bağlı `url` için “Projeyi aç” linki.
   - Giriş animasyonu: `framer-motion` ile hafif gecikmeli fade/slide.

2. **`src/components/Portfolio/index.scss`**
   - Tailwind yerine SCSS ile özgün sınıflar: ızgara çizgileri, `ease-premium`, metin reveal, `is-open` durumları, mobil/tablet kırılımları, `prefers-reduced-motion` desteği.
   - Rozetler krem zemin (`#f0ede8`) + koyu metin (`#0d0d0d`); overlay sıcak koyu ton + blur.

3. **`public/index.html`** *(Görev 11’de portföy fontları kaldırıldı; site geneli Coolvetica + Helvetica ile devam ediyor.)*

4. **`src/components/Admin/AdminLayout.js`**
   - Kullanılmayan `useEffect` / `Suspense` importları kaldırıldı (CI’da eslint uyarısı build’i kırıyordu).

**Etkilenen dosyalar:** `src/components/Portfolio/index.js`, `src/components/Portfolio/index.scss`, `public/index.html`, `src/components/Admin/AdminLayout.js`

---

### Görev 11: Portfolio Başlık ve Tema — Ana Siteyle Hizalama (4 Nisan 2026)

**Sorun:** Work bölümü koyu tam sayfa arka plan, aşırı büyük başlık ve Manrope / Space Mono ile Contact / About bölümlerinden görsel olarak kopuktu.

**Yapılanlar:**

- `src/components/Portfolio/index.scss`: `src/_variables.scss` içindeki global palet kullanıldı — sayfa arka planı şeffaf (`.page-section` beyazı), başlık Contact’taki gibi ortalanmış Coolvetica, `clamp(2rem, 5vw, 48px)`, uppercase, `letter-spacing: 2px`; eyebrow Courier + `$secondary-text-color`.
- Izgara çizgileri ve kart kromu `$primary-color` türevleri; rozetler beyaz zemin + `$btn-border-color` kenarlık (site butonlarıyla uyumlu).
- Detay katmanı ve tipografi site gövdesi (`Helvetica Neue`, Courier) ile uyumlu; krem tonlu eski portföy paleti kaldırıldı.
- `public/index.html`: yalnızca portföy için eklenen Google Fonts linkleri kaldırıldı.

**Etkilenen dosyalar:** `src/components/Portfolio/index.scss`, `public/index.html`, `DOCUMENTATION.md`

---

### Görev 12: Portfolio Detay Kapatma — Daha Kullanıcı Dostu (4 Nisan 2026)

**İstek:** `( KAPAT )` metni yerine daha anlaşılır bir kapatma deneyimi.

**Yapılanlar:**

- **`src/components/Portfolio/index.js`**
  - Metin kaldırıldı; yerine **yuvarlak X ikon düğmesi** (`aria-label="Detayı kapat"`), **boş alana (backdrop) tıklayınca kapanma** (içerik alanı `stopPropagation` ile kapanmıyor).
  - Ekran okuyucular için gizli kısa yönerge (`aria-describedby` + `.portfolio-sr-only`): boş alan, Escape ve kapat düğmesi.
  - `Escape` davranışı aynı kaldı.

- **`src/components/Portfolio/index.scss`**
  - Kapat düğmesi: minimum 44×44px dokunma alanı, yarı saydam dairesel zemin, hover/focus/active durumları; `.portfolio-sr-only` yardım sınıfı.

**Etkilenen dosyalar:** `src/components/Portfolio/index.js`, `src/components/Portfolio/index.scss`, `DOCUMENTATION.md`

---

### Görev 13: Work Başlığı + Peek Videosu (4 Nisan 2026)

**İstek:** `(Sc-00)` kaldırılsın; başlık About ile aynı boyutta olsun; hover iç alanında (peek) isteğe bağlı video kullanılabilsin.

**Yapılanlar:**

1. **`src/components/Portfolio/index.js`**
   - Eyebrow `(Sc-00)` kaldırıldı.
   - Firestore alanı `peekVideo` (URL): varsa hover peek alanında video; yoksa önceki gibi ikinci görsel mantığı (`innerStill`).

2. **`src/components/Portfolio/PeekInner.js`** (yeni)
   - Peek için `<video>` veya `<img>`; detay açıkken ve `prefers-reduced-motion` iken video duraklatılır.

3. **`src/components/Portfolio/index.scss`**
   - `.header-title`: About `.text-zone h1` ile uyumlu — `clamp(2.5rem, 6vw, 60px)`; tablet/mobil kırılımları About ile hizalı.
   - `.premium-card__inner-video` yardımcı sınıfı.

4. **`src/components/Admin/PortfolioManager.js` + `.scss`**
   - Opsiyonel **Peek videosu** alanı: MP4 / WebM / MOV, en fazla 80MB; Firebase Storage `portfolio_videos/` yüklemesi; önizleme ve kaldır.
   - Kayıt/silme sırasında `peekVideo` dosyası Storage’dan temizlenir.

**Firebase Storage (kullanıcı tarafında yapılmalı):** `portfolio_videos/` için resim kurallarına benzer okuma/yazma kuralı eklenmeli (ör. `match /portfolio_videos/{allPaths=**}`).

**Etkilenen dosyalar:** `src/components/Portfolio/index.js`, `src/components/Portfolio/index.scss`, `src/components/Portfolio/PeekInner.js`, `src/components/Admin/PortfolioManager.js`, `src/components/Admin/PortfolioManager.scss`, `DOCUMENTATION.md`

---

### Görev 14: Ana Medya — Görsel veya Video (4 Nisan 2026)

**İstek:** “Ana Resim” alanında video da kullanılabilsin; portföy kartında tam alan arka planda oynasın.

**Yapılanlar:**

- **Firestore:** `imageIsVideo` (boolean). Ana medya video ise `image` alanı video URL’sini tutar; yükleme `portfolio_videos/` altına yapılır. Görsel ise `portfolio_images/`.
- **`cover`:** Ana medya video iken poster isteğe bağlı (yalnızca görsel); ana medya görsel iken kapak yoksa `cover` yine `image` ile doldurulur.
- **`src/components/Portfolio/CardBackground.js`:** Arka planda `<video>` veya `<img>`; detay açıkken ve `prefers-reduced-motion` iken arka plan videosu durur.
- **`src/components/Portfolio/index.js`:** Peek iç görseli, video ana medyada poster görseline göre hesaplanır.
- **`src/components/Admin/PortfolioManager.js`:** “Ana görsel veya video” tek dosya seçimi; kapak alanı açıklaması güncellendi; admin liste önizlemesinde video + `poster`.

**Etkilenen dosyalar:** `src/components/Portfolio/CardBackground.js`, `src/components/Portfolio/index.js`, `src/components/Portfolio/index.scss`, `src/components/Admin/PortfolioManager.js`, `src/components/Admin/PortfolioManager.scss`, `DOCUMENTATION.md`

---

### Görev 15: Video Kapakta — Ana Alan Yalnız Görsel (4 Nisan 2026)

**İstek:** Görev 14’teki model tersine çevrildi: **ana medya her zaman görsel**; **video yalnızca kapak** alanında kullanılabilir.

**Yapılanlar:**

- **Firestore:** `coverIsVideo` (boolean). Video kapak ise `cover` URL’si `portfolio_videos/` yüklemesidir; kart arka planında `<video src={cover} poster={image}>` kullanılır. `image` her zaman görsel (`portfolio_images/`). Kayıtta `imageIsVideo: false` yazılır.
- **Eski veriler:** Daha önce `imageIsVideo: true` ile kaydedilmiş projeler **CardBackground** ve admin küçük resimde geçici olarak desteklenmeye devam eder.
- **`PortfolioManager`:** Ana alan tekrar `ImageUploader` (yalnız görsel). Kapak alanı görsel veya video dosyası; açıklama metinleri güncellendi.

**Etkilenen dosyalar:** `src/components/Portfolio/CardBackground.js`, `src/components/Portfolio/index.js`, `src/components/Admin/PortfolioManager.js`, `DOCUMENTATION.md`

---

### Görev 16: Dış Görsel — İç Video (Peek) (4 Nisan 2026)

**Sorun:** Kapak video olduğunda tam ekran arka planda video oynuyordu; istenen: **dışarıda yalnızca görsel**, **içeride (hover peek) video**.

**Yapılanlar:**

- **`CardBackground.js`:** Yalnızca `<img>`; `coverIsVideo` ise `src` = ana görsel (`image`), aksi halde `cover || image`.
- **`index.js`:** İç video URL’si = `peekVideo` alanı **veya** (`coverIsVideo` ise `cover` video URL’si). `PeekInner` bu tek kaynakla oynatır.
- **`PortfolioManager`:** Kapak alanı açıklaması güncellendi (dış = ana görsel, kapak videosu = iç peek).
- **Admin liste küçük resim:** Her zaman görsel; kapak video iken ana görsel gösterilir.

**Etkilenen dosyalar:** `src/components/Portfolio/CardBackground.js`, `src/components/Portfolio/index.js`, `src/components/Admin/PortfolioManager.js`, `src/components/Admin/PortfolioManager.scss`, `DOCUMENTATION.md`

---

### Görev 17: Work (Portfolio) Performansı — Peek Videoları ve Blur (21 Nisan 2026)

**Sorun:** Work bölümünde kasma; özellikle birden fazla projede peek videosu varken tüm videoların aynı anda decode/oynatılması ve detay katmanındaki güçlü `backdrop-filter` GPU yükü.

**Yapılanlar:**

1. **`src/components/Portfolio/PeekInner.js`**
   - `playbackEnabled` prop’u: yalnızca true iken `play()`; aksi halde `pause()`.
   - `preload`: oynatma kapalıyken `none` (gereksiz ön yükleme azaltıldı); `autoPlay` kapatıldı.

2. **`src/components/Portfolio/index.js`**
   - `PortfolioCardItem`: `useInView` ile kart görünürken, `useMediaQuery("(min-width: 768px) and (hover: hover) and (pointer: fine)")` ile masaüstü “ince işaretçi” ortamında, `onPointerEnter` / `onPointerLeave` ile hover birleştirilerek peek videosu **en fazla hover anında** oynatılıyor (aynı anda birden çok video yok).
   - `useReducedMotion`: giriş animasyonu ve peek oynatma devre dışı.
   - Liste öğesi `memo` ile sarıldı; `openIndex` değişiminde yalnız ilgili kartlar güncellenir.

3. **`src/components/Portfolio/index.scss`**
   - Detay overlay `backdrop-filter` 20px → 12px (daha düşük GPU maliyeti).

**Etkilenen dosyalar:** `src/components/Portfolio/index.js`, `src/components/Portfolio/PeekInner.js`, `src/components/Portfolio/index.scss`, `DOCUMENTATION.md`

---

### Görev 18: Work Bölümü — React.lazy + Kaydırmada Yükleme (21 Nisan 2026)

**İstek:** Work (Portfolio) kodunu ilk bundle’dan ayırıp, kullanıcı bölüme yaklaştığında yüklemek.

**Yapılanlar:**

1. **`src/App.js`**
   - `Portfolio` statik import yerine `lazy(() => import(/* webpackChunkName: "portfolio-work" */ './components/Portfolio'))`.
   - `loadPortfolio` state: başlangıçta `location.hash === '#portfolio'` ise true (doğrudan Work’e link).
   - `hashchange` ile `#portfolio` gelince chunk tetiklenir.
   - `IntersectionObserver` (`root`: scroll container, `rootMargin: ~280px`): Work bölümü görünüme yaklaşınca `loadPortfolio` true; böylece chunk gerçekten kaydırma ile istenir.
   - Chunk gelene kadar `.portfolio-lazy-placeholder`; `Suspense` fallback: “Work yükleniyor…” (`aria-live="polite"`).
   - `portfolioSectionRef` ile gözlemlenen hedef: `#portfolio` `motion.section`.

2. **`src/App.scss`**
   - `.portfolio-lazy-placeholder`, `.portfolio-lazy-fallback` — en az `100dvh` ile yer tutma ve kısa yükleme gösterimi.

**Etkilenen dosyalar:** `src/App.js`, `src/App.scss`, `DOCUMENTATION.md`

---

### Görev 19: App Sadeleştirme + About/Contact Code Splitting (21 Nisan 2026)

**Sorun:** `pageTransition` tüm opacity değerleri 1 ile fiilen animasyon yapmıyordu; `motion.section` gereksiz Framer yükü ve karmaşıklık. About + Contact ana paketteydi.

**Yapılanlar:**

1. **`src/App.js`**
   - `pageTransition` ve `motion.section` kaldırıldı; bölümler düz `<section>`.
   - `framer-motion` import’u App’ten çıkarıldı (auth yükleme metni düz metin).
   - `About` ve `Contact` `React.lazy` + `webpackChunkName` (`about`, `contact`) ile ayrı chunk; `Suspense` + `.section-lazy-fallback` yer tutucu.
   - Statik `sectionsRef` dizisi yerine modül düzeyinde `SECTION_IDS` sabiti.

2. **`src/App.scss`**
   - `.section-lazy-fallback` — About/Contact chunk’ı gelene kadar minimum tam ekran yükseklik.

**Not:** About içindeki `useScroll` / SVG animasyonları ve Contact’taki `LiquidWave` + cam efektleri hâlâ ağır olabilir; ileride `prefers-reduced-motion` ile sadeleştirme ayrı görev olabilir.

**Etkilenen dosyalar:** `src/App.js`, `src/App.scss`, `DOCUMENTATION.md`

---

### Görev 20: Performans — LiquidWave RAF Durdurma, Cam ve About Hafifletme (21 Nisan 2026)

**Sorun:** Contact’taki `LiquidWave` sayfa açılır açılmaz sürekli `requestAnimationFrame` + fizik çalıştırıyordu; kullanıcı başka bölümdeyken bile CPU yanlıyordu. Formda her alanda `filter: url(#glassLens)` + `backdrop-filter` ağırdı. About’ta sürekli SVG / scroll bağlı animasyonlar vardı.

**Yapılanlar:**

1. **`LiquidWave.js`**
   - `IntersectionObserver` (root: `.scroll-container`): Contact alanı görünür değilken RAF iptal, scroll dinleyicisi yok.
   - `prefers-reduced-motion: reduce` ise canvas yerine statik gradient (`.liquid-wave-static`) — sıfır animasyon.

2. **`LiquidWave.scss`**
   - `.liquid-wave-static` gradient arka plan.

3. **`Contact/index.js` + `index.scss`**
   - `glass-wrap--simple`: `backdrop-filter` ve SVG `filter` kapatılır; `reduceMotion` veya **≤768px** genişlikte otomatik (mobilde daha opak `.glass-overlay`).
   - `useNarrowViewport` hook.

4. **`About/index.js` + `index.scss`**
   - `useReducedMotion`: parallax `y` / scroll `opacity` sabit; göz ve daire sonsuz animasyonları `animate={false}`; `whileHover` kapatıldı.
   - CSS’te `prefers-reduced-motion` için `.Rolly` / `.eyes` / `.Shaddow` animasyonları kapalı.

**Etkilenen dosyalar:** `src/components/Contact/LiquidWave.js`, `LiquidWave.scss`, `Contact/index.js`, `Contact/index.scss`, `About/index.js`, `About/index.scss`, `DOCUMENTATION.md`

---

### Görev 21: LCP / Kritik İstek Zinciri — Font Preload ve GTM Erteleme (21 Nisan 2026)

**Sorun:** Lighthouse: kritik yol uzun (CSS → @font-face → Coolvetica / Helvetica sırayla); GTM `<head>` içinde ilk boyamayla yarışıyordu.

**Yapılanlar:**

1. **`public/fonts/`** — `CoolveticaRg-Regular.woff2` ve `.woff` kopyalandı.

2. **`public/fonts/fonts.css`** — Coolvetica `@font-face` burada (Webpack `url('/fonts/...')` yolunu `src/` altında aradığı için SCSS’te sabit kök kullanılamıyordu). Küçük bu dosya, ana bundle CSS’ten önce yüklenir.

3. **`public/index.html`** — `rel="preload"` (woff2) + `link rel="stylesheet"` (`fonts.css`) — LCP başlık fontu ana JS/CSS zincirinden ayrıldı; çift indirme yok.

4. **`App.scss`** — Coolvetica `@font-face` kaldırıldı (artık `fonts.css`); `Helvetica Neue`: `font-display: optional`.

5. **`public/index.html`** — `window.load` sonrası GTM.

6. **`theme-color` meta** — satır sonu kırılması kaldırıldı.

**Not:** Canlı sitede `fonts.googleapis.com` görünüyorsa eski deploy veya başka katmandır; bu repoda Google Fonts yok. Chrome eklentisi uyarıları Lighthouse’ta yok sayılabilir.

**Etkilenen dosyalar:** `public/index.html`, `public/fonts/*`, `src/App.scss`, `DOCUMENTATION.md`

---

### Görev 22: Animasyon Denetimi — transform/opacity, JS, ekran dışı (21 Nisan 2026)

**İstek:** Kritik yol dışı property’leri animasyonlardan çıkarmak; sürekli ekran dışı animasyonları durdurmak.

**Tespit özeti (ana site):**

| Dosya | Sorun | Çözüm |
|--------|--------|--------|
| `Home/index.scss` `.flat-button` | `transition: all` + background/color/border/shadow | `transform` + `::after` ile `opacity` dolgu; `translate3d` |
| `Contact/index.scss` `.glass-wrap` | `transition: box-shadow` | Geçiş kaldırıldı (anlık gölge) |
| `Contact/index.scss` form `li` | `fadeInUp` sürekli (chunk yüklenince) | `animation-play-state: paused` + `.contact-page--in-view` ile `running` |
| `index.scss` scrollbar thumb | `background-color` transition | Geçiş kaldırıldı |
| `App.scss` scrollbar thumb | `background` transition | Geçiş kaldırıldı |
| `Portfolio/index.scss` `.premium-card__close` | color, background, border transition | Sadece `opacity` + `transform` |
| `Portfolio/index.scss` `.premium-card__detail-link` | `color` transition | Kaldırıldı (anında hover) |
| `About/index.js` + `About/index.scss` | Framer + CSS sürekli animasyon ekran dışında | `about-page--in-view`; `!isInView` iken Framer `animate={false}`; CSS `animation-play-state: paused` |

**Zaten uygun / dokunulmayan:** `App.scss` `fadeInUp`, `sectionFadeIn`, `Portfolio` çoğunlukla `transform`/`opacity`; `LiquidWave` rAF (ayrı optimizasyon); admin SCSS (kapsam dışı bırakıldı).

**Etkilenen dosyalar:** `src/components/Home/index.scss`, `Contact/index.js`, `Contact/index.scss`, `src/index.scss`, `src/App.scss`, `Portfolio/index.scss`, `About/index.js`, `About/index.scss`, `DOCUMENTATION.md`

---

### Görev 23: PeekInner — `activeSrc` ile video yükleme kontrolü (21 Nisan 2026)

**İstek:** `playbackEnabled` false iken bile `src` set edilmesin; hover sonrası durdur, sıfırla, src kaldır.

**Yapılanlar (`PeekInner.js`):**

- Yerel state `activeSrc` (başlangıç `null`).
- `playbackEnabled` true → `activeSrc = peekVideo`; ikinci `useEffect` ile `play()`.
- `playbackEnabled` false → `pause()`, `currentTime = 0`, `activeSrc = null`.
- `preload` sabit `"none"` (yük tamamen `src` ile).
- `peekVideo` yoksa `activeSrc` temizlenir.

**Etkilenen dosyalar:** `src/components/Portfolio/PeekInner.js`, `DOCUMENTATION.md`

---

### Görev 24: LiquidWave — scroll throttle, animate ref, N=80 (21 Nisan 2026)

**İstek:** `onScroll` içindeki yoğun işi throttle; `animate` için stale closure / effect yeniden çalışmasını önle; fizik maliyetini düşür.

**Yapılanlar (`LiquidWave.js`):**

1. `onScroll` başında 32 ms throttle (`scrollWorkLastRunRef`).
2. `animate` `useCallback` kaldırıldı; `animateRef.current` her render’da güncellenir, rAF `requestAnimationFrame(() => animateRef.current?.())` ile döner — `useEffect` bağımlılıklarından `physics`/`render`/`animate` çıktı.
3. `N` 140 → 80.

**Etkilenen dosyalar:** `src/components/Contact/LiquidWave.js`, `DOCUMENTATION.md`