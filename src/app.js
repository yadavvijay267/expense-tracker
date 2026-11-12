// Expense Tracker — original code by Clamor.
// All data in localStorage; charts drawn on canvas (no library, works offline).
const EXP_CATS=["Food","Transport","Housing","Utilities","Entertainment","Shopping","Health","Education","Other"];
const INC_CATS=["Salary","Freelance","Business","Gift","Refund","Other income"];
const COLORS=["#0f766e","#dc2626","#ea580c","#ca8a04","#2563eb","#7c3aed","#db2777","#0891b2","#65a30d"];
const $=id=>document.getElementById(id);
const fmt=n=>"₹"+Number(n).toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2});
let txs=JSON.parse(localStorage.getItem("et-txs")||"[]");
let budgets=JSON.parse(localStorage.getItem("et-budgets")||"{}");
let editingId=null;
function save(){ localStorage.setItem("et-txs",JSON.stringify(txs)); localStorage.setItem("et-budgets",JSON.stringify(budgets)); }
function uid(){ return Date.now().toString(36)+Math.random().toString(36).slice(2,7); }
function monthKey(d){ return d.slice(0,7); }
function thisMonth(){ return new Date().toISOString().slice(0,7); }
function fillCategories(){ const type=$("txType").value; const cats=type==="income"?INC_CATS:EXP_CATS;
  $("txCategory").innerHTML=cats.map(c=>`<option>${c}</option>`).join(""); }
function fillFilterCategories(){ $("filterCategory").innerHTML='<option value="">All categories</option>'+[...EXP_CATS,...INC_CATS].filter((v,i,a)=>a.indexOf(v)===i).map(c=>`<option>${c}</option>`).join(""); }
function renderBudgets(){ $("budgetForm").innerHTML=EXP_CATS.map(c=>`<label>${c}<input type="number" min="0" step="100" data-budget="${c}" value="${budgets[c]||""}" placeholder="No limit" aria-label="Monthly budget for ${c}"></label>`).join("");
  document.querySelectorAll("[data-budget]").forEach(inp=>inp.onchange=()=>{ const v=parseFloat(inp.value); if(v>0) budgets[inp.dataset.budget]=v; else delete budgets[inp.dataset.budget]; save(); render(); }); }
function renderSummary(){ const mk=thisMonth(); let inc=0,exp=0,bal=0;
  txs.forEach(t=>{ const a=Number(t.amount); if(t.type==="income"){bal+=a; if(monthKey(t.date)===mk) inc+=a;} else {bal-=a; if(monthKey(t.date)===mk) exp+=a;} });
  $("sumIncome").textContent=fmt(inc); $("sumExpense").textContent=fmt(exp); $("sumBalance").textContent=fmt(bal); $("sumCount").textContent=txs.length; }
function renderAlerts(){ const mk=thisMonth(); const spent={}; txs.forEach(t=>{ if(t.type==="expense"&&monthKey(t.date)===mk) spent[t.category]=(spent[t.category]||0)+Number(t.amount); });
  const over=Object.entries(budgets).filter(([c,lim])=>(spent[c]||0)>lim);
  const near=Object.entries(budgets).filter(([c,lim])=>(spent[c]||0)<=lim&&(spent[c]||0)>=lim*0.8);
  $("alerts").innerHTML=over.map(([c,lim])=>`<div class="alert">⚠️ <strong>Budget exceeded:</strong> ${c} — spent ${fmt(spent[c])} of your ${fmt(lim)} monthly limit.</div>`).join("")
    +near.map(([c,lim])=>`<div class="alert ok">ℹ️ ${c} is at ${Math.round(spent[c]/lim*100)}% of its ${fmt(lim)} monthly budget.</div>`).join(""); }
function drawDonut(canvas, data){ const ctx=canvas.getContext("2d"); const W=canvas.width,H=canvas.height; ctx.clearRect(0,0,W,H);
  const total=data.reduce((s,d)=>s+d.value,0); if(!total){ ctx.fillStyle="#63756a"; ctx.font="16px system-ui"; ctx.fillText("No expenses this month yet.",20,H/2); return; }
  let a=-Math.PI/2; const cx=W/2,cy=H/2,r=Math.min(W,H)/2-24;
  data.forEach((d,i)=>{ const frac=d.value/total; ctx.beginPath(); ctx.moveTo(cx,cy); ctx.arc(cx,cy,r,a,a+frac*2*Math.PI); ctx.closePath(); ctx.fillStyle=COLORS[i%COLORS.length]; ctx.fill(); a+=frac*2*Math.PI; });
  ctx.beginPath(); ctx.arc(cx,cy,r*0.55,0,2*Math.PI); ctx.fillStyle="#fff"; ctx.fill();
  ctx.fillStyle="#17251d"; ctx.font="bold 18px system-ui"; ctx.textAlign="center"; ctx.fillText(fmt(total),cx,cy-2); ctx.font="13px system-ui"; ctx.fillStyle="#63756a"; ctx.fillText("spent this month",cx,cy+18); ctx.textAlign="left"; }
function drawBars(canvas, values, labels){ const ctx=canvas.getContext("2d"); const W=canvas.width,H=canvas.height; ctx.clearRect(0,0,W,H);
  const max=Math.max(...values,1); const bw=(W-40)/values.length;
  values.forEach((v,i)=>{ const h=(H-46)*v/max; ctx.fillStyle="#0f766e"; ctx.fillRect(24+i*bw+4,H-28-h,bw-8,h);
    if(v>0){ ctx.fillStyle="#17251d"; ctx.font="10px system-ui"; ctx.fillText("₹"+Math.round(v),24+i*bw+4,H-32-h); }
    ctx.fillStyle="#63756a"; ctx.font="10px system-ui"; ctx.fillText(labels[i],24+i*bw+4,H-12); }); }
function renderCharts(){ const mk=thisMonth(); const spent={}; txs.forEach(t=>{ if(t.type==="expense"&&monthKey(t.date)===mk) spent[t.category]=(spent[t.category]||0)+Number(t.amount); });
  const data=Object.entries(spent).sort((a,b)=>b[1]-a[1]).map(([category,value])=>({category,value}));
  drawDonut($("categoryChart"),data);
  const total=data.reduce((s,d)=>s+d.value,0)||1;
  $("categoryList").innerHTML=data.map((d,i)=>`<div class="cat-row"><span><i style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${COLORS[i%COLORS.length]}"></i> ${d.category}</span><span class="bar"><i style="width:${Math.round(d.value/total*100)}%"></i></span><strong>${fmt(d.value)}</strong><span class="muted">${Math.round(d.value/total*100)}%</span></div>`).join("")||"<p class='muted'>No expenses this month yet.</p>";
  const days=[]; const labels=[]; for(let i=29;i>=0;i--){ const d=new Date(Date.now()-i*86400e3); const k=d.toISOString().slice(0,10); days.push(k); labels.push(String(d.getDate())); }
  const perDay=days.map(k=>txs.filter(t=>t.type==="expense"&&t.date===k).reduce((s,t)=>s+Number(t.amount),0));
  drawBars($("dailyChart"),perDay,labels); }
function filtered(){ const fc=$("filterCategory").value, ft=$("filterType").value, from=$("filterFrom").value, to=$("filterTo").value, q=$("filterSearch").value.trim().toLowerCase();
  return txs.filter(t=>(!fc||t.category===fc)&&(!ft||t.type===ft)&&(!from||t.date>=from)&&(!to||t.date<=to)&&(!q||(t.note||"").toLowerCase().includes(q))).sort((a,b)=>b.date.localeCompare(a.date)||b.id.localeCompare(a.id)); }
function renderTable(){ const list=filtered();
  $("txTable").innerHTML=list.map(t=>`<tr><td>${t.date}</td><td>${escapeHtml(t.note||"—")}</td><td>${t.category}</td><td class="${t.type}-txt">${t.type}</td><td class="num ${t.type}-txt">${t.type==="income"?"+":"−"}${fmt(t.amount)}</td><td><button type="button" class="icon-btn" data-edit="${t.id}" title="Edit">✏️</button><button type="button" class="icon-btn" data-del="${t.id}" title="Delete">🗑️</button></td></tr>`).join("");
  $("emptyMsg").style.display=list.length?"none":"block";
  document.querySelectorAll("[data-del]").forEach(b=>b.onclick=()=>{ if(confirm("Delete this transaction?")){ txs=txs.filter(t=>t.id!==b.dataset.del); save(); render(); } });
  document.querySelectorAll("[data-edit]").forEach(b=>b.onclick=()=>{ const t=txs.find(x=>x.id===b.dataset.edit); if(!t) return; editingId=t.id;
    $("txType").value=t.type; fillCategories(); $("txCategory").value=t.category; $("txAmount").value=t.amount; $("txDate").value=t.date; $("txNote").value=t.note||"";
    $("formTitle").textContent="Edit transaction"; $("submitBtn").textContent="Save changes"; $("cancelEdit").hidden=false; window.scrollTo({top:0,behavior:"smooth"}); }); }
function escapeHtml(s){ return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
function render(){ renderSummary(); renderAlerts(); renderCharts(); renderTable(); }
function resetForm(){ editingId=null; $("txForm").reset(); $("txDate").value=new Date().toISOString().slice(0,10); fillCategories(); $("formTitle").textContent="Add transaction"; $("submitBtn").textContent="Add transaction"; $("cancelEdit").hidden=true; }
$("txType").onchange=fillCategories;
$("txForm").addEventListener("submit",e=>{ e.preventDefault();
  const rec={id:editingId||uid(),type:$("txType").value,amount:parseFloat($("txAmount").value),category:$("txCategory").value,date:$("txDate").value,note:$("txNote").value.trim()};
  if(!rec.amount||rec.amount<=0||!rec.date) return;
  if(editingId){ const i=txs.findIndex(t=>t.id===editingId); txs[i]=rec; } else txs.push(rec);
  save(); resetForm(); render(); });
$("cancelEdit").onclick=resetForm;
["filterCategory","filterType","filterFrom","filterTo"].forEach(id=>$(id).onchange=renderTable);
$("filterSearch").oninput=renderTable;
$("resetFilters").onclick=()=>{ $("filterCategory").value="";$("filterType").value="";$("filterFrom").value="";$("filterTo").value="";$("filterSearch").value=""; renderTable(); };
$("exportBtn").onclick=()=>{ const rows=[["Date","Type","Category","Note","Amount (INR)"]].concat(filtered().map(t=>[t.date,t.type,t.category,'"'+(t.note||"").replace(/"/g,'""')+'"',t.amount]));
  const csv="\uFEFF"+rows.map(r=>r.join(",")).join("\r\n");
  const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"})); a.download="expense-tracker-export.csv"; a.click(); URL.revokeObjectURL(a.href); };
$("seedBtn").onclick=()=>{ if(txs.length&&!confirm("This adds sample transactions alongside your existing ones. Continue?")) return;
  const today=new Date(); const d=n=>new Date(today.getTime()-n*86400e3).toISOString().slice(0,10);
  const sample=[["income","Salary",65000,d(2),"Monthly salary"],["expense","Food",420,d(0),"Groceries"],["expense","Food",180,d(1),"Lunch"],["expense","Transport",120,d(0),"Metro card top-up"],["expense","Housing",12000,d(5),"Rent"],["expense","Utilities",1450,d(4),"Electricity bill"],["expense","Entertainment",499,d(3),"Streaming subscription"],["expense","Shopping",2200,d(6),"Shoes"],["expense","Health",650,d(8),"Pharmacy"],["income","Freelance",4500,d(7),"Design gig"],["expense","Food",320,d(9),"Dinner out"],["expense","Transport",90,d(10),"Bus fare"]];
  sample.forEach(([type,category,amount,date,note])=>txs.push({id:uid(),type,category,amount,date,note}));
  budgets={...budgets,Food:5000,Transport:2000,Entertainment:1500}; save(); renderBudgets(); render(); };
$("clearBtn").onclick=()=>{ if(confirm("Delete ALL transactions and budgets? This cannot be undone.")){ txs=[]; budgets={}; save(); renderBudgets(); resetForm(); render(); } };
fillCategories(); fillFilterCategories(); renderBudgets(); resetForm(); render();
