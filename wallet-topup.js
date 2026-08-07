import { createClient } from
"https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  "https://tvhgxlqqeklrdlgbkosa.supabase.co",
  "sb_publishable_Ep28HPF1SXIXQXBF2i__eg_h_jmjw4I"
);

// Maintenance Check
const { data: settings } = await supabase
  .from("settings")
  .select("maintenance")
  .eq("id", 1)
  .single();

if (
  settings?.maintenance === true &&
  !window.location.pathname.endsWith("maintenance.html")
) {
  window.location.href = "maintenance.html";
}

// Current User
const {
  data: { session }
} = await supabase.auth.getSession();

if (!session) {
  window.location.href = "index.html";
}

const currentUser = session.user;

// Receipt Preview
const receipt = document.getElementById("receipt");
const preview = document.getElementById("previewImage");
const fileText = document.getElementById("fileText");

document.querySelector(".upload-btn").onclick = () => {
  receipt.click();
};

receipt.addEventListener("change", () => {

  const file = receipt.files[0];

  if (!file) return;

  fileText.innerText = "Receipt Selected ✅";

  const reader = new FileReader();

  reader.onload = e => {
    preview.src = e.target.result;
    preview.style.display = "block";
  };

  reader.readAsDataURL(file);

});

// Submit

const submitBtn = document.getElementById("submitBtn");

submitBtn.onclick = async () => {

  submitBtn.disabled = true;
  submitBtn.innerText = "Wait...";

  const amount =
    document.getElementById("amount").value.trim();

  const whatsapp =
    document.getElementById("whatsapp").value.trim();

  const file =
    receipt.files[0];

  const msg =
    document.getElementById("msg");

if (!amount || !whatsapp || !file) {

  msg.innerText = "Fill all fields ⚠️";

  submitBtn.disabled = false;
  submitBtn.innerText = "Submit Wallet Top Up";

  return;

}

  msg.innerText = "Uploading...";

  const fileName =
    Date.now() + "_" + file.name;

  const { error: uploadError } =
    await supabase.storage
      .from("uploads")
      .upload(fileName, file);

if (uploadError) {

  msg.innerText = "Upload Failed ❌";

  submitBtn.disabled = false;
  submitBtn.innerText = "Submit Wallet Top Up";

  return;

}

  const { data: urlData } =
    supabase.storage
      .from("uploads")
      .getPublicUrl(fileName);

  const receipt_url =
    urlData.publicUrl;

  // Save Database
  const { error } =
    await supabase
      .from("wallet_topups")
      .insert({

        user_id: currentUser.id,

        email: currentUser.email,

        whatsapp: whatsapp,

        amount: amount,

        receipt_url: receipt_url,

        status: "pending"

      });

if (error) {

  msg.innerText = error.message;

  submitBtn.disabled = false;
  submitBtn.innerText = "Submit Wallet Top Up";

  return;

}

  // Discord
  const form = new FormData();

  form.append(
    "content",
`💰 Wallet Topup Request

Email : ${currentUser.email}

WhatsApp : ${whatsapp}

Amount : Rs.${amount}

Receipt :
${receipt_url}`
  );

  await fetch(
    "https://discord.com/api/webhooks/1531970544776511540/j0ufnoAuGXDCgyHkwnE_MbgYZZcO-CtYwn4tgY2Ec4nTn-qw0cbkgGYgNVNHvjN9PPjy",
    {
      method: "POST",
      body: form
    }
  );

  msg.innerText = "Wallet Request Submitted ✅";

  submitBtn.innerText = "Submitted ✅";

localStorage.setItem("openWalletHistory", "true");

setTimeout(() => {
    window.location.href = "history.html";
}, 1000);

};