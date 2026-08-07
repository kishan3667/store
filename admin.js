import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

/* ===========================================
   PHOENIX ADMIN PANEL V3
=========================================== */

const supabase = createClient(
  "https://tvhgxlqqeklrdlgbkosa.supabase.co",
  "sb_publishable_Ep28HPF1SXIXQXBF2i__eg_h_jmjw4I"
);

/* ===========================================
   GLOBAL ELEMENTS
=========================================== */

const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const contentBox = document.getElementById("contentBox");

const loading = document.getElementById("loadingScreen");

const toast = document.getElementById("toast");

const walletPopup = document.getElementById("walletPopup");
const walletAmount = document.getElementById("walletAmount");
const walletOk = document.getElementById("walletOk");
const walletCancel = document.getElementById("walletCancel");

let currentAdmin = null;

/* ===========================================
   LOADING
=========================================== */

function showLoading() {
  if (loading) loading.style.display = "flex";
}

function hideLoading() {
  if (loading) loading.style.display = "none";
}

/* ===========================================
   TOAST
=========================================== */

function showToast(message, color = "#16a34a") {

  if (!toast) return;

  toast.innerText = message;
  toast.style.background = color;

  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);

}

/* ===========================================
   SIDEBAR
=========================================== */

window.openSidebar = () => {

  sidebar.classList.add("active");
  overlay.classList.add("active");

};

window.closeSidebar = () => {

  sidebar.classList.remove("active");
  overlay.classList.remove("active");

};

/* ===========================================
   AUTH CHECK
=========================================== */

async function checkAdmin() {

  showLoading();

  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) {

    location.href = "adminlogin.html";
    return;

  }

  currentAdmin = session.user;

  const { data: admin, error } = await supabase
    .from("admin_users")
    .select("*")
    .eq("id", currentAdmin.id)
    .single();

  if (error || !admin) {

    await supabase.auth.signOut();
    location.href = "index.html";
    return;

  }

  hideLoading();

  loadCounts();

  showDashboard();

}

/* ===========================================
   LOGOUT
=========================================== */

window.logout = async () => {

  await supabase.auth.signOut();

  location.replace("index.html");

};

/* ===========================================
   DASHBOARD COUNTS
=========================================== */

async function loadCounts() {

  try {

    const { count: users } = await supabase
      .from("profiles")
      .select("*", {
        count: "exact",
        head: true
      });

    document.getElementById("usersCount").innerText =
      users || 0;

    const { data: orders = [] } = await supabase
      .from("orders")
      .select("*");

    document.getElementById("ordersCount").innerText =
      orders.length;

    const success =
      orders.filter(x => x.status === "success");

    document.getElementById("topupCount").innerText =
      success.length;

    const { data: wallet = [] } = await supabase
      .from("wallet_topups")
      .select("*")
      .eq("status", "pending");

    document.getElementById("walletPendingCount").innerText =
      wallet.length;

  }

  catch (err) {

    console.error(err);

    showToast(
      "Dashboard Load Failed",
      "#dc2626"
    );

  }

}

/* Start */

checkAdmin();

/* ===========================================
   DASHBOARD
=========================================== */

window.showDashboard = async () => {

  closeSidebar();

  showLoading();

  try {

    const { count: totalUsers } = await supabase
      .from("profiles")
      .select("*", {
        count: "exact",
        head: true
      });

    const { data: orders = [] } = await supabase
      .from("orders")
      .select("*");

    const totalOrders = orders.length;

    const success =
      orders.filter(x => x.status === "success").length;

    const rejected =
      orders.filter(x => x.status === "reject").length;

    const pending =
      orders.filter(x =>
        !x.status ||
        x.status === "pending" ||
        x.status === "Pending"
      ).length;

    const walletPending =
      document.getElementById("walletPendingCount").innerText;

    contentBox.innerHTML = `

<div class="dashboardCards">

<div class="statCard">
<div class="icon">👤</div>
<div class="info">
<h4>Total Users</h4>
<h2>${totalUsers || 0}</h2>
</div>
</div>

<div class="statCard">
<div class="icon">📦</div>
<div class="info">
<h4>Total Orders</h4>
<h2>${totalOrders}</h2>
</div>
</div>

<div class="statCard">
<div class="icon">💰</div>
<div class="info">
<h4>Wallet Pending</h4>
<h2>${walletPending}</h2>
</div>
</div>

<div class="statCard">
<div class="icon">✅</div>
<div class="info">
<h4>Success Orders</h4>
<h2>${success}</h2>
</div>
</div>

</div>

<div class="contentLayout">

<div class="panel">

<div class="panelHeader">

<h2>📊 Live Analytics</h2>

</div>

<div class="panelBody">

<div class="analyticsGrid">

<div class="analyticsCard">
<h3>Success</h3>
<h1>${success}</h1>
<p>Completed Orders</p>
</div>

<div class="analyticsCard">
<h3>Pending</h3>
<h1>${pending}</h1>
<p>Waiting Orders</p>
</div>

<div class="analyticsCard">
<h3>Rejected</h3>
<h1>${rejected}</h1>
<p>Cancelled Orders</p>
</div>

</div>

</div>

</div>

<div class="panel">

<div class="panelHeader">

<h2>⚡ Server Status</h2>

</div>

<div class="serverStatus">

<div class="statusItem">

<div class="dot green"></div>

Supabase Connected

</div>

<div class="statusItem">

<div class="dot green"></div>

Authentication Active

</div>

<div class="statusItem">

<div class="dot green"></div>

Admin Panel Online

</div>

</div>

</div>

</div>

`;

  }

  catch (err) {

    console.error(err);

    showToast(
      "Dashboard Error",
      "#dc2626"
    );

  }

  hideLoading();

};

/* ===========================================
   USERS PAGE
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

<div class="panel">

<div class="panelHeader">

<h2>👥 Registered Users</h2>

</div>

<div class="panelBody">

`;

    if (!users || users.length === 0) {

      html += `

<div class="statCard">

<div class="icon">❌</div>

<div class="info">

<h4>No Users Found</h4>

<h2>0</h2>

</div>

</div>

`;

    } else {

      users.forEach(user => {

        html += `

<div class="statCard" style="margin-bottom:18px;">

<div class="icon">👤</div>

<div class="info">

<h4>${user.username || "Unknown User"}</h4>

<p><b>📧</b> ${user.email}</p>

<p><b>🆔</b> ${user.id}</p>

<p><b>💰 Wallet :</b> Rs. ${Number(user.wallet_balance || 0).toFixed(2)}</p>

<p><b>📅 Joined :</b> ${new Date(user.created_at).toLocaleString()}</p>

</div>

</div>

`;

      });

    }

    html += `

</div>

</div>

`;

    contentBox.innerHTML = html;

  }

  catch (err) {

    console.error(err);

    showToast("Failed To Load Users", "#dc2626");

  }

  hideLoading();

};

/* ===========================================
   ORDERS PAGE
=========================================== */

window.viewOrders = async () => {

  closeSidebar();

  showLoading();

  try {

    const { data: orders, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    let html = `

<div class="panel">

<div class="panelHeader">

<h2>📦 Orders Management</h2>

</div>

<div class="panelBody">

<input
id="searchUser"
type="text"
placeholder="🔍 Search UID / User ID / Product..."
onkeyup="searchOrder()">

`;

    if (!orders || orders.length === 0) {

      html += `

<div class="statCard">

<div class="icon">📦</div>

<div class="info">

<h4>No Orders Found</h4>

<h2>0</h2>

</div>

</div>

`;

    } else {

      orders.forEach(order => {

        let statusColor = "#f59e0b";

        if (order.status === "success")
          statusColor = "#22c55e";

        if (order.status === "reject")
          statusColor = "#ef4444";

        html += `

<div class="card">

<h3>🎮 ${order.product_name}</h3>

<p><b>UID :</b> ${order.uid}</p>

<p><b>Category :</b> ${order.category}</p>

<p><b>Price :</b> Rs. ${Number(order.price).toFixed(2)}</p>

<p><b>User :</b> ${order.user_id}</p>

<p>

<b>Status :</b>

<span style="color:${statusColor};font-weight:bold;">

${order.status || "pending"}

</span>

</p>

${order.receipt_url ?

`<a href="${order.receipt_url}" target="_blank">

📷 View Receipt

</a>`

: ""}

<div>

<button onclick="setStatus('${order.id}','success')">

✅ Success

</button>

<button onclick="setStatus('${order.id}','reject')">

❌ Reject

</button>

</div>

</div>

`;

      });

    }

    html += `

</div>

</div>

`;

    contentBox.innerHTML = html;

  }

  catch (err) {

    console.error(err);

    showToast(
      "Failed To Load Orders",
      "#dc2626"
    );

  }

  hideLoading();

};

/* ===========================================
   UPDATE ORDER STATUS
=========================================== */

window.setStatus = async (id, status) => {

  try {

    showLoading();

    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", id);

    if (error) throw error;

    showToast("Status Updated ✅");

    await loadCounts();

    await viewOrders();

  }

  catch (err) {

    console.error(err);

    showToast("Update Failed", "#dc2626");

  }

  hideLoading();

};

/* ===========================================
   SUCCESS ORDERS
=========================================== */

window.viewTopups = async () => {

  closeSidebar();

  showLoading();

  try {

    const { data = [] } = await supabase
      .from("orders")
      .select("*")
      .eq("status", "success")
      .order("created_at", { ascending: false });

    renderStatusPage(
      "✅ Success Orders",
      data,
      "#22c55e"
    );

  } catch (err) {

    console.error(err);

    showToast("Load Failed", "#dc2626");

  }

  hideLoading();

};

/* ===========================================
   REJECTED ORDERS
=========================================== */

window.viewRejected = async () => {

  closeSidebar();

  showLoading();

  try {

    const { data = [] } = await supabase
      .from("orders")
      .select("*")
      .eq("status", "reject")
      .order("created_at", { ascending: false });

    renderStatusPage(
      "❌ Rejected Orders",
      data,
      "#ef4444"
    );

  } catch (err) {

    console.error(err);

    showToast("Load Failed", "#dc2626");

  }

  hideLoading();

};

/* ===========================================
   PENDING ORDERS
=========================================== */

window.viewPending = async () => {

  closeSidebar();

  showLoading();

  try {

    const { data = [] } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    const pending = data.filter(x =>
      !x.status ||
      x.status === "pending" ||
      x.status === "Pending"
    );

    renderStatusPage(
      "⏳ Pending Orders",
      pending,
      "#f59e0b"
    );

  } catch (err) {

    console.error(err);

    showToast("Load Failed", "#dc2626");

  }

  hideLoading();

};

/* ===========================================
   COMMON RENDER FUNCTION
=========================================== */

function renderStatusPage(title, orders, color) {

  let html = `

<div class="panel">

<div class="panelHeader">

<h2>${title}</h2>

</div>

<div class="panelBody">

`;

  if (orders.length === 0) {

    html += `

<div class="statCard">

<div class="icon">📦</div>

<div class="info">

<h4>No Orders</h4>

<h2>0</h2>

</div>

</div>

`;

  }

  orders.forEach(order => {

    html += `

<div class="card">

<h3>${order.product_name}</h3>

<p><b>UID :</b> ${order.uid}</p>

<p><b>Price :</b> Rs. ${Number(order.price).toFixed(2)}</p>

<p>

<b>Status :</b>

<span style="color:${color};font-weight:bold;">

${order.status || "pending"}

</span>

</p>

</div>

`;

  });

  html += `

</div>

</div>

`;

  contentBox.innerHTML = html;

}

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

    let html = `

<div class="panel">

<div class="panelHeader">

<h2>💰 Wallet Topups</h2>

</div>

<div class="panelBody">

`;

    if (!data || data.length === 0) {

      html += `

<div class="statCard">

<div class="icon">💰</div>

<div class="info">

<h4>No Wallet Requests</h4>

<h2>0</h2>

</div>

</div>

`;

    } else {

      data.forEach(item => {

        let color = "#f59e0b";

        if (item.status === "success") color = "#22c55e";
        if (item.status === "reject") color = "#ef4444";

        html += `

<div class="card">

<h3>${item.email}</h3>

<p><b>📱 WhatsApp :</b> ${item.whatsapp}</p>

<p><b>💰 Amount :</b> Rs. ${Number(item.amount).toFixed(2)}</p>

<p>

<b>Status :</b>

<span style="color:${color};font-weight:bold;">

${item.status}

</span>

</p>

${item.receipt_url ?

`<a href="${item.receipt_url}" target="_blank">

📷 View Receipt

</a>`

: ""}

<div>

<button onclick="walletSuccess('${item.id}','${item.user_id}')">

✅ Success

</button>

<button onclick="walletReject('${item.id}')">

❌ Reject

</button>

</div>

</div>

`;

      });

    }

    html += `

</div>

</div>

`;

    contentBox.innerHTML = html;

  }

  catch (err) {

    console.error(err);

    showToast("Wallet Load Failed", "#dc2626");

  }

  hideLoading();

};

/* ===========================================
   WALLET SUCCESS
=========================================== */

window.walletSuccess = async (id, userId) => {

  walletPopup.classList.add("active");

  walletAmount.value = "";

  walletCancel.onclick = () => {

    walletPopup.classList.remove("active");

  };

  walletOk.onclick = async () => {

    const amount = Number(walletAmount.value);

    if (!amount) {

      alert("Enter Wallet Amount");

      return;

    }

    walletPopup.classList.remove("active");

    const { data: profile } = await supabase

      .from("profiles")

      .select("wallet_balance")

      .eq("id", userId)

      .single();

    const current = Number(profile?.wallet_balance || 0);

    await supabase

      .from("profiles")

      .update({

        wallet_balance: current + amount

      })

      .eq("id", userId);

    await supabase

      .from("wallet_topups")

      .update({

        status: "success"

      })

      .eq("id", id);

    showToast("Wallet Updated ✅");

    loadCounts();

    viewWalletTopups();

  };

};

/* ===========================================
   WALLET REJECT
=========================================== */

window.walletReject = async (id) => {

  await supabase

    .from("wallet_topups")

    .update({

      status: "reject"

    })

    .eq("id", id);

  showToast("Wallet Rejected", "#dc2626");

  loadCounts();

  viewWalletTopups();

};

/* ===========================================
   SEARCH ORDERS
=========================================== */

window.searchOrder = async () => {

  const keyword = document
    .getElementById("searchUser")
    .value
    .trim()
    .toLowerCase();

  const { data } = await supabase
    .from("orders")
    .select("*");

  const filtered = data.filter(item =>
    (item.uid || "").toLowerCase().includes(keyword) ||
    (item.user_id || "").toLowerCase().includes(keyword) ||
    (item.product_name || "").toLowerCase().includes(keyword) ||
    (item.category || "").toLowerCase().includes(keyword)
  );

  let html = `

<div class="panel">

<div class="panelHeader">

<h2>🔍 Search Results</h2>

</div>

<div class="panelBody">

`;

  if (filtered.length === 0) {

    html += `
<div class="statCard">
<div class="icon">❌</div>
<div class="info">
<h4>No Results Found</h4>
</div>
</div>
`;

  } else {

    filtered.forEach(item => {

      let color = "#f59e0b";

      if (item.status === "success") color = "#22c55e";
      if (item.status === "reject") color = "#ef4444";

      html += `

<div class="card">

<h3>${item.product_name}</h3>

<p><b>🎮 UID :</b> ${item.uid}</p>

<p><b>👤 User :</b> ${item.user_id}</p>

<p>

<b>Status :</b>

<span style="color:${color};font-weight:bold;">

${item.status}

</span>

</p>

</div>

`;

    });

  }

  html += `
</div>
</div>
`;

  contentBox.innerHTML = html;

};

/* ===========================================
   MAINTENANCE
=========================================== */

window.maintenancePage = async () => {

  closeSidebar();

  const { data } = await supabase
    .from("settings")
    .select("maintenance")
    .eq("id", 1)
    .single();

  contentBox.innerHTML = `

<div class="panel">

<div class="panelHeader">

<h2>🛠 Maintenance Mode</h2>

</div>

<div class="panelBody">

<div class="statCard">

<div class="icon">

${data.maintenance ? "🔴" : "🟢"}

</div>

<div class="info">

<h4>Status</h4>

<h2>

${data.maintenance ? "ON" : "OFF"}

</h2>

</div>

</div>

<br>

<button onclick="setMaintenance(true)">

🔴 Turn ON

</button>

<br><br>

<button onclick="setMaintenance(false)">

🟢 Turn OFF

</button>

</div>

</div>

`;

};

window.setMaintenance = async (status) => {

  await supabase
    .from("settings")
    .update({
      maintenance: status
    })
    .eq("id", 1);

  showToast("Maintenance Updated ✅");

  maintenancePage();

};

/* ===========================================
   REFRESH DASHBOARD
=========================================== */

window.refreshDashboard = async () => {

  await loadCounts();

  await showDashboard();

};

/* ===========================================
   INITIAL LOAD
=========================================== */

