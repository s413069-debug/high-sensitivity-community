// Firebase 設定完成後，討論區才會連線。未設定時，介紹頁仍可正常使用。
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, where, orderBy, serverTimestamp, doc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

// 第一次設定時，將 Firebase Console 提供的設定貼在下方引號內。
const firebaseConfig = {
  apiKey: "請替換成你的_API_KEY",
  authDomain: "請替換成你的專案.firebaseapp.com",
  projectId: "請替換成你的專案_ID",
  storageBucket: "請替換成你的專案.firebasestorage.app",
  messagingSenderId: "請替換成你的_SENDER_ID",
  appId: "請替換成你的_APP_ID"
};

const configured = firebaseConfig.apiKey !== "請替換成你的_API_KEY" &&
                   firebaseConfig.projectId !== "請替換成你的專案_ID";
const $ = (id) => document.getElementById(id);
const postList = $("postList");
let db = null, auth = null, currentPosts = [];

$("menuToggle").addEventListener("click", () => $("mainNav").classList.toggle("open"));
$("mainNav").querySelectorAll("a").forEach(a => a.addEventListener("click", () => $("mainNav").classList.remove("open")));

function showStatus(message, error=false) {
  $("postStatus").textContent = message;
  $("postStatus").style.color = error ? "#a34f43" : "#71806e";
}
function escapeHtml(value="") {
  return String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
function formatDate(ts) {
  if (!ts?.toDate) return "剛剛";
  return new Intl.DateTimeFormat("zh-TW",{year:"numeric",month:"2-digit",day:"2-digit"}).format(ts.toDate());
}

async function startFirebase() {
  if (!configured) {
    postList.innerHTML = '<div class="empty-state">討論區尚未連接雲端資料庫。請先完成網站設定教學中的 Firebase 步驟。</div>';
    showStatus("目前是展示模式；完成 Firebase 設定後才能送出文章。", true);
    return;
  }
  try {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    await signInAnonymously(auth);
    await loadPosts();
  } catch (err) {
    console.error(err);
    postList.innerHTML = '<div class="empty-state">目前無法連接討論區。請檢查 Firebase 設定、匿名登入與 Firestore 規則。</div>';
    showStatus("連線失敗，請檢查 Firebase 設定。", true);
  }
}

async function loadPosts() {
  if (!db) return;
  postList.innerHTML = '<div class="empty-state">正在載入分享……</div>';
  try {
    const q = query(collection(db,"posts"), where("status","==","approved"), orderBy("createdAt","desc"));
    const snap = await getDocs(q);
    currentPosts = snap.docs.map(d => ({id:d.id,...d.data()}));
    renderPosts();
  } catch (err) {
    console.error(err);
    postList.innerHTML = '<div class="empty-state">讀取失敗。若 Firebase 顯示需要建立索引，請依錯誤訊息中的連結建立索引。</div>';
  }
}

function renderPosts() {
  const filter = $("categoryFilter").value;
  const posts = currentPosts.filter(p => !filter || p.category === filter);
  if (!posts.length) {
    postList.innerHTML = '<div class="empty-state">目前還沒有公開文章。你可以成為第一位分享者。</div>';
    return;
  }
  postList.innerHTML = posts.map(p => `
    <article class="post-card">
      <div class="post-meta"><span>${escapeHtml(p.nickname)} · ${formatDate(p.createdAt)}</span><span class="post-category">${escapeHtml(p.category)}</span></div>
      <h4>${escapeHtml(p.title)}</h4><p>${escapeHtml(p.body)}</p>
      <div class="comments" id="comments-${p.id}"><div class="comment-item">留言功能載入中……</div></div>
      <form class="comment-form" data-post="${p.id}">
        <input name="nickname" maxlength="20" required placeholder="暱稱">
        <input name="body" maxlength="500" required placeholder="寫下友善的回應">
        <button type="submit">送出</button>
      </form>
    </article>`).join("");
  posts.forEach(loadComments);
  postList.querySelectorAll(".comment-form").forEach(form => form.addEventListener("submit", submitComment));
}

async function loadComments(post) {
  const target = $(`comments-${post.id}`);
  try {
    const q = query(collection(db,"posts",post.id,"comments"), where("status","==","approved"), orderBy("createdAt","asc"));
    const snap = await getDocs(q);
    const comments = snap.docs.map(d => d.data());
    target.innerHTML = comments.length ? comments.map(c => `<div class="comment-item"><b>${escapeHtml(c.nickname)}：</b>${escapeHtml(c.body)}</div>`).join("") : '<div class="comment-item">還沒有公開留言。</div>';
  } catch (e) {
    console.error(e);
    target.innerHTML = '<div class="comment-item">留言暫時無法載入。</div>';
  }
}

$("postForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!db || !auth?.currentUser) return showStatus("討論區尚未設定完成，現在無法送出。", true);
  const nickname = $("nickname").value.trim(), title = $("postTitle").value.trim(), body = $("postBody").value.trim();
  if (!nickname || !title || !body) return showStatus("請填寫暱稱、標題和分享內容。", true);
  if (/(電話|手機|住址|地址|學校名稱|身分證)/.test(body)) {
    if (!confirm("內容可能包含個人資料相關字詞。請再次確認沒有留下真實姓名、電話、住址、學校或其他可辨識資訊。仍要送出嗎？")) return;
  }
  try {
    await addDoc(collection(db,"posts"), {nickname, title, body, category:$("category").value, status:"pending", createdAt:serverTimestamp(), uid:auth.currentUser.uid});
    $("postForm").reset();
    showStatus("文章已送出！管理者審核通過後，就會出現在討論區。");
  } catch (err) {
    console.error(err); showStatus("送出失敗，請稍後再試。", true);
  }
});

async function submitComment(event) {
  event.preventDefault();
  if (!db || !auth?.currentUser) return;
  const form = event.currentTarget, nickname = form.elements.nickname.value.trim(), body = form.elements.body.value.trim();
  if (!nickname || !body) return;
  try {
    await addDoc(collection(db,"posts",form.dataset.post,"comments"), {nickname, body, status:"pending", createdAt:serverTimestamp(), uid:auth.currentUser.uid});
    form.reset();
    alert("留言已送出，管理者審核後會公開。");
  } catch (err) { console.error(err); alert("留言送出失敗，請稍後再試。"); }
}

$("refreshPosts").addEventListener("click", loadPosts);
$("categoryFilter").addEventListener("change", renderPosts);
startFirebase();
