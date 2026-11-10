高敏感交流所｜初學者免費發布教學
================================

網站檔案
--------
index.html       網站內容
style.css        自然療癒風格
app.js           Firebase 文章、留言功能
firestore.rules  資料庫安全規則

重要：網站外觀可先預覽；要讓文章與留言真正保存，必須完成 Firebase 設定。
本方案以 Firebase Spark 免費方案 + GitHub Pages 為目標，不需啟用付費 Blaze 方案。
Google/Firebase 的註冊政策、免費額度可能調整；建立專案時請確認仍可選 Spark。
不要輸入信用卡，也不要升級 Blaze。

A. 建立 Firebase 專案
---------------------
1. 前往 https://console.firebase.google.com/ ，使用 Google 帳號登入。
2. 建立專案，例如 gentle-space-hsp。Google Analytics 可先選擇關閉。
3. 專案建立後，點選 Web（</>）圖示新增網頁應用程式，名稱填「高敏感交流所」。
4. Firebase 會顯示 firebaseConfig。複製 apiKey、authDomain、projectId、
   storageBucket、messagingSenderId、appId 六個欄位。
5. 用文字編輯器開啟 app.js，把 firebaseConfig 裡的「請替換……」文字換成
   Firebase 提供的實際值。保留引號與逗號，不要把整段設定貼到公開討論區。
6. Firebase 左側 Authentication → Get started → Sign-in method，
   啟用 Anonymous（匿名）登入。
7. Firebase 左側 Firestore Database → Create database。
   選 Production mode，選擇離使用者較近的地區；資料庫位置建立後通常不能更改。
8. 建立後打開 Firestore → Rules，把本資料夾 firestore.rules 全文貼上，
   按 Publish。不要使用「允許所有人讀寫」的測試規則。

B. 發布到 GitHub Pages
---------------------
1. 前往 https://github.com/ 建立免費帳號並登入。
2. 右上角 + → New repository。
3. Repository name 填 gentle-space-hsp；選 Public；建立 repository。
4. 點 Add file → Upload files，把 index.html、style.css、app.js 三個檔案
   拖進去（firestore.rules 可留作管理用，不必放網站根目錄）。
5. 按 Commit changes。
6. 開啟 repository 的 Settings → Pages。
7. Build and deployment 選 Deploy from a branch。
8. Branch 選 main，資料夾選 /(root)，按 Save。
9. 等待部署完成，頁面會提供 https://你的GitHub帳號.github.io/gentle-space-hsp/
   網址。把網址傳給老師即可。
10. 若改了網站檔案，再回 repository 上傳同名新檔並 Commit changes。

C. 管理文章與留言（人工審核）
----------------------------
1. 打開 Firebase Console → Firestore Database → Data。
2. 新文章會在 posts 集合中，status 為 pending。
3. 檢查內容是否符合社群守則、沒有個資、攻擊或不適當內容。
4. 要公開時，將該文件 status 欄位改成 approved。
5. 不適合公開的內容可在 Console 刪除該文件。
6. 留言在該文章文件底下的 comments 子集合，同樣將 status 從 pending 改成 approved。
7. 定期查看與移除不當內容。不要把管理者帳號密碼交給其他人。

D. 測試
------
1. 開啟正式網站，送出一篇測試文章。
2. Firebase Firestore Data 中應出現 posts 文件，status=pending。
3. 在 Firebase Console 將該文件 status 改為 approved。
4. 回網站按「重新整理」，應該看到文章。
5. 在文章底下送出測試留言，Firebase comments 子集合應出現 pending 留言。
6. 管理者核准後，重新整理應看到留言。

常見問題
--------
- 討論區顯示尚未連接：app.js 的 firebaseConfig 還沒換成真實設定。
- 匿名登入失敗：Authentication 中沒有啟用 Anonymous。
- 權限不足：Firestore Rules 沒有正確發布，或貼錯專案。
- 查詢需要索引：開啟瀏覽器 Console 的 Firebase 錯誤連結，建立提示的索引。
- 網站 404：確認 GitHub Pages 選 main / root，且 index.html 位於 repository 最外層。
- CSS 沒套用：確認檔名是 style.css，且與 index.html 在同一層。

安全與限制
----------
- 這是初版社群，不是具備完整反垃圾、檢舉與即時客服的大型論壇。
- 匿名登入可降低註冊門檻，但不代表使用者完全匿名或絕對不會被濫用。
- 公開 Firebase 設定值本身不是資料庫安全措施；Firestore Rules 才是必要防線。
- 不要在前端放 Firebase Admin SDK 私密金鑰或服務帳號 JSON。
- 目前每篇文章、留言都要管理者在 Firebase Console 手動審核。
- 免費方案有讀寫、儲存與流量額度；請在 Firebase Usage 頁面留意用量。
- 文章與留言請勿寫入真實姓名、電話、住址、學校、社群帳號等個資。
