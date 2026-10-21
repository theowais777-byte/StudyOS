const $ = s => document.querySelector(s);
// Unique storage namespace for the ChatGPT-inspired StudyOS build.
// This separates this app's data from older StudyOS folders sharing localhost:8000.
const TASK_KEY = "studyos-chatgpt-workspace-tasks-v2";

const NOTES_KEY = "studyos-chatgpt-workspace-notes-v2";
const SESSION_KEY = "studyos-chatgpt-workspace-sessions-v2";
const REWARD_KEY = "studyos-warm-cream-streak-rewards-v1";
let rewardData = { points: 0, activeDays: [], awardedTasks: [], awardedSessions: 0 };
try { const saved = JSON.parse(localStorage.getItem(REWARD_KEY) || "null"); if (saved && typeof saved === "object") rewardData = { ...rewardData, ...saved, activeDays: Array.isArray(saved.activeDays) ? saved.activeDays : [], awardedTasks: Array.isArray(saved.awardedTasks) ? saved.awardedTasks : [] }; } catch {}
function saveRewards(){ localStorage.setItem(REWARD_KEY, JSON.stringify(rewardData)); }
function recordStudyActivity(){ if (!rewardData.activeDays.includes(todayKey)) rewardData.activeDays.push(todayKey); rewardData.activeDays = [...new Set(rewardData.activeDays)].sort().slice(-400); saveRewards(); renderRewards(); }
const MILESTONES = [
  { points: 50, medal: "🥉", name: "Bronze Badge", title: "First Milestone" },
  { points: 100, medal: "🥈", name: "Silver Badge", title: "Consistency Starter" },
  { points: 150, medal: "🥇", name: "Gold Badge", title: "Study Champion" },
  { points: 200, medal: "🏅", name: "Platinum Badge", title: "Focus Pro" },
  { points: 300, medal: "💎", name: "Diamond Badge", title: "Knowledge Seeker" },
  { points: 500, medal: "👑", name: "Master Badge", title: "Study Master" },
  { points: 750, medal: "🌟", name: "Legend Badge", title: "Study Legend" },
  { points: 1000, medal: "🚀", name: "Mythic Badge", title: "StudyOS Mythic" }
];
function renderRewards(){
  const days = new Set(rewardData.activeDays); let streak = 0; const cursor = new Date();
  if (!days.has(dateKey(cursor))) cursor.setDate(cursor.getDate()-1);
  while (days.has(dateKey(cursor))) { streak++; cursor.setDate(cursor.getDate()-1); }
  const points = Math.max(0, Number(rewardData.points)||0);
  const nextMilestone = MILESTONES.find(m => points < m.points);
  const previousMilestone = [...MILESTONES].reverse().find(m => points >= m.points);
  const base = previousMilestone ? previousMilestone.points : 0;
  const next = nextMilestone ? nextMilestone.points : 1000;
  const within = nextMilestone ? points-base : 0;
  const span = nextMilestone ? next-base : 1;
  $("#streakCurrent").textContent = `${streak} ${streak===1?"day":"days"}`;
  $("#streakMessage").textContent = streak ? (streak>=7 ? "Amazing consistency — keep it up!" : "Nice! Come back tomorrow to keep it going.") : "Complete a task or focus session to begin.";
  $("#rewardPoints").textContent = `${points} pts`;
  const unlocked = MILESTONES.filter(m => points >= m.points).length;
  $("#rewardMessage").textContent = `${unlocked} of ${MILESTONES.length} milestone badges unlocked`;
  $("#nextRewardLabel").textContent = nextMilestone ? `Next reward: ${next} points — ${nextMilestone.name}` : "All milestone badges unlocked!";
  $("#rewardProgressText").textContent = nextMilestone ? `${points-base} / ${span}` : "MAX";
  $("#rewardProgressBar").style.width = `${nextMilestone ? Math.min(100,within/span*100) : 100}%`;
  const list = $("#milestoneList");
  if (list) list.innerHTML = MILESTONES.map(m => {
    const isUnlocked = points >= m.points;
    return `<div class="milestone-card ${isUnlocked ? "unlocked" : ""}"><span class="milestone-medal">${isUnlocked ? m.medal : "🔒"}</span><div><strong>${m.medal} ${m.name} — ${m.title}</strong><p>${isUnlocked ? "Unlocked! Great work 🎉" : `${m.points-points} points to unlock`}</p></div><span class="milestone-state">${isUnlocked ? "UNLOCKED" : `${m.points} PTS`}</span></div>`;
  }).join("");
  $("#rewardHint").textContent = nextMilestone ? `${next-points} more points until ${nextMilestone.name}. Keep going!` : "You've collected every StudyOS milestone badge. Legendary work!";
}
function milestoneToast(before, after){ const reached = MILESTONES.find(m => before < m.points && after >= m.points); return reached ? `${reached.medal} ${reached.name} unlocked! ${reached.title} 🎉` : null; }
function awardTaskCompletion(id){ if(rewardData.awardedTasks.includes(String(id))) return; const before = rewardData.points; rewardData.awardedTasks.push(String(id)); rewardData.points += 10; recordStudyActivity(); saveRewards(); toast(milestoneToast(before, rewardData.points) || "Task complete! +10 reward points 🎉"); }
function awardFocusSession(){ const before = rewardData.points; rewardData.points += 5; rewardData.awardedSessions = (Number(rewardData.awardedSessions)||0)+1; recordStudyActivity(); saveRewards(); toast(milestoneToast(before, rewardData.points) || "Focus session complete! +5 reward points 🏆"); }
let tasks = [];
try { const raw = JSON.parse(localStorage.getItem(TASK_KEY) || "[]"); if (Array.isArray(raw)) tasks = raw.map(t => ({...t, priority: t.priority || "medium", subject: t.subject || ""})); } catch {}
let page = "dashboard", timerLength = 25 * 60, remaining = timerLength, timerInterval = null, timerRunning = false, timerMode = "Focus";
let sessions = Number(localStorage.getItem(SESSION_KEY) || 0);
let toastTimer;
const today = new Date();
const dateKey = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const todayKey = dateKey(today);
$("#todayLabel").textContent = today.toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric"});
$("#hello").textContent = (today.getHours()<12?"Good morning.":today.getHours()<18?"Good afternoon.":"Good evening.") + " Let's make today count.";
function saveTasks(){ localStorage.setItem(TASK_KEY,JSON.stringify(tasks)); }
function esc(s){return String(s ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function toast(msg){const el=$("#toast");el.textContent=msg;el.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("show"),2300);}
function dueText(t){if(!t.due)return "";const late=t.due<todayKey&&!t.done;const d=new Date(t.due+"T12:00:00").toLocaleDateString(undefined,{month:"short",day:"numeric"});return `<span class="due ${late?"late":""}">${late?"Overdue · ":"Due "}${d}</span>`;}
function taskHTML(t){return `<div class="task-row ${t.done?"is-done":""}"><button class="check-btn ${t.done?"checked":""}" data-toggle="${esc(t.id)}" aria-label="${t.done?"Mark active":"Mark complete"}">${t.done?"✓":""}</button><div class="task-content"><div class="task-title">${esc(t.title)}</div><div class="task-meta">${t.subject?`<span class="pill">${esc(t.subject)}</span>`:""}<span class="priority ${esc(t.priority||"medium")}">${esc(t.priority||"medium")} priority</span>${dueText(t)}</div></div><div class="row-actions"><button class="edit-btn" data-edit="${esc(t.id)}" aria-label="Edit task" title="Edit task">✎</button><button class="delete-btn" data-delete="${esc(t.id)}" aria-label="Delete task" title="Delete task">×</button></div></div>`;}
function renderStats(){const done=tasks.filter(t=>t.done).length,total=tasks.length,pending=total-done,percent=total?Math.round(done/total*100):0;$("#statTotal").textContent=total;$("#statDone").textContent=done;$("#statPending").textContent=pending;$("#statPercent").textContent=percent+"%";$("#sideTaskCount").textContent=pending;}
function renderDashboard(){const items=tasks.filter(t=>!t.done).sort((a,b)=>({high:0,medium:1,low:2}[a.priority||"medium"]-{high:0,medium:1,low:2}[b.priority||"medium"])||(a.due||"9999").localeCompare(b.due||"9999")).slice(0,5);$("#dashboardTasks").innerHTML=items.map(taskHTML).join("");$("#dashEmpty").classList.toggle("hidden",items.length>0);}
function renderTasks(){const q=$("#search").value.trim().toLowerCase(),status=$("#filterStatus").value,priority=$("#filterPriority").value;const items=tasks.filter(t=>(status==="all"||(status==="done"?t.done:!t.done))&&(priority==="all"||(t.priority||"medium")===priority)&&(!q||t.title.toLowerCase().includes(q)||(t.subject||"").toLowerCase().includes(q))).sort((a,b)=>Number(a.done)-Number(b.done)||({high:0,medium:1,low:2}[a.priority||"medium"]-{high:0,medium:1,low:2}[b.priority||"medium"])||(a.due||"9999").localeCompare(b.due||"9999"));$("#taskList").innerHTML=items.map(taskHTML).join("");$("#taskEmpty").classList.toggle("hidden",items.length>0);$("#taskList").classList.toggle("hidden",items.length===0);}
function render(){renderStats();renderDashboard();renderTasks();}
function showPage(name){page=name;document.querySelectorAll(".page").forEach(p=>p.classList.add("hidden"));$("#page-"+name).classList.remove("hidden");document.querySelectorAll(".nav").forEach(b=>b.classList.toggle("active",b.dataset.page===name));$("#crumbPage").textContent=({dashboard:"Dashboard",tasks:"Task manager",focus:"Focus timer",notes:"Quick notes",pdf:"PDF reader"})[name];if(name==="tasks")$("#search").focus();}
document.querySelectorAll(".nav").forEach(b=>b.addEventListener("click",()=>showPage(b.dataset.page)));
const sidebar = document.querySelector(".sidebar");
const sidebarToggle = $("#sidebarToggle");
function setSidebarCollapsed(collapsed) {
  sidebar.classList.toggle("collapsed", collapsed);
  sidebarToggle.setAttribute("aria-label", collapsed ? "Expand sidebar" : "Collapse sidebar");
  sidebarToggle.title = collapsed ? "Expand sidebar" : "Collapse sidebar";
  $(".toggle-glyph").textContent = collapsed ? "›" : "‹";
  try { localStorage.setItem("studyos-sidebar-collapsed-v1", collapsed ? "1" : "0"); } catch (_) {}
}
try { setSidebarCollapsed(localStorage.getItem("studyos-sidebar-collapsed-v1") === "1" && window.innerWidth > 680); } catch (_) {}
sidebarToggle.addEventListener("click", () => setSidebarCollapsed(!sidebar.classList.contains("collapsed")));
document.querySelectorAll(".nav").forEach(btn => { btn.title = btn.textContent.trim(); });
document.querySelectorAll("[data-goto]").forEach(b=>b.addEventListener("click",()=>showPage(b.dataset.goto)));
let editingTaskId = null;
function openAdd(){editingTaskId=null;$("#taskForm").reset();$("#addPanel").classList.remove("hidden");$("#addPanel").querySelector("h2").textContent="New task";$("#taskForm button[type=submit]").textContent="Save task";showPage("tasks");$("#taskTitle").focus();}
function openEdit(id){const t=tasks.find(x=>x.id===id);if(!t)return;editingTaskId=id;showPage("tasks");$("#addPanel").classList.remove("hidden");$("#addPanel").querySelector("h2").textContent="Edit task";$("#taskForm button[type=submit]").textContent="Save changes";$("#taskTitle").value=t.title;$("#taskSubject").value=t.subject||"";$("#taskDue").value=t.due||"";$("#taskPriority").value=t.priority||"medium";$("#taskTitle").focus();}
$("#openAdd").addEventListener("click",openAdd);$("#emptyAdd").addEventListener("click",openAdd);$("#closeAdd").addEventListener("click",()=>$("#addPanel").classList.add("hidden"));$("#cancelAdd").addEventListener("click",()=>{$("#taskForm").reset();$("#addPanel").classList.add("hidden");});
$("#taskForm").addEventListener("submit",e=>{e.preventDefault();const title=$("#taskTitle").value.trim();if(!title)return;const data={title,subject:$("#taskSubject").value.trim(),due:$("#taskDue").value,priority:$("#taskPriority").value};if(editingTaskId){tasks=tasks.map(t=>t.id===editingTaskId?{...t,...data}:t);toast("Task updated.");}else{tasks.push({id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),...data,done:false,created:Date.now()});toast("Task added.");}editingTaskId=null;saveTasks();$("#taskForm").reset();$("#addPanel").classList.add("hidden");render();});
document.body.addEventListener("click",e=>{const toggle=e.target.closest("[data-toggle]"),del=e.target.closest("[data-delete]"),edit=e.target.closest("[data-edit]");if(edit){openEdit(edit.dataset.edit);}if(toggle){const target=tasks.find(t=>t.id===toggle.dataset.toggle);const becomingDone=target && !target.done;tasks=tasks.map(t=>t.id===toggle.dataset.toggle?{...t,done:!t.done}:t);saveTasks();render();if(becomingDone)awardTaskCompletion(toggle.dataset.toggle);else toast("Task updated.");}if(del){tasks=tasks.filter(t=>t.id!==del.dataset.delete);saveTasks();render();toast("Task deleted.");}});
$("#search").addEventListener("input",renderTasks);$("#filterStatus").addEventListener("change",renderTasks);$("#filterPriority").addEventListener("change",renderTasks);

$("#clearCompleted").addEventListener("click",()=>{const done=tasks.filter(t=>t.done).length;if(!done){toast("No completed tasks to clear.");return;}if(confirm(`Delete ${done} completed task${done===1?"":"s"}? This cannot be undone.`)){tasks=tasks.filter(t=>!t.done);saveTasks();render();toast("Completed tasks cleared.");}});
function downloadJSON(filename,obj){const blob=new Blob([JSON.stringify(obj,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
$("#exportBackup").addEventListener("click",()=>{downloadJSON("studyos-backup.json",{app:"StudyOS",version:2,exportedAt:new Date().toISOString(),tasks,notes:localStorage.getItem(NOTES_KEY)||"",sessions,rewardData});toast("Backup downloaded.");});
$("#importBackupBtn").addEventListener("click",()=>$("#importBackupFile").click());
$("#importBackupFile").addEventListener("change",async e=>{const file=e.target.files?.[0];if(!file)return;try{const data=JSON.parse(await file.text());if(!data||!Array.isArray(data.tasks))throw new Error("invalid");if(!confirm("Import this backup? It will replace the tasks, notes and focus count currently in this StudyOS copy."))return;tasks=data.tasks.filter(t=>t&&typeof t.title==="string").map(t=>({...t,id:String(t.id||Date.now()+Math.random()),title:t.title.slice(0,120),subject:String(t.subject||""),priority:["high","medium","low"].includes(t.priority)?t.priority:"medium",due:String(t.due||""),done:Boolean(t.done)}));saveTasks();localStorage.setItem(NOTES_KEY,String(data.notes||""));sessions=Math.max(0,Number(data.sessions)||0);localStorage.setItem(SESSION_KEY,String(sessions));if(data.rewardData&&typeof data.rewardData==="object"){rewardData={...rewardData,...data.rewardData,activeDays:Array.isArray(data.rewardData.activeDays)?data.rewardData.activeDays:[],awardedTasks:Array.isArray(data.rewardData.awardedTasks)?data.rewardData.awardedTasks:[]};saveRewards();renderRewards();}$("#notesText").value=String(data.notes||"");$("#noteSaved").textContent="SAVED LOCALLY";render();renderSessions();renderRewards();toast("Backup imported.");}catch{toast("That file isn't a valid StudyOS backup.");}finally{e.target.value="";}});


// Device information: browser APIs expose estimates only, not full hardware diagnostics.
function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return "Unavailable";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let n = bytes, i = 0;
  while (n >= 1024 && i < units.length - 1) { n /= 1024; i++; }
  return `${n.toFixed(i >= 3 ? 2 : 1)} ${units[i]}`;
}
async function loadDeviceInfo() {
  const storage = $("#deviceStorage"), cpu = $("#deviceCPU"), ram = $("#deviceRAM");
  storage.textContent = "Checking…"; cpu.textContent = "Checking…"; ram.textContent = "Checking…";
  const cores = navigator.hardwareConcurrency;
  cpu.textContent = Number.isFinite(cores) && cores > 0 ? `${cores} logical cores` : "Unavailable";
  const memory = navigator.deviceMemory;
  ram.textContent = Number.isFinite(memory) && memory > 0 ? `About ${memory} GB` : "Not exposed";
  try {
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      const quota = estimate.quota, usage = estimate.usage || 0;
      if (Number.isFinite(quota)) {
        storage.textContent = `${formatBytes(Math.max(0, quota - usage))} available`;
        $("#deviceStorageNote").textContent = `Approx. browser quota: ${formatBytes(quota)} · used: ${formatBytes(usage)}`;
      } else {
        storage.textContent = "Not exposed";
      }
    } else {
      storage.textContent = "Not supported";
    }
  } catch (_) {
    storage.textContent = "Unavailable";
  }
  $("#deviceCPUNote").textContent = "Browser-reported logical processor count; not CPU model or speed";
  $("#deviceRAMNote").textContent = Number.isFinite(memory) && memory > 0 ? "Browser estimate; may be rounded" : "Chrome does not expose a RAM estimate here";
}
$("#refreshDeviceInfo").addEventListener("click", () => { loadDeviceInfo(); loadBatteryInfo(); updateNetworkInfo(); });

// Battery percentage is available only in browsers that expose the Battery Status API.
async function loadBatteryInfo() {
  const value = $("#deviceBattery"), note = $("#deviceBatteryNote");
  try {
    if (typeof navigator.getBattery !== "function") {
      value.textContent = "Not exposed";
      note.textContent = "ChromeOS/browser does not provide battery details to this page";
      return;
    }
    const battery = await navigator.getBattery();
    const update = () => {
      value.textContent = `${Math.round(battery.level * 100)}%${battery.charging ? " · Charging" : ""}`;
      note.textContent = battery.charging ? "Battery is charging" : "Battery level reported by browser";
    };
    update();
    battery.addEventListener("levelchange", update);
    battery.addEventListener("chargingchange", update);
  } catch (_) {
    value.textContent = "Unavailable";
    note.textContent = "Battery status is blocked or unsupported";
  }
}
function updateNetworkInfo() {
  const value = $("#deviceNetwork"), note = $("#deviceNetworkNote");
  const online = navigator.onLine;
  value.textContent = online ? "Connected" : "Offline";
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const type = connection && (connection.type || connection.effectiveType);
  note.textContent = online
    ? (type ? `Browser reports connection · ${type}` : "Browser reports an active network connection")
    : "Browser reports no network connection";
}
window.addEventListener("online", updateNetworkInfo);
window.addEventListener("offline", updateNetworkInfo);
const networkConnection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
if (networkConnection && networkConnection.addEventListener) networkConnection.addEventListener("change", updateNetworkInfo);

// Focus timer
function fmt(s){return `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;}
function renderTimer(){const txt=fmt(remaining);$("#timerDisplay").textContent=txt;$("#dashTimer").textContent=txt;$("#timerMode").textContent=(timerMode==="Focus"?"FOCUS SESSION":timerMode.toUpperCase());$("#timerStart").textContent=timerRunning?"Pause":remaining===0?"Start again": "Start "+(timerMode==="Focus"?"focus":"break");$("#timerMessage").textContent=timerRunning?"You're in the zone. Keep going.":remaining===0?(timerMode==="Focus"?"Session complete — nice work!":"Break finished. Ready to return?"):"Ready when you are.";}
function stopTimer(){clearInterval(timerInterval);timerInterval=null;timerRunning=false;}
function chooseMode(btn){stopTimer();timerMode=btn.dataset.mode;timerLength=Number(btn.dataset.minutes)*60;remaining=timerLength;document.querySelectorAll(".mode").forEach(b=>b.classList.toggle("active",b===btn));renderTimer();}
document.querySelectorAll(".mode").forEach(b=>b.addEventListener("click",()=>chooseMode(b)));
$("#timerStart").addEventListener("click",()=>{if(timerRunning){stopTimer();renderTimer();return;}if(remaining<=0)remaining=timerLength;timerRunning=true;renderTimer();timerInterval=setInterval(()=>{remaining--;if(remaining<=0){remaining=0;stopTimer();if(timerMode==="Focus"){sessions++;localStorage.setItem(SESSION_KEY,String(sessions));awardFocusSession();}renderSessions();renderTimer();return;}renderTimer();},1000);});
$("#timerReset").addEventListener("click",()=>{stopTimer();remaining=timerLength;renderTimer();});
function renderSessions(){$("#sessionCount").textContent=`${sessions} ${sessions===1?"session":"sessions"} completed`;}
$("#notesText").value=localStorage.getItem(NOTES_KEY)||"";let noteSaveTimer;$("#notesText").addEventListener("input",()=>{clearTimeout(noteSaveTimer);$("#noteSaved").textContent="SAVING…";noteSaveTimer=setTimeout(()=>{localStorage.setItem(NOTES_KEY,$("#notesText").value);$("#noteSaved").textContent="SAVED LOCALLY";},250);});
$("#clearNotes").addEventListener("click",()=>{if($("#notesText").value && confirm("Clear all your saved notes?")){$("#notesText").value="";localStorage.removeItem(NOTES_KEY);$("#noteSaved").textContent="SAVED LOCALLY";toast("Notes cleared.");}});
if("serviceWorker" in navigator && location.protocol.startsWith("http"))navigator.serviceWorker.register("./sw.js").catch(()=>{});
render();renderTimer();renderSessions();renderRewards();loadDeviceInfo();loadBatteryInfo();updateNetworkInfo();

// Local PDF reader: selected files are displayed in the browser and are not uploaded.
let currentPdfUrl = null;
const pdfInput = $("#pdfFileInput");
function clearPdf() {
  if (currentPdfUrl) URL.revokeObjectURL(currentPdfUrl);
  currentPdfUrl = null;
  $("#pdfFrame").src = "about:blank";
  $("#pdfFrame").classList.add("hidden");
  $("#pdfEmpty").classList.remove("hidden");
  $("#pdfOpenNew").classList.add("hidden");
  $("#pdfClose").classList.add("hidden");
  $("#pdfFileName").textContent = "Choose a PDF to begin";
  $("#pdfStatus").textContent = "PDFs open locally in your browser's built-in viewer.";
}
pdfInput.addEventListener("change", () => {
  const file = pdfInput.files && pdfInput.files[0];
  if (!file) return;
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) { toast("Please choose a PDF file."); pdfInput.value = ""; return; }
  if (currentPdfUrl) URL.revokeObjectURL(currentPdfUrl);
  currentPdfUrl = URL.createObjectURL(file);
  $("#pdfFrame").src = currentPdfUrl;
  $("#pdfFrame").classList.remove("hidden");
  $("#pdfEmpty").classList.add("hidden");
  $("#pdfFileName").textContent = file.name;
  $("#pdfStatus").textContent = `${(file.size / (1024 * 1024)).toFixed(2)} MB · Opened locally`;
  $("#pdfOpenNew").href = currentPdfUrl;
  $("#pdfOpenNew").classList.remove("hidden");
  $("#pdfClose").classList.remove("hidden");
});
$("#pdfClose").addEventListener("click", () => { clearPdf(); pdfInput.value = ""; });
window.addEventListener("beforeunload", () => { if (currentPdfUrl) URL.revokeObjectURL(currentPdfUrl); });
