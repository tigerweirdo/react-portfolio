# Gorev Kaydi

- 2025-01-XX: Portfolio bolumu mobil responsive duzenlemesi yapildi. Mobilde (768px ve alti) yatay scroll yerine grid layout kullanildi. 768px altinda 2 sutunlu grid, 480px altinda tek sutunlu grid yapisi kullaniliyor. Gorseller artik mobilde alt alta geliyor ve kaybolmuyor. Mobilde yatay scroll wheel event'i devre disi birakildi. Portfolio sayfasinin mobilde overflow sorunlari duzeltildi, sayfa icerige gore yukseklik aliyor ve scroll edilebilir hale getirildi.

- 2025-10-31: Portfolyo bolumunde dikey scroll hareketini yatay kaydirma hijack mantigina donusturmek icin yatay kaydirma dinleyicisi ve stiller eklendi.

- 2025-01-XX: Contact me bolumune mesaj gonderildiginde temmuzcetiner@gmail.com adresine mesaj gitmesi icin gizli input alani eklendi. EmailJS template'inde "To Email" alaninda {{to_email}} degiskeni kullanilmasi gerekiyor. EmailJS init fonksiyonu eklendi ve localhost'tan da test edilebilir hale getirildi. Hata ayiklama icin console.log'lar eklendi.

- 2025-01-XX: Contact me input alanlarinda focus animasyonu sorunu duzeltildi. li elementlerinde overflow: hidden yerine overflow: visible yapildi, padding eklendi, transform-origin center yapildi ve focus durumunda box-shadow eklendi. Boylece input'lar buyurken kesilmiyor ve border'lar gorunuyor.

- 2025-01-XX: Contact me basari mesaji ("Your message has been sent successfully!") 3 saniye sonra otomatik olarak kaybolacak sekilde timeout eklendi. Mesaj kaybolurken yapinin uzayip kismamasi icin AnimatePresence ve height animasyonu eklendi. Boylece layout shift olmadan yumusak bir gecis saglandi.

- 2025-01-XX: Contact me basari mesaji genel yapiyi bozmaması icin duzeltildi. Mesaj form icinde, butonun hemen altinda sabit bir alanda (height: 60px) gosteriliyor. Mesaj her zaman render ediliyor (gorunmediginde bos bir alan olarak), bu sayede form hicbir zaman buyuyup kuculmuyor. Height animasyonu kaldirildi, yerine sadece opacity ve y pozisyonu animasyonu kullaniliyor. Bu sayede layout shift olmadan mesaj gosteriliyor ve genel yapi tamamen korunuyor.

- 2025-01-XX: Vercel deployment icin Node.js versiyonu 22.x'e yukseltildi. package.json dosyasina "engines" alani eklendi (node >=22.0.0, npm >=10.0.0) ve .nvmrc dosyasi olusturuldu (22). Bu sayede Vercel otomatik olarak Node.js 22.x kullanacak.

- 2026-02-18: Kapsamli mobil responsive duzeltmeleri yapildi. Toplam 9 dosya guncellendi:

  KRITIK HATA DUZELTMESI:
  - About page: flex-direction: row !important kullanilmasi nedeniyle media query'deki column layout asla uygulanamiyordu. !important kaldirildi.

  App.scss degisiklikleri:
  - 100vw yerine 100% kullanildi (yatay scrollbar sorununu onler)
  - Tum yukseklik degerleri 100dvh fallback ile guncellendi (mobil tarayici adres cubugu destegi)
  - body'ye position: fixed eklendi (iOS adres cubugu bounce sorununu onler)
  - #root elemanina dogru boyutlar verildi
  - Mobilde scroll-snap-type: y proximity olarak ayarlandi (daha yumusak gecis)
  - Landscape (yatay) mod icin ozel media query eklendi (max-height: 500px)
  - Global overflow-wrap: break-word ve img max-width: 100% eklendi
  - Container padding breakpoint'lere gore optimize edildi

  Home page degisiklikleri:
  - Logo right: -30px -> right: 10px (yatay overflow onlendi)
  - Tablette logo position: absolute'tan position: relative'e donusturuldu (akis icinde)
  - Logo boyutlari breakpoint'lere gore kademelendi: 280px -> 160px -> 130px -> 100px
  - Font boyutlari clamp() ile fluid typography kullanildi
  - padding-right clamp degerleri optimize edildi
  - overflow: hidden eklendi

  About page degisiklikleri:
  - flex-direction: row !important -> flex-direction: row (kritik hata duzeltmesi)
  - Font boyutlari clamp() ile dinamik hale getirildi
  - Mobilde text max-width: 600px ve auto margin ile ortalandi
  - 480px kucuk mobil breakpoint eklendi

  Contact page degisiklikleri:
  - Form layout: float-based -> flexbox (flex-wrap: wrap + gap: 12px)
  - li.half: width 49% + margin -> calc(50% - 6px) gap-aware hesaplama
  - Input font-size: 16px (iOS auto-zoom onleme)
  - -webkit-appearance: none ve border-radius: 0 eklendi (iOS stil normalizasyonu)
  - Bottom padding breakpoint'lere gore: 300px -> 280px -> 200px -> 160px
  - Mobilde overflow-y: auto eklendi (icerik kesilmesi onlendi)
  - Submit row mobilde flex-direction: column olarak yigildi
  - Textarea min-height mobilde 130px -> 100px

  Portfolio page degisiklikleri:
  - Mobil gorsel aspect-ratio: 16/10 -> 16/9
  - Scene-title ve description icin clamp() font boyutlari
  - Skeleton scene padding ve gap optimize edildi
  - Portfolio end-spacer breakpoint'lere gore ayarlandi

  LiquidWave degisiklikleri:
  - Desktop yukseklik: 300px -> 280px
  - Mobil yukseklik: 220px -> 180px, kucuk mobil: 170px -> 140px
  - pointer-events: none eklendi (mobilde touch olaylarinin engellenmesi onlendi)

  Global degisiklikler:
  - Body base font: 11px -> 14px (erisebilirlik icin)
  - text-size-adjust: 100% eklendi
  - Viewport meta tag'a viewport-fit=cover eklendi (notch destegi)
  - Touch swipe esik degeri mobilde 80px -> 50px'e dusuruldu (daha kolay section gecisi)
  - Dashboard mobil margin optimize edildi

- 2026-02-18: Portfolio/Contact scroll ve LiquidWave etkilesim sorunlari duzeltildi:

  LiquidWave duzeltmesi:
  - pointer-events: none tamamen kaldirildi (mouse ve touch etkileşimlerini engelliyordu)
  - Dalga artik mouse hareketi ve tiklamaya tepki veriyor

  Portfolio scroll duzeltmesi:
  - Portfolio wheel handler passive: true -> passive: false olarak degistirildi
  - stopPropagation + preventDefault + manuel scrollTop kontrolu eklendi
  - Bu sayede portfolio ici scroll sırasında ana scroll-container kaymiyor
  - Portfolio kenarlara ulastiginda event dogru sekilde üst handler'a iletiliyor

  Section scroll iyilestirmesi:
  - scroll-snap-stop: always kaldirildi (JS zaten section-by-section navigasyon kontrolu yapiyor)
  - Portfolio section: height: auto -> height: 100dvh (scroll-snap ile uyumluluk)
  - Portfolio section overflow: auto -> overflow: hidden (ic scroll portfolio-scroll-area ile yonetiliyor)

- 2026-02-18: LiquidWave damla fizigi tamamen yeniden yazildi (gercekci su damlasi simulasyonu):

  Damla olusturma (disturb):
  - Maksimum dikey hiz siniri eklendi (maxVy = surfH * 0.06) - damlalar artik canvas disina cikmiyor
  - Hiz azaltildi: speed * 0.55 (eskisi: * 0.9) ve vx * 0.7 carpani eklendi
  - Damla omru arttirildi: 1.0-1.6 (eskisi: 0.7-1.2) - suzeye donmeden kaybolmuyor
  - MAX_DROPS = 80 limiti eklendi (performans korumasi)

  Damla fizigi (physics):
  - Hava surtunemsi (AIR_DRAG = 0.992) eklendi - hem vx hem vy icin
  - Canvas ust siniri korumasi: y < 4px olursa vy yansitilir (bounce)
  - Yuzey carpma: damla suzeye degdiginde aninda silinir (eskisi: life = 0.15 ile soluyordu)

  Yuzey carpma etkileri:
  - Darbe gucu: vy * sz * 0.35 (eskisi: sadece vy * 0.3)
  - Darbe yarıcapi: sz * 1.5 sutun genisliginde dalga yayilimi (eskisi: tek sutun)
  - Cosinus falloff ile dogal dalga yayilimi
  - Splash ring efekti: eliptik halka animasyonu (radius, alpha, life ile zamanla genisleyip soluyor)
  - Ic halka efekti (life > 0.5 iken gorunur)
  - Ikincil damla olusturma (spawnSplash): buyuk damlalar yere dusunce kucuk sekme damlaciklarini uretir

  Damla gorsel iyilestirmeleri:
  - Hiz bazli kuyruk: quadraticCurveTo ile hiz yonunde goz yası sekli
  - Parlama noktasi (highlight): buyuk damlaların sol ust kosesinde kucuk parlak nokta
  - Glow efekti iyilestirildi: radius sz * 2 (eskisi: sz * 2.5), alpha azaltildi

- 2026-02-18: Portfolio section desktop scroll sorunu cozuldu:

  Sorun: Portfolio ici scroll (portfolio-scroll-area) desktop'ta takılıyordu/jank yapıyordu.
  Sebep: Onceki duzeltmede wheel handler'a e.preventDefault() + manuel el.scrollTop += e.deltaY eklenmisti.
  Bu, CSS scroll-behavior: smooth ile cakisiyordu - her wheel event'te smooth animasyon kuyruga girip jank yaratiyordu.

  Cozum (3 dosya):

  Portfolio/index.js - wheel handler:
  - e.preventDefault() ve el.scrollTop += e.deltaY kaldirildi
  - Sadece e.stopPropagation() kullaniliyor - tarayicinin native scroll'u portfolio'yu akıcı kaydiriyor
  - passive: false -> passive: true (preventDefault artik cagirilmiyor)

  App.js - handleWheelScroll:
  - event.preventDefault() fonksiyonun en basina tasindi (her durumda cagriliyor)
  - Scroll-container'in native scroll yapmasi tamamen engelleniyor
  - Section navigasyon sadece JS ile kontrol ediliyor

  Portfolio/index.scss:
  - scroll-behavior: smooth kaldirildi (manuel scrollTop ile cakismasi onlendi)
  - overscroll-behavior: contain eklendi (scroll chaining engeli - portfolio kenardayken ana sayfaya zincir scroll yapilmiyor)

- 2026-02-18: Portfolio section scroll trap sorunu cozuldu:

  Sorun: Portfolio bolumune inildiginde, icerik bittikten sonra asagi veya yukari diger bolumlere gecis yapilamiyordu.
  Sebep: App.js'deki scroll threshold degeri (50) cok yuksekti ve Portfolio'nun kenar algilama toleransi (1-2px) cok dusuktu.

  Cozum:
  - App.js: Scroll threshold 50 -> 15'e dusuruldu. Artik kucuk scroll hareketleri de section degisimini tetikliyor.
  - Portfolio/index.js: atTop ve atBottom algilama toleransi 5px'e cikarildi ve Math.abs ile daha hassas hesaplama yapildi.
