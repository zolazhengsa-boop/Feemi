const API="https://feemi-ai-api.vercel.app/api/chat";
const $=id=>document.getElementById(id);
const icons={"AI工具":"🤖","生活服务":"🏠","娱乐影音":"▶️","金融理财":"💳"};
let filter="全部", editId=null;
let subs=JSON.parse(localStorage.getItem("feemi-subs-v7")||"null");
if(!subs){
 const old=JSON.parse(localStorage.getItem("feemi-subs-v6")||localStorage.getItem("feemi-subs-v5")||"null");
 subs=old?old.map(s=>({...s,cycle:s.cycle||"monthly",month:s.month||""})):[
{id:crypto.randomUUID(),name:"ChatGPT Plus",price:20,currency:"$",category:"AI工具",day:26,month:"",cycle:"monthly",status:"使用中",note:"核心工具，不建议取消"},
{id:crypto.randomUUID(),name:"Claude Pro",price:200,currency:"$",category:"AI工具",day:18,month:6,cycle:"annual",status:"准备取消",note:"年付，观察使用频率"},
{id:crypto.randomUUID(),name:"Netflix",price:12.99,currency:"£",category:"娱乐影音",day:30,month:"",cycle:"monthly",status:"使用中",note:""},
{id:crypto.randomUUID(),name:"Spotify Premium",price:109.99,currency:"£",category:"娱乐影音",day:1,month:7,cycle:"annual",status:"使用中",note:"年付"},
{id:crypto.randomUUID(),name:"健身房会员",price:40,currency:"£",category:"生活服务",day:2,month:"",cycle:"monthly",status:"使用中",note:""},
{id:crypto.randomUUID(),name:"家庭 WiFi",price:25,currency:"£",category:"生活服务",day:15,month:"",cycle:"monthly",status:"使用中",note:""}
 ];
}
let memory=JSON.parse(localStorage.getItem("feemi-memory-v7")||localStorage.getItem("feemi-memory-v6")||"null")||{fav:"ChatGPT",worry:"突然扣费、消费失控",habit:"喜欢尝鲜、舍不得取消",goal:"减少浪费，提高健康分"};
let saved=JSON.parse(localStorage.getItem("feemi-secrets-v7")||"[]");

const tips=[
 {app:"ChatGPT Plus",tag:"Prompt Secret",title:"别问“帮我写”。",text:"试试：先给我 3 个方向，让我选。AI 会从执行工具，变成真正的思考伙伴。"},
 {app:"Spotify Premium",tag:"Hidden Feature",title:"睡前打开 Daylist。",text:"它会根据你的时间和情绪换歌。Spotify 最值钱的功能，不只是听歌。"},
 {app:"Netflix",tag:"Value Check",title:"别只看 Top10。",text:"Top10 是热度，不一定是质量。真正值钱的，是你看完还会想很久的片子。"},
 {app:"Claude Pro",tag:"Long Doc Secret",title:"让 Claude 先找矛盾。",text:"上传长文档后，不要让它总结。先问：这里最值得质疑的 5 个假设是什么？"}
];

function save(){localStorage.setItem("feemi-subs-v7",JSON.stringify(subs));localStorage.setItem("feemi-memory-v7",JSON.stringify(memory));localStorage.setItem("feemi-secrets-v7",JSON.stringify(saved))}
function active(){return subs.filter(s=>s.status!=="已取消")}
function monthlyEq(s){return Number(s.price||0)/(s.cycle==="annual"?12:1)}
function annualEq(s){return Number(s.price||0)*(s.cycle==="annual"?1:12)}
function gbpMonthly(list=active()){return list.filter(s=>s.currency==="£").reduce((a,b)=>a+monthlyEq(b),0)}
function gbpAnnual(list=active()){return list.filter(s=>s.currency==="£").reduce((a,b)=>a+annualEq(b),0)}
function money(v,c="£"){return c+Number(v||0).toFixed(2)}
function nextChargeDate(s){const now=new Date();let y=now.getFullYear();const d=Number(s.day||1);let m=s.cycle==="annual"?Number(s.month||now.getMonth()+1):now.getMonth()+1;let date=new Date(y,m-1,d);if(date<now){if(s.cycle==="annual")date=new Date(y+1,m-1,d);else date=new Date(y,m,d)}return date}
function daysUntil(date){return Math.max(0,Math.ceil((date-new Date())/86400000))}
function score(){let s=92; s-=Math.max(0,active().length-6)*3; s-=subs.filter(x=>x.status==="准备取消").length*4; return Math.max(45,Math.min(96,s))}
function nav(id){document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));$(id).classList.add("active");document.querySelectorAll(".tab").forEach(t=>t.classList.toggle("active",t.dataset.go===id));$("title").textContent=id==="tips"?"Unlock":id==="feebi"?"Feebi":id==="bills"?"账单":id==="insights"?"洞察":id==="me"?"我的":"Feemi";$("subtitle").textContent=id==="tips"?"每天一个新发现":id==="feebi"?"少说废话，抓重点":id==="bills"?"月付、年付都在这里":id==="insights"?"理解每次付费背后的期待":id==="me"?"让 Feebi 更懂你":"Spend on what matters.";render()}
function row(s){const date=nextChargeDate(s),left=daysUntil(date),cycle=s.cycle==="annual"?"年付":"月付";const shown=s.cycle==="annual"?`${money(s.price,s.currency)}/年`:`${money(s.price,s.currency)}/月`;const monthly=s.cycle==="annual"?` · 等效 ${money(monthlyEq(s),s.currency)}/月`:"";return `<article class="sub-row" data-id="${s.id}"><div class="logo">${icons[s.category]||"💳"}</div><div><div class="name">${s.name}</div><div class="meta">${s.category} · ${cycle}${monthly}</div></div><div class="amount">${shown}<div class="days">${left}天后</div></div></article>`}
function renderHome(){let total=gbpMonthly(),annual=gbpAnnual(),sc=score();$("monthly").textContent=money(total);$("yearly").textContent=`年度 ${money(annual)}`;$("annualCount").textContent=`${active().filter(s=>s.cycle==="annual").length} 个年付`;$("score").textContent=sc;$("scoreSmall").textContent=sc;$("scoreLine").textContent=sc>=85?"优秀 · 你正在慢慢拿回主动权。":"有几项订阅，需要我帮你盯紧。";let t=tips[new Date().getDate()%tips.length];$("dailyApp").textContent=`✨ ${t.app}`;$("dailyTitle").textContent=t.title;$("dailyText").textContent=t.text;let soon=[...active()].sort((a,b)=>nextChargeDate(a)-nextChargeDate(b)).slice(0,3);$("upcoming").innerHTML=soon.map(row).join("")||"<p class='soft'>暂无扣费</p>";document.querySelectorAll("#upcoming .sub-row").forEach(x=>x.onclick=()=>openSheet(x.dataset.id))}
function renderBills(){let q=$("search").value.toLowerCase();let list=filter==="全部"?subs:subs.filter(s=>s.category===filter);if(q)list=list.filter(s=>(s.name+s.category+s.note).toLowerCase().includes(q));$("billList").innerHTML=list.map(row).join("")||"<p class='soft'>没有找到订阅。</p>";document.querySelectorAll("#billList .sub-row").forEach(x=>x.onclick=()=>openSheet(x.dataset.id))}
function renderTips(){$("tipStack").innerHTML=tips.map((t,i)=>`<article class="tip-card"><span class="app-tag">${t.app} · ${t.tag}</span><h2>${t.title}</h2><p>${t.text}</p><button data-save-tip="${i}">收藏 Secret</button></article>`).join("");document.querySelectorAll("[data-save-tip]").forEach(b=>b.onclick=()=>{let t=tips[Number(b.dataset.saveTip)];if(!saved.find(x=>x.title===t.title))saved.push(t);save();renderSaved()});renderSaved()}
function renderSaved(){$("savedSecrets").innerHTML=saved.length?saved.map(s=>`<div class="saved-item"><b>${s.app}</b><br><span>${s.title}</span></div>`).join(""):"<p class='soft'>还没有收藏。看到戳你的，就存下来。</p>"}
function renderInsights(){let total=gbpMonthly(),annual=gbpAnnual();$("insightSummary").textContent=`月付等效约 ${money(total)} /月，年度真实成本约 ${money(annual)}。`;let cats=["AI工具","生活服务","娱乐影音","金融理财"];let vals=cats.map(c=>({c,total:gbpMonthly(active().filter(s=>s.category===c))}));let max=Math.max(1,...vals.map(v=>v.total));$("bars").innerHTML=vals.map(v=>`<article class="bar-row"><div class="bar-top"><b>${icons[v.c]} ${v.c}</b><span>£${v.total.toFixed(2)}/月</span></div><div class="bar"><span style="width:${Math.round(v.total/max*100)}%"></span></div></article>`).join("");$("understandText").textContent=active().filter(s=>s.category==="AI工具").length>=2?"你不是订阅太多 AI。你只是一直害怕错过那个能改变自己的工具。":"你不是在省钱。你是在学会把钱花在真正重要的地方。"}
function renderMemory(){$("fav").value=memory.fav||"";$("worry").value=memory.worry||"";$("habit").value=memory.habit||"";$("goal").value=memory.goal||"";$("memoryLine").textContent=`我记得你喜欢 ${memory.fav||"重要工具"}，也担心 ${memory.worry||"突然扣费"}。我会少说废话，直接帮你抓重点。`}
function render(){save();renderHome();renderBills();renderTips();renderInsights();renderMemory()}

async function askFeebi(message){const chat=$("chat");chat.innerHTML+=`<div class="bubble user">${message}</div>`;$("message").value="";const payload={message,subscriptions:subs,healthScore:score(),monthlyCost:money(gbpMonthly()),yearlyCost:money(gbpAnnual()),memory};try{const r=await fetch(API,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});const d=await r.json();chat.innerHTML+=`<div class="bubble ai">${d.reply||"我刚刚走神了，但我还在。再问我一次。"}</div>`}catch(e){chat.innerHTML+=`<div class="bubble ai">我刚刚走神了，但我还在。再问我一次。</div>`}chat.scrollTop=chat.scrollHeight}
function openSheet(id=null){editId=id;let s=id?subs.find(x=>x.id===id):null;$("sheetTitle").textContent=s?"编辑订阅":"添加订阅";$("subName").value=s?.name||"";$("subPrice").value=s?.price||"";$("subCurrency").value=s?.currency||"£";$("subCycle").value=s?.cycle||"monthly";$("subCat").value=s?.category||"AI工具";$("subDay").value=s?.day||"";$("subMonth").value=s?.month||"";$("subStatus").value=s?.status||"使用中";$("subNote").value=s?.note||"";$("deleteSub").classList.toggle("hide",!s);$("sheet").classList.remove("hidden")}
function closeSheet(){$("sheet").classList.add("hidden");editId=null}
function saveSub(){let data={name:$("subName").value||"未命名订阅",price:Number($("subPrice").value||0),currency:$("subCurrency").value,cycle:$("subCycle").value,category:$("subCat").value,day:Number($("subDay").value||1),month:$("subMonth").value,status:$("subStatus").value,note:$("subNote").value};if(data.cycle==="annual"&&!data.month)data.month=new Date().getMonth()+1;if(editId)subs=subs.map(s=>s.id===editId?{...s,...data}:s);else subs.unshift({id:crypto.randomUUID(),...data});closeSheet();render()}
function delSub(){if(editId&&confirm("确定删除这个订阅吗？")){subs=subs.filter(s=>s.id!==editId);closeSheet();render()}}
document.addEventListener("DOMContentLoaded",()=>{document.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>nav(b.dataset.go));$("addTop").onclick=()=>openSheet();$("addBottom").onclick=()=>openSheet();$("close").onclick=closeSheet;$("sheet").onclick=e=>{if(e.target.id==="sheet")closeSheet()};$("saveSub").onclick=saveSub;$("deleteSub").onclick=delSub;$("search").oninput=renderBills;document.querySelectorAll(".chip").forEach(c=>c.onclick=()=>{filter=c.dataset.filter;document.querySelectorAll(".chip").forEach(x=>x.classList.remove("active"));c.classList.add("active");renderBills()});$("send").onclick=()=>{let m=$("message").value.trim();if(m)askFeebi(m)};$("message").addEventListener("keydown",e=>{if(e.key==="Enter"){let m=$("message").value.trim();if(m)askFeebi(m)}});document.querySelectorAll("[data-question]").forEach(b=>b.onclick=()=>askFeebi(b.dataset.question));$("saveMemory").onclick=()=>{memory={fav:$("fav").value,worry:$("worry").value,habit:$("habit").value,goal:$("goal").value};save();renderMemory();alert("Feebi 记住了 💜")};$("exportData").onclick=async()=>{let text=JSON.stringify({subs,memory,saved},null,2);try{await navigator.clipboard.writeText(text);alert("已复制备份")}catch{alert(text)}};$("resetData").onclick=()=>{if(confirm("恢复示例数据？")){localStorage.removeItem("feemi-subs-v7");localStorage.removeItem("feemi-memory-v7");localStorage.removeItem("feemi-secrets-v7");location.reload()}};$("clearSaved").onclick=()=>{saved=[];save();renderSaved()};render()});
if("serviceWorker" in navigator){window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}))}
