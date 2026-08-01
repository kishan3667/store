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

const msg = document.getElementById("msg");

window.sendOTP = async function () {

  const email = document
    .getElementById("email")
    .value
    .trim();

  if (!email) {

    msg.style.color = "red";
    msg.innerText = "❌ Please enter your email.";

    return;

  }

  msg.style.color = "#38bdf8";
  msg.innerText = "Sending verification code...";

  try {

    const res = await fetch(
      "/.netlify/functions/send-reset-otp",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      }
    );

    const result = await res.json();

    if (!result.success) {

      msg.style.color = "red";
      msg.innerText = "❌ " + result.error;

      return;

    }

    msg.style.color = "lime";
    msg.innerText = "✅ Verification code sent.";

    document
      .getElementById("step1")
      .classList
      .add("hidden");

    document
      .getElementById("step2")
      .classList
      .remove("hidden");

  } catch (err) {

    msg.style.color = "red";
    msg.innerText = "❌ Server error.";

    console.error(err);

  }

};

window.verifyOTP = async function () {

  const email = document
    .getElementById("email")
    .value
    .trim();

  const otp = document
    .getElementById("otp")
    .value
    .trim();

  if (!otp) {
    msg.style.color = "red";
    msg.innerText = "❌ Please enter the verification code.";
    return;
  }

  try {

    const res = await fetch(
      "/.netlify/functions/verify-reset-otp",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          otp
        })
      }
    );

    const result = await res.json();

    if (!result.success) {
      msg.style.color = "red";
      msg.innerText = "❌ " + result.error;
      return;
    }

    msg.style.color = "lime";
    msg.innerText = "✅ Verification successful.";

    document
      .getElementById("step2")
      .classList
      .add("hidden");

    document
      .getElementById("step3")
      .classList
      .remove("hidden");

  } catch (err) {

    console.error(err);

    msg.style.color = "red";
    msg.innerText = "❌ Server error.";

  }

};

window.updatePassword = async function () {

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("newPassword").value;
  const confirm = document.getElementById("confirmPassword").value;

  if (!password || !confirm) {
    msg.style.color = "red";
    msg.innerText = "❌ Fill all fields.";
    return;
  }

  if (password !== confirm) {
    msg.style.color = "red";
    msg.innerText = "❌ Passwords do not match.";
    return;
  }

  try {

    const res = await fetch("/.netlify/functions/update-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        password
      })
    });

    const result = await res.json();

    if (!result.success) {
      msg.style.color = "red";
      msg.innerText = "❌ " + result.error;
      return;
    }

    msg.style.color = "lime";
    msg.innerText = "✅ Password updated successfully.";

    setTimeout(() => {
      window.location.href = "index.html";
    }, 2000);

  } catch (err) {

    console.error(err);
    msg.style.color = "red";
    msg.innerText = "❌ Server error.";

  }

};