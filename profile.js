import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  "https://tvhgxlqqeklrdlgbkosa.supabase.co",
  "sb_publishable_Ep28HPF1SXIXQXBF2i__eg_h_jmjw4I"
);

// =============================
// CHECK LOGIN
// =============================

const {
  data: { session }
} = await supabase.auth.getSession();

if (!session) {
  location.href = "index.html";
}

const user = session.user;

// =============================
// HTML ELEMENTS
// =============================

const profileImg =
document.getElementById("profileAvatar");

const username =
document.getElementById("profileName");

const email =
document.getElementById("profileEmail");

const memberSince =
document.getElementById("memberSince");

const detailUsername =
document.getElementById("detailUsername");

const detailEmail =
document.getElementById("detailEmail");

const detailMember =
document.getElementById("detailMember");

const wallet =
document.getElementById("walletBalance");

const totalOrders =
document.getElementById("totalOrders");

const totalSpent =
document.getElementById("totalSpent");

const recentList =
document.getElementById("recentActivity");

const uploadInput =
document.getElementById("avatarInput");

const toast =
document.getElementById("toast");

// =============================
// PHOTO LOADER ELEMENTS
// =============================

const photoOverlay =
document.getElementById("photoOverlay");

const previewPhoto =
document.getElementById("previewPhoto");

const progressCircle =
document.getElementById("progressCircle");

const uploadSuccess =
document.getElementById("uploadSuccess");

const uploadTitle =
document.getElementById("uploadTitle");

const uploadSub =
document.getElementById("uploadSub");

const circleLength = 440;

progressCircle.style.strokeDasharray = circleLength;
progressCircle.style.strokeDashoffset = circleLength;

let progressValue = 0;
let progressTimer = null;

// =============================
// SHOW PHOTO LOADER
// =============================

function showPhotoLoader(photo){

previewPhoto.src = photo;

uploadSuccess.classList.remove("show");

uploadTitle.innerHTML =
"Updating Profile Photo...";

uploadSub.innerHTML =
"Please wait a moment";

progressValue = 0;

progressCircle.style.strokeDashoffset =
circleLength;

photoOverlay.classList.add("show");

// Smooth Progress Animation

clearInterval(progressTimer);

progressTimer = setInterval(()=>{

if(progressValue >= 93) return;

progressValue += 1;

const offset =
circleLength -
(circleLength * progressValue / 100);

progressCircle.style.strokeDashoffset =
offset;

},45);

}

// =============================
// COMPLETE LOADER
// =============================

function finishPhotoLoader(){

clearInterval(progressTimer);

progressValue = 100;

progressCircle.style.strokeDashoffset = 0;

uploadSuccess.classList.add("show");

uploadTitle.innerHTML =
"Profile Updated";

uploadSub.innerHTML =
"Success";

setTimeout(()=>{

photoOverlay.classList.remove("show");

},900);

}

// =============================
// TOAST
// =============================

function showToast(message){

toast.innerHTML = message;

toast.classList.add("show");

setTimeout(()=>{

toast.classList.remove("show");

},3000);

}

// =============================
// FORMAT DATE
// =============================

function formatDate(date){

return new Date(date).toLocaleDateString(
"en-GB",
{
day:"2-digit",
month:"short",
year:"numeric"
});

}

// =============================
// LOAD PROFILE
// =============================

async function loadProfile(){

const { data, error } = await supabase
.from("profiles")
.select("*")
.eq("id", user.id)
.single();

if(error){

console.error(error);

showToast("Profile Load Failed");

return;

}

username.textContent =
data.username || "Unknown User";

email.textContent =
data.email || user.email;

wallet.textContent =
`Rs. ${Number(data.wallet_balance || 0).toFixed(2)}`;

memberSince.textContent =
"Member since " + formatDate(data.created_at);

detailUsername.textContent =
data.username || "Unknown User";

detailEmail.textContent =
data.email || user.email;

detailMember.textContent =
formatDate(data.created_at);

if(data.avatar_url){

profileImg.src =
data.avatar_url;

}

}

await loadProfile();

// =============================
// LOAD ORDERS
// =============================

async function loadOrders(){

const { data, error } = await supabase
.from("orders")
.select("*")
.eq("user_id", user.id)
.order("created_at",{ascending:false});

if(error){

console.error(error);

return;

}

totalOrders.textContent =
data.length;

// Success Orders Only

let spent = 0;

let pending = 0;

data.forEach(order=>{

if(order.status === "success"){

spent += Number(order.price);

}

if(order.status === "Pending"){

pending++;

}

});

totalSpent.textContent =
`Rs. ${spent.toFixed(2)}`;

loadRecent(data);

}

await loadOrders();

// =============================
// RECENT ACTIVITY
// =============================

function loadRecent(orders){

recentList.innerHTML = "";

if(orders.length === 0){

recentList.innerHTML = `
<div class="activity-empty">
<h4>No Orders Found</h4>
<p>You haven't placed any orders yet.</p>
</div>
`;

return;

}

orders.slice(0,3).forEach(order=>{

let color = "#facc15";

if(order.status === "success")
color = "#22c55e";

if(order.status === "reject")
color = "#ef4444";

recentList.innerHTML += `

<div class="order-card">

<h4>${order.product_name}</h4>

<p>
Category :
${order.category}
</p>

<p>
Price :
Rs. ${Number(order.price).toFixed(2)}
</p>

<p>
Date :
${formatDate(order.created_at)}
</p>

<p style="color:${color};font-weight:bold;">
${order.status}
</p>

</div>

`;

});

}

// =============================
// PHOTO UPLOAD
// =============================

window.changePhoto = function(){

uploadInput.click();

};

uploadInput.addEventListener("change", async ()=>{

const file = uploadInput.files[0];

if(!file) return;

// Preview selected photo
const reader = new FileReader();

reader.onload = async function(e){

showPhotoLoader(e.target.result);

try{

const formData = new FormData();

formData.append("file", file);

formData.append(
"upload_preset",
"Phoenixstore_upload"
);

const res = await fetch(
"https://api.cloudinary.com/v1_1/lhv0ojre/image/upload",
{
method:"POST",
body:formData
});

const json = await res.json();

if(!json.secure_url){

photoOverlay.classList.remove("show");

showToast("Upload Failed");

return;

}

// Update avatar immediately
profileImg.src = json.secure_url;

// Save to Supabase
const { error } = await supabase
.from("profiles")
.update({
avatar_url: json.secure_url
})
.eq("id", user.id);

if(error){

photoOverlay.classList.remove("show");

console.error(error);

showToast("Photo Save Failed");

return;

}

// Finish animation
finishPhotoLoader();

// showToast("Profile Photo Updated");

}
catch(err){

photoOverlay.classList.remove("show");

console.error(err);

showToast("Upload Failed");

}

};

reader.readAsDataURL(file);

});

// =============================
// LOGOUT
// =============================

const logoutPopup =
document.getElementById("logoutPopup");

document.getElementById("logoutBtn")
.addEventListener("click", ()=>{

logoutPopup.classList.add("show");

});

document.getElementById("cancelLogout")
.addEventListener("click", ()=>{

logoutPopup.classList.remove("show");

});

document.getElementById("confirmLogout")
.addEventListener("click", async ()=>{

await supabase.auth.signOut();

localStorage.clear();

location.href = "index.html";

});

// =============================
// REFRESH PROFILE
// =============================

window.refreshProfile = async function(){

await loadProfile();

await loadOrders();

};

// =============================
// AUTO REFRESH
// =============================

setInterval(async()=>{

await loadProfile();

await loadOrders();

},30000);

// =============================
// READY
// =============================

console.log(
"✅ Phoenix Profile Loaded Successfully"
);

document.getElementById("avatarBtn")
.addEventListener("click", changePhoto);