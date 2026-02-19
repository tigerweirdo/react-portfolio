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

- 2026-02-18: Portfolio scroll trap sorunu icin kesin cozum uygulandi (Manuel Navigasyon):

  Sorun: Portfolio bolumunde event bubbling mekanizmasi guvenilir calismiyordu. Kullanici portfolio sonuna gelse bile scroll eventi App.js tarafindan yakalanip sayfa degisimi tetiklenemiyordu. "Portfolio digerlerinden farkli davraniyor" sikayeti vardi.

  Cozum:
  - App.js: `scrollToSection` fonksiyonu `Portfolio` bilesenine prop olarak gecildi.
  - Portfolio/index.js: `onWheel` event handler'i guncellendi.
    - `atBottom` ve `deltaY > 0` (asagi scroll) ise: `scrollToSection('contact')` manuel olarak cagriliyor.
    - `atTop` ve `deltaY < 0` (yukari scroll) ise: `scrollToSection('about')` manuel olarak cagriliyor.
    - Ara durumlarda `e.stopPropagation()` ile sadece portfolio ici scroll calisiyor.
    - `passive: false` yapildi ve `e.preventDefault()` eklendi (sayfa degisimi sirasinda native scroll'u durdurmak icin).
  - Portfolio/index.scss: `overscroll-behavior: contain` kaldirildi (native engel kaldirildi).

- 2026-02-18: Scroll Jacking (JS kontrollu scroll) tamamen kaldirildi, Native Scroll'a gecildi:

  Sorun: Kullanici "kontrollu" scroll hissinden ve Portfolio'nun diger bolumlerden farkli davranmasindan rahatsizdi. "Tamamen manuel" bir akis istendi.

  Cozum:
  - App.js: Tum wheel ve touch event listener'lari silindi. Manuel section degistirme mantigi (scrollToSectionByIndex) kaldirildi.
  - Portfolio/index.js: Tum scroll event listener'lari silindi. Portfolio'nun kendi icindeki scroll mantigi tamamen iptal edildi.
  - App.scss: CSS Scroll Snap (scroll-snap-type: y mandatory) aktif tutuldu. Portfolio section'i `height: auto` ve `overflow: visible` yapildi.
  - Portfolio/index.scss: Portfolio sayfasinin 100vh kisitlamasi kaldirildi.

  Sonuc:
  - Artik sayfa tek bir scroll bar ile yonetiliyor (Native Browser Scroll).
  - Bolumler arasi gecisi tarayıcı (CSS Scroll Snap) yapiyor.
  - Portfolio bolumu icerigi kadar uzuyor ve sayfa akisi icinde dogal bir sekilde yer aliyor.
  - Hicbir JS mudahalesi kalmadi, tamamen performansli ve dogal bir deneyim.

- 2026-02-18: Home sayfasi logo konumu duzeltildi:

  Sorun: Logo (kaplan gorseli) sag ust kosede havada asili ve kenara sikismis gibi duruyordu. Absolute positioning responsive yapida sorun yaratiyordu.

  Cozum:
  - Home/index.scss: Layout Flexbox (justify-content: space-between) yapisina cevrildi.
  - Logo container: position: absolute -> position: relative yapildi.
  - Logo ve metin artik yan yana (row) duruyor, ekran genisledikce aralarindaki mesafe artiyor.
  - Sayfa kenarlarina %10 padding eklendi, boylece icerik kenarlara yapismiyor.
  - Logo boyutu %35 ve max-width: 450px ile sinirlandirildi.

- 2026-02-18: Home sayfasi logo konumu "yapışık" hale getirildi:

  Sorun: Kullanici logonun kenara "yapışmasını" istedi (bosluksuz).

  Cozum:
  - Home/index.scss:
    - Sag taraftaki padding (%10) kaldirildi (padding: 0 0 0 10%).
    - Logo container tekrar `position: absolute` yapildi.
    - `right: 0` ile sag kenara tam yapistirildi.
    - `top: 50%` ve `transform: translateY(-50%)` ile dikeyde ortalandi.
    - `justify-content: flex-end` ile icerik saga yaslandi.

- 2026-02-18: Home sayfasi logo boyutu ve konumu guncellendi:

  Sorun: Logo hala kucuk ve sag kenarda bosluk kaliyor.

  Cozum:
  - Home/index.scss:
    - Logo container width: 35% -> 45% (buyutuldu).
    - Max-width: 450px -> 600px (sinir artirildi).
    - Right: 0 -> -40px (negatif margin ile saga zorla itildi, bosluk kapatildi).
    - Top: 50% -> 45% (biraz yukari alindi).

- 2026-02-18: About sayfasi layout duzenlendi (Compact Layout):

  Sorun: About sayfasinda robot ve metin cok ayrik duruyordu, mobil/tablet gorunumunde robot kayboluyordu ve genel olarak "garip" bir gorunum vardi.

  Cozum:
  - About/index.scss:
    - Layout: Flex row ile metin (sol) ve robot (sag) yan yana getirildi.
    - Hizalama: `align-items: center` ve `justify-content: center` ile ortalandi.
    - Siralama: Metin `order: 1`, Robot `order: 2` yapildi (Masaustu).
    - Bosluklar: `gap: 2rem` ve `padding: 0 10%` ile daha kompakt hale getirildi.
    - Robot: `margin-bottom` kaldirildi, `max-width: 500px` siniri konuldu.
    - Responsive:
      - Tablet/Mobil'de `flex-direction: column` ile alt alta alindi.
      - Robot artik gizlenmiyor (`display: none` kaldirildi), kucultulerek gosteriliyor (max-width: 300px/220px).
      - Metin ve robot ortalandi.

- 2026-02-18: About sayfasi CSS cakismasi ve metin okunabilirligi duzeltildi:

  Sorun: About sayfasinda `.container` class'indan gelen `flex-direction: column` ozelligi, `.about-page`'in `flex-direction: row` ozelligini eziyordu. Bu yuzden masaustunde bile elemanlar alt alta geliyordu. Ayrica metinler cok silik ve okunaksizdi.

  Cozum:
  - About/index.scss:
    - `.about-page` secicisi `.container.about-page` olarak degistirildi (specificity artirildi).
    - Boylece `flex-direction: row` ozelligi dogru sekilde uygulandi.
    - Metin rengi (`color`) ve opakligi (`opacity: 1`) duzeltildi.
    - Metinlere hafif bir golge (`text-shadow`) eklenerek okunabilirlik artirildi.
    - Font agirligi (`font-weight: 500`) artirildi.

- 2026-02-18: About sayfasi robot ve golge hizalamasi duzeltildi:

  Sorun: Robot ve golgesi yan yana duruyordu (flex-direction: row nedeniyle).

  Cozum:
  - About/index.scss:
    - `.robot123` container'ina `flex-direction: column` eklendi.
    - Artik robot (ustte) ve golge (altta) dogru sekilde hizalaniyor.

- 2026-02-18: About sayfasi robot boyutu kucultuldu:

  Sorun: Robot gorseli "asiri buyuk" gorunuyordu.

  Cozum:
  - About/index.scss:
    - `.robot123` max-width: 500px -> 280px olarak guncellendi.
    - SVG max-height: 500px -> 300px olarak guncellendi.
    - `overflow: visible` eklendi (golgenin kesilmesini onlemek icin).

- 2026-02-18: Contact sayfasi alt bosluk duzeltildi:

  Sorun: Contact sayfasinin en altinda istenmeyen beyaz bir bosluk vardi. Bu bosluk `padding-bottom: 300px` (veya benzeri) degerinden kaynaklaniyordu.

  Cozum:
  - Contact/index.scss:
    - `.contact-page` padding-bottom degeri `0` yapildi.
    - Icerik ile dalga efekti arasindaki mesafe icin `.text-zone`'a `margin-bottom: 300px` (mobil/tablette daha az) eklendi.
    - Bu sayede dalga efekti sayfanin en altina tam olarak yapisti ve beyaz bosluk kalmadi.

- 2026-02-18: Contact formunun sivinin icine girmesi saglandi:

  Sorun: Kullanici, "Send" butonu ve inputlarin bir kisminin sivinin (LiquidWave) icinde (uzerinde) gorunmesini istedi.

  Cozum:
  - Contact/index.scss:
    - `.text-zone` margin-bottom degerleri ciddi oranda dusuruldu:
      - Desktop: 300px -> 120px
      - Tablet: 280px -> 120px
      - Mobil: 200px -> 80px
      - Kucuk Mobil: 160px -> 60px
    - Bu sayede form asagi kaydi ve sivinin kapladigi alanla gorsel olarak ust uste bindi.
    - `.text-zone` z-index degeri (2) sivinin z-index degerinden (1) yuksek oldugu icin form elemanlari sivinin onunde ve tiklanabilir durumda kaldi.

- 2026-02-18: LiquidWave "Cartoon Physics" guncellemesi yapildi:

  Sorun: Sivi efekti cok "duzgun" ve "sakin" duruyordu. Kullanici daha "cizgi film gibi" ve "fizige uyumlu" (daha canli, esnek) bir his istedi.

  Cozum (LiquidWave.js):
  - Fizik Degiskenleri:
    - SPRING (yay sertligi): 0.018 -> 0.035 (Daha sert, daha hizli tepki)
    - DAMP (sonumleme): 0.975 -> 0.94 (Daha az surtunme, daha cok salinim/wobble)
    - GRAVITY: 0.18 olarak eklendi (Damlalar daha hizli ve agir dusuyor)
  - Damla Gorselleri (Squash & Stretch):
    - Hiz vektorune gore damlalarin esnemesi (stretch) ve sikismasi (squash) eklendi.
    - Hizli duserken uzuyor, yavaslarken veya carpinca sekil degistiriyor.
    - Renkler daha canli ve parlak (cyan/blue gradient) yapildi.
    - Parlama efekti (highlight dot) eklenerek "glossy/jelibon" gorunumu verildi.
  - Yuzey Cizimi:
    - Yuzeyin ust kismina kalin beyaz bir outline (cizgi) eklendi (Cartoon outline).
    - Renk gecisleri (gradient) daha keskin ve canli tonlara cekildi.

- 2026-02-18: LiquidWave asiri dalgalanma sorunu giderildi:

  Sorun: "Cartoon" guncellemesi sonrasi sivi yuzeyi cok fazla dalgalaniyordu (asiri wobble).

  Cozum (LiquidWave.js):
  - DAMP (sonumleme): 0.94 -> 0.96 (Dalgalar daha hizli sonuyor).
  - SPRING (yay sertligi): 0.035 -> 0.025 (Yuzey daha az "gergin" ve daha yumusak).
  - SPREAD (yayilma): 0.25 -> 0.22 (Dalga yayilimi biraz kisildi).
  - Etkilesim kuvvetleri (mouse move/down) dusuruldu, boylece kullanici hareketiyle olusan kaos azaltildi.

- 2026-02-18: LiquidWave "Gercekci Su" ayari yapildi:

  Sorun: Kullanici hala "asiri dalgalanma" oldugunu ve "gercekci su hissiyati" istedigini belirtti.

  Cozum (LiquidWave.js):
  - SPRING: 0.025 -> 0.012 (Cok daha yumusak, agir salinim).
  - DAMP: 0.96 -> 0.975 (Daha hizli sonumleme, daha az kaos).
  - SPREAD: 0.22 -> 0.20 (Dalga yayilimi biraz daha kisildi).
  - Etkilesim kuvvetleri (mouse move/down) %50 oraninda daha da dusuruldu.
  - Artik su yuzeyi cok daha sakin, agir ve dogal bir sekilde hareket ediyor.

- 2026-02-18: LiquidWave mouse etkilesim hassasiyeti dusuruldu:

  Sorun: Kullanici mouse ile siviya dokundugunda "asiri tepki" verdigini belirtti.

  Cozum (LiquidWave.js):
  - Mouse Move Force: `spd * 0.4` -> `spd * 0.15` (Hareket etkisi %60+ azaltildi).
  - Max Force Cap: `6` -> `4` (Maksimum etki sinirlandirildi).
  - Disturb Multiplier: `0.2` -> `0.1` (Sonuc etkisi yariya indirildi).
  - Mouse Down (Click) Force: `5` -> `2` (Tiklama etkisi %60 azaltildi).
  - Artik mouse hareketleri sivi yuzeyinde cok daha hafif ve zarif dalgalanmalar yaratiyor.

- 2026-02-18: LiquidWave "Yogun/Viskoz Sivi" ayari yapildi:

  Sorun: Kullanici sivinin "daha yogun" olmasini ve "cok fazla dalgalanmamasini" istedi (yag veya bal gibi agir bir sivi hissi).

  Cozum (LiquidWave.js):
  - SPRING: 0.012 -> 0.005 (Cok dusuk yay sertligi, yuzey cok yavas geri donuyor).
  - DAMP: 0.975 -> 0.92 (Cok yuksek surtunme/sonumleme, dalgalar aninda duruyor).
  - SPREAD: 0.20 -> 0.15 (Dalgalar yanlara cok az yayiliyor).
  - Mouse Force: `spd * 0.1` ve Max `3` (Etkilesim minimuma indirildi).
  - Sonuc: Sivi artik su gibi calkalanmiyor, agir ve yogun bir kutle gibi hareket ediyor.

- 2026-02-18: LiquidWave "disturb" hatasi duzeltildi ve mouse etkilesimi kaldirildi:

  Sorun: Onceki duzeltmede `disturb` fonksiyonu kaldirilmis ancak event handler'lar silinmemisti, bu da "disturb is not defined" hatasina yol acti. Ayrica kullanici mouse etkilesimini tamamen kapatmak istedi.

  Cozum (LiquidWave.js):
  - `disturb` fonksiyonu tamamen kaldirildi (artik kullanilmiyor).
  - `onMM`, `onMD`, `onML`, `onTM`, `onTE` event handler'lari ve referanslari silindi.
  - `onScroll` fonksiyonu geri getirildi ve `disturb` yerine dogrudan `s.v[idx]` uzerinden siviya kuvvet uygulayacak sekilde guncellendi.
  - Artik sivi sadece scroll hareketine ve kendi icindeki `ambient motion`'a tepki veriyor. Mouse ile etkilesim tamamen devre disi.

- 2026-02-18: LiquidWave su seviyesi ve scroll dalgalanmasi arttirildi:

  Sorun: Kullanici su seviyesinin biraz daha yuksek olmasini ve scroll yapildiginda dalgalanmanin daha belirgin olmasini istedi.

  Cozum (LiquidWave.js):
  - Su Seviyesi: `SY_RATIO` 0.40 -> 0.30 olarak guncellendi. (Sivi artik ekranin %70'ini kapliyor, daha yukarida basliyor).
  - Scroll Dalgalanmasi:
    - Force Multiplier: 4 -> 8 (Iki katina cikarildi).
    - Max Force: 6 -> 12 (Ust limit iki katina cikarildi).
    - Etkilenen Nokta Sayisi: %25 -> %40 (Dalga daha genis bir alana yayiliyor).
  - Sonuc: Scroll yapildiginda sivi cok daha guclu ve genis bir sekilde calkalaniyor, su seviyesi daha yukarida duruyor.

- 2026-02-18: LiquidWave dalgalanma suresi uzatildi:

  Sorun: Kullanici dalgalarin cok cabuk sondugunu ve "dumduz" oldugunu, cok daha uzun sure dalgali kalmasini istedigini belirtti.

  Cozum (LiquidWave.js):
  - DAMP (Sonumleme): 0.92 -> 0.995 olarak guncellendi.
  - Bu degisiklik surtunmeyi minimuma indirerek dalgalarin cok daha uzun sure (neredeyse sonsuz salinim gibi) devam etmesini sagliyor.
  - Artik bir kez scroll yapildiginda su yuzeyi uzun sure hareketli kaliyor.

- 2026-02-18: LiquidWave container yuksekligi arttirildi:

  Sorun: Yukselen su seviyesi ve artan dalga gucu nedeniyle, dalgalar yukari ciktiginda canvas'in ust sinirina carpip kesiliyordu.

  Cozum (LiquidWave.scss):
  - Container yuksekligi arttirildi:
    - Desktop: 280px -> 400px
    - Tablet: 180px -> 300px
    - Mobil: 140px -> 250px
  - Bu degisiklik, dalgalarin yukari dogru hareket etmesi icin cok daha fazla bos alan (headroom) sagladi.
  - Su seviyesi oransal (SY_RATIO) oldugu icin, container buyuyunce suyun baslangic noktasi da asagi kaydi ama ustten olan mesafe artti, boylece kesilme sorunu cozuldu.
