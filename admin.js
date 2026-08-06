import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

/* ===========================================
   PHOENIX ADMIN PANEL
   VERSION 2.0
=========================================== */

const supabase = createClient(
  "https://tvhgxlqqeklrdlgbkosa.supabase.co",
  "sb_publishable_Ep28HPF1SXIXQXBF2i__eg_h_jmjw4I"
);

/* ===========================================
   GLOBAL ELEMENTS
=========================================== */

const box = document.getElementById("contentBox");

const sidebar = document.getElementById("sidebar");

const overlay = document.getElementById("overlay");

const loading = document.getElementById("loadingIcon");

const toast = document.getElementById("toast");

const walletPopup =
document.getElementById("walletPopup");

const walletAmount =
document.getElementById("walletAmount");

const walletOk =
document.getElementById("walletOk");

const walletCancel =
document.getElementById("walletCancel");

/* ===========================================
   CURRENT ADMIN
=========================================== */

let currentAdmin = null;

/* ===========================================
   LOADING
=========================================== */

function showLoading(){

loading.style.display="flex";

}

function hideLoading(){

loading.style.display="none";

}

/* ===========================================
   TOAST
=========================================== */

function showToast(text,color="#16a34a"){

toast.innerText=text;

toast.style.background=color;

toast.classList.add("show");

setTimeout(()=>{

toast.classList.remove("show");

},2500);

}

/* ===========================================
   SIDEBAR
=========================================== */

window.openSidebar=()=>{

sidebar.classList.add("active");

overlay.classList.add("active");

};

window.closeSidebar=()=>{

sidebar.classList.remove("active");

overlay.classList.remove("active");

};

/* ===========================================
   AUTH CHECK
=========================================== */

async function checkAdmin(){

showLoading();

const {

data:{session}

}=await supabase.auth.getSession();

if(!session){

location.href="adminlogin.html";

return;

}

currentAdmin=session.user;

const {

data:admin,

error

}=await supabase

.from("admin_users")

.select("*")

.eq("id",currentAdmin.id)

.single();

if(error||!admin){

await supabase.auth.signOut();

location.href="index.html";

return;

}

hideLoading();

loadCounts();

showDashboard();

}

/* ===========================================
   LOGOUT
=========================================== */

window.logout=async()=>{

await supabase.auth.signOut();

location.replace("index.html");

};

checkAdmin();

/* ===========================================
   LOAD DASHBOARD COUNTS
=========================================== */

async function loadCounts() {

try{

const {

count:usersCount

}=await supabase

.from("profiles")

.select("*",{
count:"exact",
head:true
});

document.getElementById("usersCount").innerText=
usersCount||0;


const {

data:orders=[]

}=await supabase

.from("orders")

.select("*");

document.getElementById("ordersCount").innerText=
orders.length;


const successOrders=

orders.filter(o=>o.status==="success");

document.getElementById("topupCount").innerText=
successOrders.length;


const {

data:walletPending=[]

}=await supabase

.from("wallet_topups")

.select("*")

.eq("status","pending");

document.getElementById("walletPendingCount").innerText=
walletPending.length;

}catch(err){

console.error(err);

showToast("Dashboard Load Failed","#dc2626");

}

}


/* ===========================================
   DASHBOARD
=========================================== */

window.showDashboard=async()=>{

closeSidebar();

showLoading();

try{

const {

count:totalUsers

}=await supabase

.from("profiles")

.select("*",{
count:"exact",
head:true
});

const {

data:orders=[]

}=await supabase

.from("orders")

.select("*");

const totalOrders=
orders.length;

const success=
orders.filter(x=>x.status==="success").length;

const rejected=
orders.filter(x=>x.status==="reject").length;

const pending=
orders.filter(
x=>!x.status||
x.status==="pending"||
x.status==="Pending"
).length;

const successPercent=
totalOrders?
((success/totalOrders)*100).toFixed(0):0;

const rejectPercent=
totalOrders?
((rejected/totalOrders)*100).toFixed(0):0;

const pendingPercent=
totalOrders?
((pending/totalOrders)*100).toFixed(0):0;

box.innerHTML=`

<h2>📊 Dashboard Analytics</h2>

<br>

<div class="cards">

<div class="card">

<h3>👤 Users</h3>

<p>${totalUsers||0}</p>

</div>

<div class="card">

<h3>📦 Orders</h3>

<p>${totalOrders}</p>

</div>

<div class="card">

<h3>✅ Success</h3>

<p>${successPercent}%</p>

</div>

<div class="card">

<h3>❌ Reject</h3>

<p>${rejectPercent}%</p>

</div>

<div class="card">

<h3>⏳ Pending</h3>

<p>${pendingPercent}%</p>

</div>

</div>

`;

}catch(err){

console.error(err);

showToast("Dashboard Error","#dc2626");

}

hideLoading();

};

/* ===========================================
   USERS LIST
=========================================== */

window.viewUsers = async () => {

closeSidebar();

showLoading();

try {

const { data: users, error } = await supabase
.from("profiles")
.select("*")
.order("created_at", { ascending: false });

if (error) throw error;

let html = `
<h2>👤 Registered Users</h2>
<br>
`;

if (!users || users.length === 0) {

html += `
<div class="card">
<h3>No Users Found</h3>
</div>
`;

box.innerHTML = html;

hideLoading();

return;

}

users.forEach(user => {

html += `

<div class="card" style="margin-bottom:15px;text-align:left;">

<h3>👤 ${user.username || "No Username"}</h3>

<p><b>📧 Email :</b> ${user.email}</p>

<p><b>🆔 User ID :</b> ${user.id}</p>

<p><b>💰 Wallet :</b>
Rs. ${Number(user.wallet_balance || 0).toFixed(2)}
</p>

<p><b>📅 Joined :</b>
${new Date(user.created_at).toLocaleString()}
</p>

</div>

`;

});

box.innerHTML = html;

} catch (err) {

console.error(err);

showToast("Failed To Load Users", "#dc2626");

box.innerHTML = `
<h2>❌ Failed To Load Users</h2>
`;

}

hideLoading();

};

/* ===========================================
   ORDERS LIST
=========================================== */

window.viewOrders = async () => {

closeSidebar();

showLoading();

try{

const { data: orders, error } =
await supabase
.from("orders")
.select("*")
.order("created_at",{ascending:false});

if(error) throw error;

let html=`

<h2>📦 Orders</h2>

<br>

<input
id="searchUser"
type="text"
placeholder="Search UID / User ID / Product..."
onkeyup="searchOrder()"
style="
width:100%;
padding:12px;
border-radius:12px;
margin-bottom:20px;
border:none;
outline:none;
">

`;

if(!orders || orders.length===0){

html+=`
<div class="card">

<h3>No Orders Found</h3>

</div>
`;

box.innerHTML=html;

hideLoading();

return;

}

orders.forEach(order=>{

const color=

order.status==="success"
?"lime"

:order.status==="reject"
?"red"

:"orange";

html+=`

<div class="card"
style="
margin-bottom:18px;
text-align:left;
">

<p><b>🆔 Order :</b> ${order.id}</p>

<p><b>🎮 UID :</b> ${order.uid}</p>

<p><b>📦 Product :</b>
${order.product_name}
</p>

<p><b>📂 Category :</b>
${order.category}
</p>

<p><b>💵 Price :</b>
Rs.
${Number(order.price).toFixed(2)}
</p>

<p><b>👤 User :</b>
${order.user_id}
</p>

<p>

<b>Status :</b>

<span style="color:${color};">

${order.status||"pending"}

</span>

</p>

${
order.receipt_url
?

`<p>

<a
href="${order.receipt_url}"
target="_blank"
style="color:#38bdf8;">

📷 View Receipt

</a>

</p>`

:""

}

<div
style="
display:flex;
gap:10px;
margin-top:12px;
">

<button
onclick="setStatus('${order.id}','success')">

✅ Success

</button>

<button
onclick="setStatus('${order.id}','reject')">

❌ Reject

</button>

</div>

</div>

`;

});

box.innerHTML=html;

}catch(err){

console.error(err);

showToast(
"Failed To Load Orders",
"#dc2626"
);

box.innerHTML=`
<h2>❌ Failed To Load Orders</h2>
`;

}

hideLoading();

};

/* ===========================================
   UPDATE ORDER STATUS
=========================================== */

window.setStatus = async (id, status) => {

try{

showLoading();

const { error } =
await supabase
.from("orders")
.update({
status
})
.eq("id", id);

if(error) throw error;

showToast("Status Updated ✅");

await loadCounts();

await viewOrders();

}catch(err){

console.error(err);

showToast(
"Update Failed",
"#dc2626"
);

}

hideLoading();

};

/* ===========================================
   SUCCESS ORDERS
=========================================== */

window.viewTopups = async () => {

closeSidebar();

showLoading();

try{

const { data, error } =
await supabase
.from("orders")
.select("*")
.eq("status","success")
.order("created_at",{ascending:false});

if(error) throw error;

let html="<h2>✅ Success Orders</h2><br>";

if(data.length===0){

html+="<div class='card'><h3>No Success Orders</h3></div>";

}

data.forEach(order=>{

html+=`

<div class="card"
style="margin-bottom:15px;text-align:left;">

<p><b>🎮 UID :</b> ${order.uid}</p>

<p><b>📦 Product :</b> ${order.product_name}</p>

<p><b>💰 Price :</b>
Rs. ${Number(order.price).toFixed(2)}</p>

<p style="color:lime;">
✅ Success
</p>

</div>

`;

});

box.innerHTML=html;

}catch(err){

console.error(err);

showToast("Failed","#dc2626");

}

hideLoading();

};

/* ===========================================
   REJECT ORDERS
=========================================== */

window.viewRejected = async()=>{

closeSidebar();

showLoading();

try{

const { data,error }=
await supabase
.from("orders")
.select("*")
.eq("status","reject")
.order("created_at",{ascending:false});

if(error) throw error;

let html="<h2>❌ Rejected Orders</h2><br>";

if(data.length===0){

html+="<div class='card'><h3>No Rejected Orders</h3></div>";

}

data.forEach(order=>{

html+=`

<div class="card"
style="margin-bottom:15px;text-align:left;">

<p><b>🎮 UID :</b> ${order.uid}</p>

<p><b>📦 Product :</b> ${order.product_name}</p>

<p><b>💰 Price :</b>
Rs. ${Number(order.price).toFixed(2)}</p>

<p style="color:red;">
❌ Reject
</p>

</div>

`;

});

box.innerHTML=html;

}catch(err){

console.error(err);

showToast("Failed","#dc2626");

}

hideLoading();

};

/* ===========================================
   PENDING ORDERS
=========================================== */

window.viewPending = async()=>{

closeSidebar();

showLoading();

try{

const { data,error }=
await supabase
.from("orders")
.select("*")
.order("created_at",{ascending:false});

if(error) throw error;

const pending=data.filter(
x=>!x.status||
x.status==="pending"||
x.status==="Pending"
);

let html="<h2>⏳ Pending Orders</h2><br>";

if(pending.length===0){

html+="<div class='card'><h3>No Pending Orders</h3></div>";

}

pending.forEach(order=>{

html+=`

<div class="card"
style="margin-bottom:15px;text-align:left;">

<p><b>🎮 UID :</b> ${order.uid}</p>

<p><b>📦 Product :</b> ${order.product_name}</p>

<p><b>💰 Price :</b>
Rs. ${Number(order.price).toFixed(2)}</p>

<p style="color:orange;">
⏳ Pending
</p>

</div>

`;

});

box.innerHTML=html;

}catch(err){

console.error(err);

showToast("Failed","#dc2626");

}

hideLoading();

};

/* ===========================================
   WALLET TOPUPS
=========================================== */

window.viewWalletTopups = async () => {

closeSidebar();

showLoading();

try {

const { data, error } = await supabase
.from("wallet_topups")
.select("*")
.order("created_at", { ascending: false });

if (error) throw error;

let html = `<h2>💰 Wallet Topups</h2><br>`;

if (!data || data.length === 0) {

html += `
<div class="card">
<h3>No Wallet Requests</h3>
</div>
`;

}

data.forEach(item => {

const color =
item.status === "success"
? "lime"
: item.status === "reject"
? "red"
: "orange";

html += `

<div class="card" style="margin-bottom:18px;text-align:left;">

<p><b>📧 Email :</b> ${item.email}</p>

<p><b>📱 WhatsApp :</b> ${item.whatsapp}</p>

<p><b>💰 Amount :</b>
Rs. ${Number(item.amount).toFixed(2)}
</p>

<p>
<b>Status :</b>
<span style="color:${color}">
${item.status}
</span>
</p>

${
item.receipt_url
?
`<a href="${item.receipt_url}" target="_blank">
📷 View Receipt
</a><br><br>`
:""
}

<button onclick="walletSuccess('${item.id}','${item.user_id}')">
✅ Success
</button>

<button onclick="walletReject('${item.id}')">
❌ Reject
</button>

</div>

`;

});

box.innerHTML = html;

}catch(err){

console.error(err);

showToast("Wallet Load Failed","#dc2626");

}

hideLoading();

};


/* ===========================================
   WALLET SUCCESS
=========================================== */

window.walletSuccess = async(id,userId)=>{

walletPopup.classList.add("active");

walletAmount.value="";

walletCancel.onclick=()=>{

walletPopup.classList.remove("active");

};

walletOk.onclick=async()=>{

const amount=Number(walletAmount.value);

if(!amount){

alert("Enter Amount");

return;

}

walletPopup.classList.remove("active");

const { data: profile } = await supabase
.from("profiles")
.select("wallet_balance")
.eq("id",userId)
.single();

const current=Number(profile?.wallet_balance||0);

await supabase
.from("profiles")
.update({
wallet_balance:current+amount
})
.eq("id",userId);

await supabase
.from("wallet_topups")
.update({
status:"success"
})
.eq("id",id);

showToast("Wallet Updated");

loadCounts();

viewWalletTopups();

};

};


/* ===========================================
   WALLET REJECT
=========================================== */

window.walletReject=async(id)=>{

await supabase

.from("wallet_topups")

.update({
status:"reject"
})

.eq("id",id);

showToast("Rejected","#dc2626");

loadCounts();

viewWalletTopups();

};


/* ===========================================
   MAINTENANCE
=========================================== */

window.maintenancePage=async()=>{

closeSidebar();

const { data } = await supabase

.from("settings")

.select("maintenance")

.eq("id",1)

.single();

box.innerHTML=`

<h2>🛠 Maintenance</h2>

<br>

<h3>

Status :

<span style="color:${data.maintenance?"red":"lime"}">

${data.maintenance?"ON":"OFF"}

</span>

</h3>

<br>

<button onclick="setMaintenance(true)">
🔴 Turn ON
</button>

<br><br>

<button onclick="setMaintenance(false)">
🟢 Turn OFF
</button>

`;

};


window.setMaintenance=async(status)=>{

await supabase

.from("settings")

.update({
maintenance:status
})

.eq("id",1);

showToast("Updated");

maintenancePage();

};


/* ===========================================
   SEARCH
=========================================== */

window.searchOrder = async()=>{

const keyword=document
.getElementById("searchUser")
.value
.toLowerCase();

const { data } =
await supabase
.from("orders")
.select("*");

const filtered=data.filter(item=>

(item.uid||"").toLowerCase().includes(keyword)||

(item.user_id||"").toLowerCase().includes(keyword)||

(item.product_name||"").toLowerCase().includes(keyword)

);

let html="<h2>🔍 Search Result</h2><br>";

filtered.forEach(item=>{

html+=`

<div class="card"
style="margin-bottom:15px;text-align:left;">

<p><b>UID :</b> ${item.uid}</p>

<p><b>Product :</b> ${item.product_name}</p>

<p><b>User :</b> ${item.user_id}</p>

<p><b>Status :</b> ${item.status}</p>

</div>

`;

});

box.innerHTML=html;

};