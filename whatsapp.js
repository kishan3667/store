import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  "https://tvhgxlqqeklrdlgbkosa.supabase.co",
  "sb_publishable_Ep28HPF1SXIXQXBF2i__eg_h_jmjw4I"
);

// Maintenance Check
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

// WhatsApp Button
const whatsappBtn = document.getElementById("whatsappBtn");

whatsappBtn.addEventListener("click", () => {

  whatsappBtn.disabled = true;
  whatsappBtn.innerText = "Opening...";

  setTimeout(() => {

    window.open(
      "https://wa.me/94755377823",
      "_blank"
    );

    whatsappBtn.disabled = false;
    whatsappBtn.innerText = "CHAT NOW";

  }, 500);

});

// Gmail Button
const gmailBtn = document.getElementById("gmailBtn");

gmailBtn.addEventListener("click", () => {

  gmailBtn.disabled = true;
  gmailBtn.innerText = "Opening...";

  setTimeout(() => {

    window.location.href =
      "mailto:phoenixstore31@gmail.com.com?subject=Phoenix%20Support";

    gmailBtn.disabled = false;
    gmailBtn.innerText = "SEND MAIL";

  }, 500);

});

// Discord Button
const discordBtn = document.getElementById("discordBtn");

discordBtn.addEventListener("click", () => {

  discordBtn.disabled = true;
  discordBtn.innerText = "Opening...";

  setTimeout(() => {

    
    window.open(
      "https://discord.gg/FzmhTeh68",
      "_blank"
    );

    discordBtn.disabled = false;
    discordBtn.innerText = "JOIN SERVER";

  }, 500);

});