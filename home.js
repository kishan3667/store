import { createClient } from
"https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
"https://tvhgxlqqeklrdlgbkosa.supabase.co",
"sb_publishable_Ep28HPF1SXIXQXBF2i__eg_h_jmjw4I"
);

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

const { data:{ session } } =
await supabase.auth.getSession();

// Live Wallet Balance

if(session){

const { data: profile } = await supabase
.from("profiles")
.select("wallet_balance")
.eq("id", session.user.id)
.single();

document.getElementById("liveBalance").textContent =
Number(profile?.wallet_balance || 0).toFixed(2);

}

if(session){

const { data } = await supabase
.from("profiles")
.select("avatar_url")
.eq("id", session.user.id)
.single();

const img = document.getElementById("profileImg");

if(img){
  img.src = data?.avatar_url || "pro.jpg";
}

}

// ✅ NAVIGATION
window.goWhatsApp = () => window.location.href = "whatsapp.html";
window.goPayment = () => window.location.href = "payment.html";
window.goTopup = () => window.location.href = "topup.html";
window.goProfile = () => window.location.href = "profile.html";