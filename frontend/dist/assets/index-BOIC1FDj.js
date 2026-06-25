(function(){const r=document.createElement("link").relList;if(r&&r.supports&&r.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))t(a);new MutationObserver(a=>{for(const s of a)if(s.type==="childList")for(const i of s.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&t(i)}).observe(document,{childList:!0,subtree:!0});function n(a){const s={};return a.integrity&&(s.integrity=a.integrity),a.referrerPolicy&&(s.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?s.credentials="include":a.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function t(a){if(a.ep)return;a.ep=!0;const s=n(a);fetch(a.href,s)}})();const D=new Date().toISOString().slice(0,10),y=[{id:"C107-1",name:"コミックマーケット107 1日目",startAt:`${D}T10:00:00`,genre:"総合"},{id:"C107-2",name:"コミックマーケット107 2日目",startAt:"2024-12-30T10:00:00",genre:"総合"},{id:"URC-03",name:"うらのほうのサークル03",startAt:"2024-11-03T11:00:00",genre:"東方"}];let j=10;const u=[{id:"1",eventId:"C107-1",hall:"東7",block:"F",number:"4",sub:"b",announcement:"https://x.com/hoge/status/example",author:"https://x.com/hoge",circleName:"大ケヤキのその先へ",price:500,genre:"AB",priority:1,memo:"",purchased:!1,actualAmount:0},{id:"2",eventId:"C107-1",hall:"東7",block:"G",number:"12",sub:"a",announcement:"",author:"https://x.com/example2",circleName:"サンプルサークル",price:1e3,genre:"オリジナル",priority:2,memo:"新刊あり",purchased:!1,actualAmount:0},{id:"3",eventId:"C107-1",hall:"西",block:"め",number:"25",sub:"",announcement:"",author:"",circleName:"テストサークル",price:800,genre:"AB",priority:3,memo:"",purchased:!1,actualAmount:0},{id:"4",eventId:"C107-1",hall:"東1",block:"A",number:"3",sub:"b",announcement:"",author:"",circleName:"取消サークル",price:600,genre:"オリジナル",priority:-1,memo:"欠席",purchased:!1,actualAmount:0},{id:"5",eventId:"C107-2",hall:"東1",block:"A",number:"1",sub:"a",announcement:"",author:"",circleName:"別日サークル",price:800,genre:"東方",priority:1,memo:"",purchased:!1,actualAmount:0},{id:"6",eventId:"URC-03",hall:"",block:"2",number:"21",sub:"",announcement:"",author:"",circleName:"ウラサークル",price:300,genre:"東方",priority:2,memo:"",purchased:!1,actualAmount:0}],v=e=>new Promise(r=>setTimeout(r,e));function O(e,r,n,t,a){return u.find(s=>s.eventId===e&&s.hall===r&&s.block===n&&s.number===t&&s.sub===a)??null}const c={async getEvents(){return await v(80),[...y]},async addEvent(e){await v(80);const r=y.findIndex(n=>n.id===e.id);return r>=0?y[r]=e:y.push(e),e},async getRecords(e){return await v(80),u.filter(r=>r.eventId===e).map(r=>({...r}))},async addRecord(e){await v(80);const r=O(e.eventId,e.hall,e.block,e.number,e.sub);if(r)return{duplicate:{...r}};const n={id:String(++j),purchased:!1,actualAmount:0,...e};return u.push(n),{duplicate:null,record:n}},async overwriteRecord(e,r){await v(80);const n=u.findIndex(a=>a.id===e);if(n<0)throw new Error(`Record ${e} not found`);const t=u[n];return u[n]={...t,...r},{...u[n]}},async updateRecord(e,r){await v(80);const n=u.findIndex(t=>t.id===e);if(n<0)throw new Error(`Record ${e} not found`);return u[n]={...u[n],...r},{...u[n]}},async getGenres(){return await v(40),[...new Set(u.map(e=>e.genre).filter(Boolean))]}};function o(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function L(e){try{const r=new URL(e);return r.protocol==="http:"||r.protocol==="https:"?r.href:null}catch{return null}}function p(e){return e===0?"-":`¥${e.toLocaleString()}`}function b(e){return[e.hall,e.block,e.number,e.sub].filter(Boolean).join("-")}function H(e){return e===-1?"取消":e===0?"不明":String(e)}function A(e){return e===-1?"p-cancel":e===0?"p-0":`p-${e}`}function P(e){return new Date(e).toLocaleString("ja-JP",{year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"})}function I(e){return e===-1?99:e===0?98:e}function k(e,r,n){return[...e].sort((t,a)=>{let s=0;switch(r){case"coord":s=b(t).localeCompare(b(a),"ja");break;case"priority":s=I(t.priority)-I(a.priority);break;case"circleName":s=t.circleName.localeCompare(a.circleName,"ja");break;case"price":s=t.price-a.price;break;case"genre":s=t.genre.localeCompare(a.genre,"ja");break}return n==="asc"?s:-s})}function S(e){const r=e.filter(a=>a.price>0&&a.priority!==-1),n=r.reduce((a,s)=>a+s.price,0),t=new Map;for(const a of r)t.set(a.priority,(t.get(a.priority)??0)+a.price);return{totalBudget:n,byPriority:t}}let $="priority",g="asc",d=[];async function U(e){e.innerHTML='<p class="loading">読み込み中...</p>';const r=await c.getEvents(),n=new Date().toISOString().slice(0,10),t=r.find(a=>a.startAt.slice(0,10)===n);if(!t){e.innerHTML=`
      <div class="card">
        <div class="empty">
          <p>本日開催のイベントはありません</p>
          <p style="margin-top:0.5rem;font-size:0.82rem">閲覧タブから過去イベントを確認できます</p>
        </div>
      </div>`;return}d=await c.getRecords(t.id),e.innerHTML=`
    <div class="card" style="margin-bottom:0.75rem">
      <div class="event-title">${o(t.name)}</div>
      <div class="event-meta">${new Date(t.startAt).toLocaleString("ja-JP")} &nbsp;·&nbsp; ${o(t.genre)}</div>
    </div>
    <div id="today-stats" class="stats"></div>
    <div class="card" style="padding:0;overflow:hidden">
      <div id="today-table"></div>
    </div>`,F(),N()}function F(){const e=document.getElementById("today-stats");if(!e)return;const{totalBudget:r}=S(d),n=d.filter(a=>a.purchased).length,t=d.filter(a=>a.purchased).reduce((a,s)=>a+s.actualAmount,0);e.innerHTML=`
    <div class="stat-box"><div class="stat-label">総予算</div><div class="stat-value" data-stat="budget">${p(r)}</div></div>
    <div class="stat-box"><div class="stat-label">購入済</div><div class="stat-value" data-stat="purchased">${n} / ${d.length}</div></div>
    <div class="stat-box"><div class="stat-label">使用金額</div><div class="stat-value" data-stat="used">${p(t)}</div></div>`}function M(){const{totalBudget:e}=S(d),r=d.filter(l=>l.purchased).length,n=d.filter(l=>l.purchased).reduce((l,m)=>l+m.actualAmount,0),t=l=>document.querySelector(`[data-stat="${l}"]`),a=t("budget");a&&(a.textContent=p(e));const s=t("purchased");s&&(s.textContent=`${r} / ${d.length}`);const i=t("used");i&&(i.textContent=p(n))}function N(){const e=document.getElementById("today-table");if(!e)return;const r=k(d,$,g),n=t=>t===$?`sort-${g}`:"";e.innerHTML=`
    <div class="table-wrap" style="border:none;border-radius:0">
      <table>
        <thead>
          <tr>
            <th data-sort="coord" class="${n("coord")}">座標</th>
            <th data-sort="circleName" class="${n("circleName")}">サークル名</th>
            <th data-sort="priority" class="${n("priority")}">優先</th>
            <th data-sort="price" class="${n("price")}">予算</th>
            <th class="no-sort">購入</th>
            <th class="no-sort">実費</th>
            <th data-sort="genre" class="${n("genre")}">ジャンル</th>
            <th class="no-sort">メモ</th>
          </tr>
        </thead>
        <tbody>
          ${r.map(t=>{const a=L(t.author),s=L(t.announcement),i=a?`<a class="link" href="${o(a)}" target="_blank" rel="noopener">${o(t.circleName)}</a>`:o(t.circleName),l=s?` <a class="link" href="${o(s)}" target="_blank" rel="noopener" title="告知ページ">↗</a>`:"";return`
            <tr class="${t.priority===-1?"row-cancelled":""} ${t.purchased?"row-purchased":""}" data-id="${o(t.id)}">
              <td class="coord">${o(b(t))}</td>
              <td>${i}${l}</td>
              <td><span class="badge ${A(t.priority)}">${H(t.priority)}</span></td>
              <td>${p(t.price)}</td>
              <td><input type="checkbox" data-id="${o(t.id)}" data-action="toggle" ${t.purchased?"checked":""}></td>
              <td><input type="number" class="amount-input" data-id="${o(t.id)}" data-action="amount" value="${t.actualAmount||""}" min="0" placeholder="0"></td>
              <td>${o(t.genre)}</td>
              <td style="max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${o(t.memo)}">${o(t.memo)}</td>
            </tr>`}).join("")}
        </tbody>
      </table>
    </div>`,e.querySelectorAll("th[data-sort]").forEach(t=>{t.addEventListener("click",()=>{const a=t.dataset.sort;$===a?g=g==="asc"?"desc":"asc":($=a,g="asc"),N()})}),e.querySelectorAll('input[data-action="toggle"]').forEach(t=>{t.addEventListener("change",async()=>{const a=t.dataset.id,s=t.checked;await c.updateRecord(a,{purchased:s});const i=d.findIndex(m=>m.id===a);if(i<0)return;d[i]={...d[i],purchased:s};const l=e.querySelector(`tr[data-id="${CSS.escape(a)}"]`);l&&l.classList.toggle("row-purchased",s),M()})}),e.querySelectorAll('input[data-action="amount"]').forEach(t=>{t.addEventListener("change",async()=>{const a=t.dataset.id,s=Math.max(0,parseInt(t.value)||0);t.value=s?String(s):"",await c.updateRecord(a,{actualAmount:s});const i=d.findIndex(l=>l.id===a);i>=0&&(d[i]={...d[i],actualAmount:s}),M()})})}let w="priority",h="asc",f=[];async function _(e){e.innerHTML='<p class="loading">読み込み中...</p>';const r=await c.getEvents();if(r.length===0){e.innerHTML='<div class="card"><div class="empty">イベントが登録されていません。<br>イベントタブから追加してください。</div></div>';return}const n=r[0].id;e.innerHTML=`
    <div class="card" style="margin-bottom:0.75rem">
      <div class="card-title">イベント選択</div>
      <select id="event-select">
        ${r.map(a=>`<option value="${o(a.id)}">${o(a.id)} — ${o(a.name)}</option>`).join("")}
      </select>
    </div>
    <div id="browse-stats" class="stats"></div>
    <div id="browse-table-wrap" class="card" style="padding:0;overflow:hidden"></div>`;const t=document.getElementById("event-select");t.addEventListener("change",()=>x(t.value)),await x(n)}async function x(e){const r=document.getElementById("browse-stats"),n=document.getElementById("browse-table-wrap");!r||!n||(r.innerHTML='<p class="loading" style="padding:0.5rem">読み込み中...</p>',n.innerHTML="",f=await c.getRecords(e),K(r),C(n))}function K(e){const{totalBudget:r,byPriority:n}=S(f),t=[1,2,3,4].filter(a=>n.has(a)).map(a=>`<div class="stat-box"><div class="stat-label">優先度 ${a}</div><div class="stat-value">${p(n.get(a))}</div></div>`).join("");e.innerHTML=`
    <div class="stat-box"><div class="stat-label">総予算（有効）</div><div class="stat-value">${p(r)}</div></div>
    <div class="stat-box"><div class="stat-label">件数</div><div class="stat-value">${f.length}</div></div>
    ${t}`}function C(e){if(f.length===0){e.innerHTML='<div class="empty">レコードがありません</div>';return}const r=k(f,w,h),n=t=>t===w?`sort-${h}`:"";e.innerHTML=`
    <div class="table-wrap" style="border:none;border-radius:0">
      <table>
        <thead>
          <tr>
            <th data-sort="coord" class="${n("coord")}">座標</th>
            <th data-sort="circleName" class="${n("circleName")}">サークル名</th>
            <th class="no-sort">告知</th>
            <th data-sort="priority" class="${n("priority")}">優先</th>
            <th data-sort="price" class="${n("price")}">予算</th>
            <th data-sort="genre" class="${n("genre")}">ジャンル</th>
            <th class="no-sort">メモ</th>
          </tr>
        </thead>
        <tbody>
          ${r.map(t=>{const a=L(t.author),s=L(t.announcement),i=a?`<a class="link" href="${o(a)}" target="_blank" rel="noopener">${o(t.circleName)}</a>`:o(t.circleName),l=s?`<a class="link" href="${o(s)}" target="_blank" rel="noopener">↗</a>`:"-";return`
            <tr class="${t.priority===-1?"row-cancelled":""}">
              <td class="coord">${o(b(t))}</td>
              <td>${i}</td>
              <td>${l}</td>
              <td><span class="badge ${A(t.priority)}">${H(t.priority)}</span></td>
              <td>${p(t.price)}</td>
              <td>${o(t.genre)}</td>
              <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${o(t.memo)}">${o(t.memo)}</td>
            </tr>`}).join("")}
        </tbody>
      </table>
    </div>`,e.querySelectorAll("th[data-sort]").forEach(t=>{t.addEventListener("click",()=>{const a=t.dataset.sort;w===a?h=h==="asc"?"desc":"asc":(w=a,h="asc"),C(e)})})}async function G(e){e.innerHTML='<p class="loading">読み込み中...</p>';const[r,n]=await Promise.all([c.getEvents(),c.getGenres()]);if(r.length===0){e.innerHTML=`
      <div class="card">
        <div class="empty">
          イベントが登録されていません。<br>
          <a class="link" href="#/events">イベントタブ</a>から先に追加してください。
        </div>
      </div>`;return}e.innerHTML=`
    <div id="register-alert"></div>
    <div class="card">
      <div class="card-title">サークル登録</div>
      <form id="register-form" autocomplete="off">
        <div class="form-grid">
          <div class="form-group full">
            <label>イベントID</label>
            <select name="eventId">
              ${r.map(s=>`<option value="${o(s.id)}">${o(s.id)} — ${o(s.name)}</option>`).join("")}
            </select>
          </div>

          <div class="form-group full">
            <label>サークルスペース座標</label>
            <div class="coord-grid">
              <div>
                <label>ホール</label>
                <input name="hall" placeholder="例: 東7">
              </div>
              <div>
                <label>枠</label>
                <input name="block" placeholder="例: F">
              </div>
              <div>
                <label>番</label>
                <input name="number" placeholder="例: 4">
              </div>
              <div>
                <label>補</label>
                <input name="sub" placeholder="例: b">
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>サークル名</label>
            <input name="circleName" placeholder="サークル名">
          </div>

          <div class="form-group">
            <label>優先度</label>
            <select name="priority" class="priority-select">
              <option value="-1">-1: 取消</option>
              <option value="0">0: 不明</option>
              <option value="1" selected>1: 最優先</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4: 低</option>
            </select>
          </div>

          <div class="form-group">
            <label>予算 (円)</label>
            <input name="price" type="number" min="0" placeholder="0 = 未設定">
          </div>

          <div class="form-group">
            <label>ジャンル</label>
            <input name="genre" list="genre-list" placeholder="例: 東方">
            <datalist id="genre-list">
              ${n.map(s=>`<option value="${o(s)}">`).join("")}
            </datalist>
          </div>

          <div class="form-group full">
            <label>告知URL</label>
            <input name="announcement" type="url" placeholder="https://...">
          </div>

          <div class="form-group full">
            <label>作者URL</label>
            <input name="author" type="url" placeholder="https://...">
          </div>

          <div class="form-group full">
            <label>メモ</label>
            <textarea name="memo" placeholder="メモ（任意）"></textarea>
          </div>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary">登録</button>
          <button type="reset" class="btn btn-secondary">クリア</button>
        </div>
      </form>
    </div>`;const t=document.getElementById("register-form"),a=document.getElementById("register-alert");t.addEventListener("submit",async s=>{s.preventDefault(),a.innerHTML="";const i=new FormData(t),l={eventId:String(i.get("eventId")??""),hall:String(i.get("hall")??"").trim(),block:String(i.get("block")??"").trim(),number:String(i.get("number")??"").trim(),sub:String(i.get("sub")??"").trim(),circleName:String(i.get("circleName")??"").trim(),priority:parseInt(String(i.get("priority")??"0")),price:Math.max(0,parseInt(String(i.get("price")??"0"))||0),genre:String(i.get("genre")??"").trim(),announcement:String(i.get("announcement")??"").trim(),author:String(i.get("author")??"").trim(),memo:String(i.get("memo")??"").trim()},m=await c.addRecord(l);if(m.duplicate){J(l,m.duplicate,t,a);return}a.innerHTML=`<div class="alert alert-success">登録しました: ${o(l.circleName||"(名前なし)")}</div>`,t.reset()})}function J(e,r,n,t){const a=document.createElement("div");a.className="modal-overlay",a.innerHTML=`
    <div class="modal">
      <h3>重複レコードの検出</h3>
      <p>同一イベント内に同じ座標のレコードが存在します。上書きしますか？</p>
      <div class="modal-detail">
        <div><strong>座標:</strong> ${o(b(r))}</div>
        <div><strong>サークル名:</strong> ${o(r.circleName)}</div>
        <div><strong>優先度:</strong> ${r.priority} &nbsp; <strong>予算:</strong> ¥${r.price}</div>
      </div>
      <div class="modal-actions">
        <button class="btn btn-secondary" id="modal-cancel">キャンセル</button>
        <button class="btn btn-danger" id="modal-overwrite">上書きする</button>
      </div>
    </div>`,document.body.appendChild(a),a.querySelector("#modal-cancel").addEventListener("click",()=>a.remove()),a.querySelector("#modal-overwrite").addEventListener("click",async()=>{a.remove(),await c.overwriteRecord(r.id,e),t.innerHTML=`<div class="alert alert-success">上書き登録しました: ${o(e.circleName||"(名前なし)")}</div>`,n.reset()})}async function W(e){e.innerHTML='<p class="loading">読み込み中...</p>';const r=await c.getEvents();e.innerHTML="",R(e,r),z(e)}function R(e,r){const n=document.createElement("div");n.id="event-list",n.innerHTML=`
    <div class="card" style="padding:0;overflow:hidden;margin-bottom:1rem">
      ${r.length===0?'<div class="empty">イベントが登録されていません</div>':`<div class="table-wrap" style="border:none;border-radius:0">
            <table>
              <thead>
                <tr>
                  <th class="no-sort">イベントID</th>
                  <th class="no-sort">イベント名</th>
                  <th class="no-sort">開催日時</th>
                  <th class="no-sort">ジャンル</th>
                </tr>
              </thead>
              <tbody>
                ${r.map(t=>`
                  <tr>
                    <td><code>${o(t.id)}</code></td>
                    <td>${o(t.name)}</td>
                    <td>${P(t.startAt)}</td>
                    <td>${o(t.genre)}</td>
                  </tr>`).join("")}
              </tbody>
            </table>
          </div>`}
    </div>`,e.appendChild(n)}function z(e){const r=document.createElement("div");r.innerHTML=`
    <div id="event-alert"></div>
    <div class="card">
      <div class="card-title">イベント追加</div>
      <form id="event-form" autocomplete="off">
        <div class="form-grid">
          <div class="form-group">
            <label>イベントID <span style="color:#c92a2a">*</span></label>
            <input name="id" placeholder="例: C107-1" required>
          </div>
          <div class="form-group">
            <label>イベント名 <span style="color:#c92a2a">*</span></label>
            <input name="name" placeholder="例: コミックマーケット107 1日目" required>
          </div>
          <div class="form-group">
            <label>開催日時 <span style="color:#c92a2a">*</span></label>
            <input name="startAt" type="datetime-local" required>
          </div>
          <div class="form-group">
            <label>イベントジャンル</label>
            <input name="genre" placeholder="例: 総合, 東方">
          </div>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary">追加</button>
          <button type="reset" class="btn btn-secondary">クリア</button>
        </div>
      </form>
    </div>`,e.appendChild(r);const n=r.querySelector("#event-form"),t=r.querySelector("#event-alert");n.addEventListener("submit",async a=>{a.preventDefault(),t.innerHTML="";const s=new FormData(n),i={id:String(s.get("id")??"").trim(),name:String(s.get("name")??"").trim(),startAt:String(s.get("startAt")??""),genre:String(s.get("genre")??"").trim()};if(!i.id||!i.name||!i.startAt){t.innerHTML='<div class="alert alert-error">必須項目を入力してください</div>';return}await c.addEvent(i),t.innerHTML=`<div class="alert alert-success">追加しました: ${o(i.id)}</div>`,n.reset();const l=await c.getEvents(),m=document.getElementById("event-list");if(m){const T=document.createElement("div");R(T,l),m.replaceWith(T.firstElementChild)}})}const B={today:U,browse:_,register:G,events:W},V=document.querySelector("nav"),E=document.getElementById("app");function Q(){const e=location.hash.slice(2);return e in B?e:"today"}function q(){const e=Q();V.querySelectorAll("a").forEach(r=>{r.classList.toggle("active",r.dataset.route===e)}),E.innerHTML="",B[e](E).catch(r=>{E.innerHTML=`<div class="card"><p class="alert alert-error">エラー: ${r.message}</p></div>`})}window.addEventListener("hashchange",q);q();
