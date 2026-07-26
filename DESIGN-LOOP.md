# Tasarım Tutarlılık Döngüsü — `/loop` promptu

Bu dosya, siteyi tasarım tutarlılığı açısından **10/10**'a taşımak ve orada
tutmak için kullanılan yinelemeli promptu ve puanlama rubriğini içerir.

Çalıştırmak için:

```bash
/loop Aşağıdaki DESIGN-LOOP.md rubriğini uygula: her turda sitedeki en düşük puanlı maddeyi bul, düzelt, yeniden puanla.
```

---

## PROMPT

> Sen bu React + Sass portfolyo projesinin tasarım sistemi bakımcısısın.
> Görevin, aşağıdaki 10 maddelik rubriği uygulayarak **kanıta dayalı** bir
> tutarlılık turu çalıştırmak.
>
> **Her turda sırayla:**
>
> 1. **Ölç.** Rubriğin 10 maddesinin her birini 0 veya 1 olarak puanla.
>    Her puan için *dosya:satır* kanıtı göster. Kanıt gösteremiyorsan
>    o madde 0'dır — "muhtemelen iyidir" diye puan verme.
> 2. **Seç.** 0 alan maddeler arasından, kullanıcının gördüğü yüzeye en çok
>    dokunanı seç. Birden fazla madde eşitse, diğerlerini engelleyeni seç
>    (örn. token birliği, tipografiden önce gelir).
> 3. **Düzelt.** Yalnızca o maddeyi düzelt. Kapsamı genişletme.
>    Görsel kimliği değiştiren bir karar gerekiyorsa (font ailesi, ana renk,
>    hero düzeni) önce sor — sessizce değiştirme.
> 4. **Doğrula.** `npm run build` uyarısız geçmeli; `npx eslint src` temiz
>    olmalı. Tarayıcıda ana sayfa + `/p-x7k9` ekran görüntüsü al ve
>    düzeltmenin görsel bir gerileme yaratmadığını **gözle** doğrula.
> 5. **Yeniden puanla.** Toplamı ve bu turda neyin değiştiğini raporla.
>
> **Durma koşulu:** 10/10'a ulaşıldığında dur. Ulaşılamıyorsa, neyin
> engellediğini tek cümleyle söyle ve dur — sonsuza kadar dönme.
>
> **Asla yapma:** rubrik puanını yükseltmek için görsel kaliteyi bozma;
> ölçüyü sağlamak uğruna erişilebilirliği düşürme; kanıtsız puan verme;
> "tutarlılık" adına kullanıcının kasıtlı tasarım tercihini ezme.

---

## RUBRİK — 10 madde, her biri 1 puan

| # | Madde | 1 puan koşulu | Nasıl ölçülür |
|---|---|---|---|
| 1 | **Token tekliği** | Hiçbir `.scss` dosyası ham hex / cubic-bezier / font adı içermez. Hiçbir token iki yerde tanımlı değildir. | `grep -rnE "#[0-9a-fA-F]{3,6}\|cubic-bezier" src --include="*.scss"` → yalnızca `_variables.scss` |
| 2 | **Tipografik ölçek** | Tüm font boyutları ölçek basamaklarından (`$fs-*`) gelir; serbest `clamp()`/px yok. | `grep -rn "font-size:" src --include="*.scss" \| grep -v "\$fs-"` → boş |
| 3 | **Font rolleri** | En fazla 3 rol: display / body / mono. Her rol tek ailede. Yüklenmeyen sistem fontu role atanmamış. | `grep -rn "font-family:" src --include="*.scss" \| grep -v "\$font-"` → yalnızca `@font-face` |
| 4 | **Boşluk ritmi** | Tüm padding/margin 4px tabanlı `$space-*` ölçeğinden. | `grep -rnE "(padding\|margin)[^:]*: *[0-9]+px"` → boş |
| 5 | **Renk & kontrast** | Metin/zemin çiftleri WCAG AA: normal metin ≥ 4.5:1, büyük metin ≥ 3:1. | Her token çifti için kontrast hesapla |
| 6 | **Hareket dili** | En fazla 2 easing eğrisi, tanımlı süre basamakları. Aynı etkileşim türü her yerde aynı süre. | `grep -rn "transition:\|animation:"` → yalnızca `$dur-*` + `$ease-*` |
| 7 | **Erişilebilirlik** | Odak halkası hiçbir yerde iptal edilmemiş; `prefers-reduced-motion` public **ve** admin'de karşılanmış; etkileşimli öğelerin erişilebilir adı var. | `grep -rn "outline: *none"` → odak bağlamında boş |
| 8 | **CSS kapsamı** | Global ad alanında bileşen sınıfı yok; iki bileşen aynı sınıfı farklı anlamda kullanmıyor; ölü CSS yok. | Her global sınıfın JS'te kullanımını doğrula |
| 9 | **Responsive tutarlılık** | Tek kırılım kümesi (`$bp-sm/md/lg/xl`); aynı bileşen farklı bölümlerde farklı kırılımda değişmiyor. | `grep -rn "width: [0-9]*px)"` → `#{}` dışı boş |
| 10 | **Yapı sağlığı** | `npm run build` **uyarısız** (Sass deprecation dahil), eslint temiz, `@use` tekdüze. | `npm run build`, `npx eslint src` |

**Puanlama:** her madde 0 veya 1. Kısmi puan yok — "çoğunlukla tutarlı" 0'dır.

---

## Puan geçmişi

| Tur | Puan | Bu turda kapatılan |
|---|---|---|
| 0 (başlangıç) | **2/10** | — yalnızca 5 (kontrast, kısmen) ve 9 geçiyordu; 1,2,3,4,6,7,8,10 başarısız |
| 1 | **7/10** | 1 token tekliği · 3 font rolleri · 8 CSS kapsamı · 9 responsive · 10 yapı sağlığı |
| 2 | **9/10** | 2 tipografik ölçek · 4 boşluk ritmi · 6 hareket dili |
| 3 | **10/10** | 5 kontrast (4 başarısız çift düzeltildi) · 7 erişilebilirlik (odak halkası) |

### Tur 3 — kontrast ve odak bulguları

Ölçülen ve düzeltilen gerçek hatalar:

| Çift | Önce | Sonra | Düzeltme |
|---|---|---|---|
| Form placeholder / beyaz | 2.36:1 ❌ | 4.58:1 ✅ | opaklık 0.55 → 0.88 |
| Admin `$a-muted` / `$a-surface2` | 3.45:1 ❌ | 4.54:1 ✅ | alfa 0.40 → 0.50 |
| Başarı mesajı / kendi %8 zemini | 2.09:1 ❌ | 4.55:1 ✅ | `#34c759` → `#217f39` |
| Hata mesajı / kendi %8 zemini | 3.18:1 ❌ | 4.55:1 ✅ | `#ff3b30` → `#da0c00` |

**Odak halkası (madde 7).** Contact form girdileri klavyeyle gezildiğinde
`:focus-visible` eşleşiyor ama hiçbir halka görünmüyordu. İki neden birlikte
çalışıyordu: taban kuraldaki `outline: none` özgüllüğü (0,2,1) global
`*:focus-visible` kuralından (0,1,0) yüksekti **ve** `.glass-wrap`
`overflow: hidden` olduğu için girdinin kendi halkası zaten kırpılırdı.
Halka sarmalayıcıya taşındı (`.glass-wrap:has(:focus-visible)`), tarayıcıda
gerçek Tab tuşuyla doğrulandı.

---

## Bu turlarda ayrıca düzeltilen davranış hataları

Rubrik dışıydılar ama tutarlılık turu sırasında ortaya çıktılar:

1. **Bölüm en alta gelince yeniden yükleniyor gibi görünüyordu.**
   `.page-section.active .container { animation: sectionFadeIn }` — `active`
   sınıfı scroll konumuna göre eklenip kaldırıldığı için CSS animasyonu her
   aktifleşmede baştan başlıyordu.
2. **About her yeniden girişte tekrar animasyon oynatıyordu.**
   `useInView(..., { once: false })` hem ortam animasyonunu duraklatmak hem de
   giriş animasyonunu tetiklemek için kullanılıyordu. İki sinyal ayrıldı:
   canlı `isInView` (duraklatma) + tek seferlik `hasEntered` (giriş).
3. **Contact formu scroll'da görünüm değiştiriyordu.** `useNarrowViewport`
   scroll sırasında cam efektini sadeye düşürüp geri alıyordu; her scroll'da
   "sade → cam" geçişi bölüm yeniden yükleniyormuş izlenimi veriyordu.
   Ayrıca dinleyici `setTimeout(500)` içinde eklenip temizlikte hemen
   kaldırılmaya çalışılıyordu (sızıntı).
4. **Sıvı dalga gerçekçi değildi.** Tek bir sinüs (`v[i] += sin(i*0.1 + t*0.5)`)
   doğrudan hız dizisine pompalanıyor, üstelik yay sistemi çok az sönümlüydü
   (`DAMP 0.992`) — sonuç lastik/jelatin bir yüzeydi. Ortam hareketi analitik
   çok katmanlı kabarmaya taşındı (farklı dalga boyu/hız, biri ters yönde →
   girişim), çözünürlük 56 → 96 kolona çıkarıldı, sönümleme suya yaklaştırıldı
   ve yüzeye paralaks arka katman + eğime göre değişen tepe ışığı eklendi.

### Tur 0 — başlangıç durumunun kanıtı

- Madde 1 — admin token bloğu **6 dosyada birebir kopya**
  (`Login.scss`, `Dashboard.scss`, `AdminLayout.scss`, `ConfirmDialog.scss`,
  `ImageUploader.scss`, `PortfolioManager.scss`).
- Madde 2 — About `clamp(2.5rem,6vw,60px)` ile Contact `clamp(2rem,5vw,48px)`
  aynı görevdeki başlıklar için farklı ölçek.
- Madde 3 — Home `'Impact'` (yüklenmeyen sistem fontu), diğer bölümler
  `'Coolvetica'`; ayrıca `'Arial Black'` dördüncü bir rol olarak.
- Madde 6 — üç easing (`0.4,0,0.2,1`, `0.16,1,0.3,1`, düz `ease`) ve
  ölçeksiz on-üstü süre.
- Madde 7 — `Contact/index.scss` `.flat-button:focus-visible { outline: none }`
  ile global odak halkasını iptal ediyordu; admin'de `prefers-reduced-motion`
  hiç yoktu.
- Madde 8 — `index.scss` içindeki global `.dashboard { margin-top: 200px }`
  admin panelinin `.dashboard`'ıyla çakışıyordu; `.scroll-animate*` sınıfları
  hiçbir JS dosyasında kullanılmıyordu (ölü CSS).
- Madde 9 — Home 960px, Contact 1200px, diğerleri 1024px'te kırılıyordu.
- Madde 10 — Sass `@import` deprecation uyarıları her derlemede.
