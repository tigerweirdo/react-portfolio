# Gorev Kaydi

- 2025-10-31: Portfolyo bolumunde dikey scroll hareketini yatay kaydirma hijack mantigina donusturmek icin yatay kaydirma dinleyicisi ve stiller eklendi.

- 2025-01-XX: Contact me bolumune mesaj gonderildiginde temmuzcetiner@gmail.com adresine mesaj gitmesi icin gizli input alani eklendi. EmailJS template'inde "To Email" alaninda {{to_email}} degiskeni kullanilmasi gerekiyor. EmailJS init fonksiyonu eklendi ve localhost'tan da test edilebilir hale getirildi. Hata ayiklama icin console.log'lar eklendi.

- 2025-01-XX: Contact me input alanlarinda focus animasyonu sorunu duzeltildi. li elementlerinde overflow: hidden yerine overflow: visible yapildi, padding eklendi, transform-origin center yapildi ve focus durumunda box-shadow eklendi. Boylece input'lar buyurken kesilmiyor ve border'lar gorunuyor.

- 2025-01-XX: Contact me basari mesaji ("Your message has been sent successfully!") 3 saniye sonra otomatik olarak kaybolacak sekilde timeout eklendi. Mesaj kaybolurken yapinin uzayip kismamasi icin AnimatePresence ve height animasyonu eklendi. Boylece layout shift olmadan yumusak bir gecis saglandi.

- 2025-01-XX: Contact me basari mesaji genel yapiyi bozmaması icin duzeltildi. Mesaj form icinde, butonun hemen altinda sabit bir alanda (height: 60px) gosteriliyor. Mesaj her zaman render ediliyor (gorunmediginde bos bir alan olarak), bu sayede form hicbir zaman buyuyup kuculmuyor. Height animasyonu kaldirildi, yerine sadece opacity ve y pozisyonu animasyonu kullaniliyor. Bu sayede layout shift olmadan mesaj gosteriliyor ve genel yapi tamamen korunuyor.

- 2025-01-XX: Vercel deployment icin Node.js versiyonu 22.x'e yukseltildi. package.json dosyasina "engines" alani eklendi (node >=22.0.0, npm >=10.0.0) ve .nvmrc dosyasi olusturuldu (22). Bu sayede Vercel otomatik olarak Node.js 22.x kullanacak.

