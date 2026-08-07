import { createClient } from 
"https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl =
"https://tvhgxlqqeklrdlgbkosa.supabase.co";

const supabaseKey =
"sb_publishable_Ep28HPF1SXIXQXBF2i__eg_h_jmjw4I";

const supabase =
createClient(supabaseUrl,supabaseKey);

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

const form =
document.getElementById("registerForm");

const popup =
document.getElementById("otpPopup");

const verifyBtn =
document.getElementById("verifyOtpBtn");

const createBtn =
document.querySelector("#registerForm button[type='submit']");

form.addEventListener("submit", async(e)=>{

e.preventDefault();

createBtn.disabled = true;
createBtn.innerText = "Verifying Account...";

const email =
document.getElementById("email").value.trim();

const password =
document.getElementById("password").value.trim();

if(password.length < 6){
  alert("Password must be at least 6 characters");
  return;
}


try {

const checkResponse = await fetch("/.netlify/functions/check-user", {
method:"POST",
headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
email:email
})
});
const checkResult = await checkResponse.json();
if(checkResult.exists){
alert("Email already used. Please login.");
return;
}

const response =
await fetch("/.netlify/functions/send",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
email:email
})

});


const result =
await response.json();


if(result.success){

popup.style.display="flex";

startOtpTimer();

createBtn.disabled = false;
createBtn.innerText = "Create Account";

}

else{

alert(result.error);

}

} catch(error) {

createBtn.disabled = false;
createBtn.innerText = "Create Account";

alert(error.message);

}

});

const resendBtn =
document.getElementById("resendOtpBtn");

const timerText =
document.getElementById("otpTimer");

let timerInterval;

function startOtpTimer(){

  if(timerInterval){
  clearInterval(timerInterval);
}

let time = 120; // 2 minutes

resendBtn.disabled = true;

timerInterval = setInterval(()=>{

let minutes = Math.floor(time / 60);
let seconds = time % 60;


timerText.innerText =
`Resend OTP in ${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;


time--;


if(time < 0){

clearInterval(timerInterval);

timerText.innerText =
"";

resendBtn.disabled = false;

}

},1000);

}

verifyBtn.addEventListener("click",async()=>{

verifyBtn.disabled = true;
verifyBtn.innerText = "Wait...";

const email =
document.getElementById("email").value.trim();

const otp =
document.getElementById("otpInput").value.trim();

if(otp.length !== 6){

alert("Enter 6 digit OTP");

verifyBtn.disabled = false;
verifyBtn.innerText = "Verify OTP";

return;

}

const response =
await fetch("/.netlify/functions/verify-otp",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

email:email,
otp:otp

})


});

const result =
await response.json();

if(result.success){

const username =
document.getElementById("username").value.trim();

const password =
document.getElementById("password").value.trim();


const {data,error} =
await supabase.auth.signUp({

email,
password

});


if(error) throw error;

const { error: profileError } = await supabase
.from("profiles")
.insert({
  id:data.user.id,
  username:username,
  email:email
});

if(profileError){
  throw profileError;
}

popup.style.display="none";

document.getElementById("successMsg").style.display="block";

setTimeout(()=>{

window.location.href="index.html";

},2000);

}

else{

alert("Wrong OTP");

verifyBtn.disabled = false;
verifyBtn.innerText = "Verify OTP";

}

});

resendBtn.addEventListener("click", async()=>{


const email =
document.getElementById("email").value.trim();


const response =
await fetch("/.netlify/functions/send",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
email:email
})

});


const result =
await response.json();


if(result.success){

alert("New OTP sent");

startOtpTimer();

}
else{

alert(result.error);

}


});
