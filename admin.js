import { createClient } from
"https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl =
"https://tvhgxlqqeklrdlgbkosa.supabase.co";

const supabaseKey =
"sb_publishable_Ep28HPF1SXIXQXBF2i__eg_h_jmjw4I";

const supabase =
createClient(supabaseUrl, supabaseKey);

const { data, error } = await supabase.auth.getSession();

console.log(data.session);


// 🔒 Protect admin page
if (localStorage.getItem("admin") !== "true") {
  window.location.href = "index.html";
}

// Logout
window.logout = async function () {

  await supabase.auth.signOut();

  localStorage.removeItem("admin");

  window.location.href = "index.html";

};

const box = document.getElementById("contentBox");

const walletPopup = document.getElementById("walletPopup");
const walletAmount = document.getElementById("walletAmount");
const walletOk = document.getElementById("walletOk");
const walletCancel = document.getElementById("walletCancel");
const toast = document.getElementById("toast");

function showToast(message, color = "#22c55e") {
  toast.innerText = message;
  toast.style.background = color;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2000);
}

// Sidebar
window.openSidebar = function () {
  document.getElementById("sidebar").classList.add("active");
  document.getElementById("overlay").classList.add("active");
};

window.closeSidebar = function () {
  document.getElementById("sidebar").classList.remove("active");
  document.getElementById("overlay").classList.remove("active");
};

// Dashboard
window.showDashboard = async function () {

  closeSidebar();

  const { count: totalUsers } =
  await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  const { data: orders } =
  await supabase
    .from("orders")
    .select("*");

    console.log("ORDERS:", orders);

  const totalOrders = orders.length;

  let success = 0;
  let rejected = 0;
  let pending = 0;

  orders.forEach((order) => {

    if (order.status === "success") {
      success++;
    } else if (order.status === "reject") {
      rejected++;
    } else {
      pending++;
    }

  });

  let successPer =
    totalOrders ? ((success / totalOrders) * 100).toFixed(0) : 0;

  let rejectPer =
    totalOrders ? ((rejected / totalOrders) * 100).toFixed(0) : 0;

  let pendingPer =
    totalOrders ? ((pending / totalOrders) * 100).toFixed(0) : 0;

  box.innerHTML = `
  <h2>📊 Dashboard Analytics</h2><br>

  <div class="cards">
    <div class="card">
      <h3>👤 Users</h3>
      <p>${totalUsers || 0}</p>
    </div>

    <div class="card">
      <h3>📦 Orders</h3>
      <p>${totalOrders}</p>
    </div>

    <div class="card">
      <h3>✅ Success</h3>
      <p>${successPer}%</p>
    </div>

    <div class="card">
      <h3>❌ Rejected</h3>
      <p>${rejectPer}%</p>
    </div>

    <div class="card">
      <h3>🟡 Pending</h3>
      <p>${pendingPer}%</p>
    </div>
  </div>
  `;

};

// 🔥 Users (Firestore)
window.viewUsers = async function () {

  closeSidebar();

  const { data: users, error } =
  await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  let html = "<h2>👤 Users List</h2><br>";

  if (error) {
    box.innerHTML = "<h2>Failed to load users ❌</h2>";
    return;
  }

  users.forEach((user) => {

    html += `
    <div style="
      background:#0f172a;
      padding:15px;
      margin-bottom:10px;
      border-radius:10px;
    ">

      <p>👤 ${user.username || "No Username"}</p>

      <p>📧 ${user.email}</p>

      <p>🆔 ${user.id}</p>

    </div>
    `;

  });

  box.innerHTML = html;

};

// Other buttons
window.viewTopups = async function () {

  closeSidebar();

  const { data: orders, error } = await supabase
    .from("orders")
    .select("*");

  let html = "<h2>💰 Successful Topups</h2><br>";

  if (error) {
    box.innerHTML = "<h2>Failed to load orders ❌</h2>";
    return;
  }

  orders.forEach((data) => {

    if (data.status === "success") {

      html += `
      <div style="
        background:#0f172a;
        padding:15px;
        margin-bottom:10px;
        border-radius:10px;
      ">
        <p>🎮 UID : ${data.uid}</p>
        <p>🎮 Product : ${data.product_name}</p>
        <p>📂 Category : ${data.category}</p>
        <p>💵 Price : Rs. ${Number(data.price).toFixed(2)}</p>
        <p style="color:lime;">✅ Status : success</p>
        <p>👤 User ID : ${data.user_id}</p>
      </div>
      `;

    }

  });

  box.innerHTML = html;

};

window.viewOrders = async function () {

  closeSidebar();

  const { data: orders, error } =
await supabase
.from("orders")
.select("*")
.order("created_at", { ascending: false });

console.log("ORDERS:", orders);
console.log("ERROR:", error);

if (error) {
  box.innerHTML = "<h2>Failed to load orders ❌</h2>";
  return;
}

let html = `
<h2>📦 Orders List</h2><br>

<input
id="searchUser"
type="text"
placeholder="Search User ID..."
onkeyup="searchOrder()"
style="
width:100%;
padding:10px;
margin-bottom:15px;
border-radius:10px;
">
`;

if (orders.length === 0) {
  html += "<p>No Orders Found</p>";
}

orders.forEach((data) => {

    html += `
    <div style="
      background:#0f172a;
      padding:15px;
      margin-bottom:10px;
      border-radius:10px;
    ">
      <p>🆔 Order ID : ${data.id}</p>
      <p>🎮 UID : ${data.uid}</p>
      <p>🎮 Product : ${data.product_name}</p>
      <p>📂 Category : ${data.category}</p>
      <p>💵 Price : Rs. ${Number(data.price).toFixed(2)}</p>
      <p>👤 User ID : ${data.user_id}</p>
📌 Status :
<span style="
color:${
data.status === 'success'
? 'lime'
: data.status === 'reject'
? 'red'
: 'orange'
}">
${data.status || 'pending'}
</span>
</p>

<br>

<button onclick="setStatus('${data.id}','success')">
✅ Success
</button>

<button onclick="setStatus('${data.id}','reject')">
❌ Reject
</button>

    </div>
    `;
  });

  box.innerHTML = html;
};

// 🔥 Load counts
async function loadCounts() {

  const { count: usersCount } =
  await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  document.getElementById("usersCount").innerText =
    usersCount || 0;

  const { data: orders } =
  await supabase
    .from("orders")
    .select("*");

  document.getElementById("ordersCount").innerText =
    orders.length;

  let successCount = 0;

  orders.forEach((order) => {

    if (order.status === "success") {
      successCount++;
    }

  });

  document.getElementById("topupCount").innerText =
    successCount;

  document.getElementById("loadingIcon").style.display =
    "none";

    const { data: walletOrders } = await supabase
  .from("wallet_topups")
  .select("*")
  .eq("status", "pending");

document.getElementById("walletPendingCount").innerText =
  walletOrders ? walletOrders.length : 0;

}

loadCounts();
showDashboard();

window.setStatus = async function(id, status) {

    console.log("ORDER ID:", id);
    console.log("STATUS:", status);

     const { data: sessionData } = await supabase.auth.getSession();

     console.log("SESSION:", sessionData.session);

const { data, error } = await supabase
  .from("orders")
  .update({ status: status })
  .eq("id", id)
  .select();

console.log("UPDATE DATA:", data);
console.log("UPDATE ERROR:", error);
console.log("Updated:", data);
console.log("Error:", error);

  if (error) {
    alert("Failed to update status!");
    console.error(error);
    return;
  }

  const msg = document.createElement("div");

  msg.innerText = "Status Updated ✅";
  msg.style.position = "fixed";
  msg.style.top = "20px";
  msg.style.right = "20px";
  msg.style.background = "green";
  msg.style.color = "white";
  msg.style.padding = "10px";
  msg.style.borderRadius = "8px";

  document.body.appendChild(msg);

  setTimeout(() => {
    msg.remove();
  }, 2000);

  viewOrders();
};

window.viewRejected = async function () {

  closeSidebar();

  const { data: orders, error } = await supabase
  .from("orders")
  .select("*");

  let html = "<h2>❌ Rejected Orders</h2><br>";

orders.forEach((data) => {

    if (data.status === "reject") {

      html += `
      <div style="
        background:#0f172a;
        padding:15px;
        margin-bottom:10px;
        border-radius:10px;
      ">
        <p>🎮 UID : ${data.uid}</p>
        <p>🎮 Product : ${data.product_name}</p>
        <p>📂 Category : ${data.category}</p>
        <p>💵 Price : Rs. ${Number(data.price).toFixed(2)}</p>
        <p style="color:red;">❌ Status : reject</p>
        <p>👤 User ID : ${data.user_id}</p>
      </div>
      `;
    }

  });

  box.innerHTML = html;
};

window.viewPending = async function () {

  closeSidebar();

const { data: orders, error } = await supabase
.from("orders")
.select("*");

  let html = "<h2>⏳ Pending Orders</h2><br>";

orders.forEach((data) => {

    if (
      data.status === "Pending" ||
      !data.status
    ) {

      html += `
      <div style="
        background:#0f172a;
        padding:15px;
        margin-bottom:10px;
        border-radius:10px;
      ">
        <p>🎮 UID : ${data.uid}</p>
        <p>🎮 Product : ${data.product_name}</p>
        <p>📂 Category : ${data.category}</p>
        <p>💵 Price : Rs. ${Number(data.price).toFixed(2)}</p>
        <p style="color:orange;">⏳ Status : pending</p>
        <p>👤 User ID : ${data.user_id}</p>
      </div>
      `;
    }

  });

  box.innerHTML = html;
};

window.maintenancePage = async function () {

  closeSidebar();

  const { data, error } = await supabase
    .from("settings")
    .select("maintenance")
    .eq("id", 1)
    .single();

  if (error) {
    box.innerHTML = "<h2>Failed to load maintenance settings ❌</h2>";
    return;
  }

  box.innerHTML = `
    <h2>🛠 Website Maintenance</h2>

    <br>

    <h3>Status :
      <span style="color:${data.maintenance ? "red" : "lime"};">
        ${data.maintenance ? "ON" : "OFF"}
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

window.setMaintenance = async function(status){

  const { error } = await supabase
    .from("settings")
    .update({ maintenance: status })
    .eq("id", 1);

  if(error){
    alert("Failed");
    return;
  }

  // புதிய data-வை மீண்டும் load பண்ணும்
  await maintenancePage();

}
window.searchOrder = async function () {

  const search =
    document.getElementById("searchUser")
    .value
    .toLowerCase();

  const { data: orders, error } = await supabase
    .from("orders")
    .select("*");

  if (error) {
    box.innerHTML = "<h2>Failed to search ❌</h2>";
    return;
  }

  let html = `
  <h2>📦 Search Results</h2><br>
  `;

  orders.forEach((data) => {

if (
  data.user_id?.toLowerCase().includes(search) ||
  data.uid?.toLowerCase().includes(search) ||
  data.product_name?.toLowerCase().includes(search)
) {
      html += `
      <div style="
      background:#0f172a;
      padding:15px;
      margin-bottom:10px;
      border-radius:10px;
      ">
        <p>🎮 UID : ${data.uid}</p>
        <p>🎮 Product : ${data.product_name}</p>
        <p>📂 Category : ${data.category}</p>
        <p>💵 Price : Rs. ${Number(data.price).toFixed(2)}</p>
        <p>👤 User ID : ${data.user_id}</p>
        <p>📌 Status : ${data.status}</p>
      </div>
      `;
    }

  });

  box.innerHTML = html;

};

window.viewWalletTopups = async function () {

  closeSidebar();

  const { data: requests, error } = await supabase
    .from("wallet_topups")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    box.innerHTML = "<h2>Failed to load wallet requests ❌</h2>";
    return;
  }

  let html = "<h2>💰 Wallet Topup Requests</h2><br>";

  if (requests.length === 0) {
    html += "<p>No Wallet Requests</p>";
  }

  requests.forEach((item) => {

    html += `
      <div style="
      background:#0f172a;
      padding:15px;
      margin-bottom:15px;
      border-radius:10px;">

      <p>📧 Email : ${item.email}</p>
      <p>📱 WhatsApp : ${item.whatsapp}</p>
      <p>💵 Requested : Rs.${item.amount}</p>

      <p>
      📌 Status :
      <span style="
      color:${
        item.status === "success"
          ? "lime"
          : item.status === "reject"
          ? "red"
          : "orange"
      };">
      ${item.status}
      </span>
      </p>

      <a href="${item.receipt_url}"
      target="_blank"
      style="color:#38bdf8;">
      📷 View Receipt
      </a>

      <br><br>

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

};

window.walletSuccess = async function(id, userId){

  walletPopup.classList.add("active");
  walletAmount.value = "";
  walletAmount.focus();

  walletCancel.onclick = () => {
    walletPopup.classList.remove("active");
  };

  walletOk.onclick = async () => {

const amount = walletAmount.value.trim();

if (!amount || isNaN(amount) || Number(amount) <= 0) {
  alert("Enter valid amount");
  return;
}

walletPopup.classList.remove("active");

  // User wallet balance எடு
const { data: profile, error: profileError } = await supabase
  .from("profiles")
  .select("wallet_balance")
  .eq("id", userId)
  .single();

console.log("PROFILE:", profile);
console.log("PROFILE ERROR:", profileError);

if (profileError) {
  alert(profileError.message);
  return;
}

console.log("userId =", userId);

const { data: profileCheck } = await supabase
  .from("profiles")
  .select("*")
  .eq("id", userId);

console.log("profileCheck =", profileCheck);

  const currentWallet = Number(profile?.wallet_balance || 0);
  const newWallet = currentWallet + Number(amount);

const { error: walletError } = await supabase
  .from("profiles")
  .update({
    wallet_balance: newWallet
  })
  .eq("id", userId);

console.log(walletError);

const { data: checkProfile } = await supabase
  .from("profiles")
  .select("wallet_balance")
  .eq("id", userId)
  .single();

console.log("AFTER UPDATE =", checkProfile);

if (walletError) {
  alert(walletError.message);
  return;
}

const { data: updatedRow, error: statusError } = await supabase
  .from("wallet_topups")
  .update({
    status: "success"
  })
  .eq("id", id)
  .select();

console.log(updatedRow);
console.log(statusError);

if (statusError) {
  alert(statusError.message);
  return;
}

showToast("Wallet Updated Successfully ✅");
loadCounts();
viewWalletTopups();

};

  };

window.walletReject = async function(id){

  await supabase
    .from("wallet_topups")
    .update({
      status: "reject"
    })
    .eq("id", id);

  showToast("Wallet Request Rejected ❌", "#ef4444");
loadCounts();

  viewWalletTopups();

};