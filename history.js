import { createClient } from
"https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl =
"https://tvhgxlqqeklrdlgbkosa.supabase.co";

const supabaseKey =
"sb_publishable_Ep28HPF1SXIXQXBF2i__eg_h_jmjw4I";

const supabase =
createClient(supabaseUrl, supabaseKey);

const { data } = await supabase
  .from("settings")
  .select("maintenance")
  .eq("id", 1)
  .single();

if (
  data?.maintenance === true &&
  !window.location.pathname.endsWith("maintenance.html")
) {
  window.location.href = "maintenance.html";
}

const topupBox =
document.getElementById("topupHistory");

const walletBox =
document.getElementById("walletHistory");

const {
  data: { session }
} = await supabase.auth.getSession();

if (!session) {
  window.location.href = "index.html";
}

// Live Wallet Balance
const { data: profile, error: profileError } = await supabase
  .from("profiles")
  .select("wallet_balance")
  .eq("id", session.user.id)
  .single();

if (!profileError) {
  document.getElementById("liveBalance").textContent =
    Number(profile.wallet_balance || 0).toFixed(2);
}

const { data: orders, error } =
await supabase
.from("orders")
.select("*")
.eq("user_id", session.user.id)
.order("created_at", { ascending: false });

let html = "";

if (!error) {

  orders.forEach((data) => {

    let colorClass = "pending";

    if (data.status === "success") {
      colorClass = "success";
    } else if (data.status === "reject") {
      colorClass = "reject";
    }

    html += `
<div class="card">

<p>🆔 Order ID : ${data.id}</p>

<p>🎮 UID : ${data.uid}</p>

<p>💎 Product : ${data.product_name}</p>

<p>📂 Category : ${data.category}</p>

<p>
💵 Price :
Rs. ${
Number(data.total_price || data.price).toFixed(2)
}
${
(data.quantity || 1) > 1
? ` × ${data.quantity}`
: ""
}
</p>

<p>
📌 Status :
<span class="${colorClass}">
${data.status}
</span>
</p>

</div>
`;

  });

}

if (html === "") {

  html = `
<div class="card" style="text-align:center;">

<i class="fas fa-clock-rotate-left"
style="font-size:40px;color:#38bdf8;"></i>

<h3>No Top-Up History Found</h3>

<p>Your top-up history will appear here</p>

</div>
`;

}

topupBox.innerHTML = html;

// Wallet History

const { data: wallets, error: walletError } =
await supabase
.from("wallet_topups")
.select("*")
.eq("user_id", session.user.id)
.order("created_at", { ascending: false });

let walletHtml = "";

if (!walletError) {

  wallets.forEach((data) => {

    let colorClass = "pending";

    if (data.status === "success") {
      colorClass = "success";
    } else if (data.status === "reject") {
      colorClass = "reject";
    }

    walletHtml += `
<div class="card">

<p>💰 Amount : Rs. ${data.amount}</p>

<p>📱 WhatsApp : ${data.whatsapp}</p>

<p>📧 Email : ${data.email}</p>

<p>
📌 Status :
<span class="${colorClass}">
${data.status}
</span>
</p>

${
data.receipt_url
? `<p>
🧾 <a href="${data.receipt_url}" target="_blank"
style="color:#38bdf8;text-decoration:none;">
View Receipt
</a>
</p>`
: ""
}

</div>
`;

  });

}

if (walletHtml === "") {

  walletHtml = `
<div class="card" style="text-align:center;">

<i class="fas fa-wallet"
style="font-size:40px;color:#38bdf8;"></i>

<h3>No Wallet History Found</h3>

<p>Your wallet history will appear here</p>

</div>
`;

}

walletBox.innerHTML = walletHtml;


// Tab Switch

const topupTab =
document.getElementById("topupTab");

const walletTab =
document.getElementById("walletTab");

topupTab.onclick = () => {

topupHistory.style.display = "block";

walletHistory.style.display = "none";

topupTab.classList.add("active");

walletTab.classList.remove("active");

};

walletTab.onclick = () => {

topupHistory.style.display = "none";

walletHistory.style.display = "block";

walletTab.classList.add("active");

topupTab.classList.remove("active");

};

if (localStorage.getItem("openWalletHistory") === "true") {

  localStorage.removeItem("openWalletHistory");

  topupHistory.style.display = "none";
  walletHistory.style.display = "block";

  walletTab.classList.add("active");
  topupTab.classList.remove("active");

}