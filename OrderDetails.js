import { createClient } from
"https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
"https://tvhgxlqqeklrdlgbkosa.supabase.co",
"sb_publishable_Ep28HPF1SXIXQXBF2i__eg_h_jmjw4I"
);

// ----------------------------
// Maintenance Check
// ----------------------------

const { data: setting } = await supabase
.from("settings")
.select("maintenance")
.eq("id", 1)
.single();

if (setting?.maintenance) {

    location.href = "maintenance.html";

}

// ----------------------------
// Login Check
// ----------------------------

const {
    data: { session }
} = await supabase.auth.getSession();

if (!session) {

    location.href = "index.html";

}

// ----------------------------
// Load User Profile
// ----------------------------

const { data: profile } = await supabase
.from("profiles")
.select("wallet_balance")
.eq("id", session.user.id)
.single();

const walletBalance =
Number(profile?.wallet_balance || 0);

// Header Wallet

document.getElementById("walletBalance").textContent =
"Rs. " + walletBalance.toFixed(2);

// Card Wallet

document.getElementById("walletBalanceCard").textContent =
"Rs. " + walletBalance.toFixed(2);

// ----------------------------
// Load Selected Product
// ----------------------------

const product =
JSON.parse(localStorage.getItem("selectedProduct"));

if (!product) {

    location.href = "topup.html";

}

document.getElementById("productImage").src =
product.image;

document.getElementById("productName").textContent =
product.title;

document.getElementById("productPrice").textContent =
"Rs. " + product.price.toFixed(2);

// Quantity
let quantity = 1;

const minusBtn = document.getElementById("minusBtn");
const plusBtn = document.getElementById("plusBtn");
const quantityText = document.getElementById("quantity");
const totalPrice = document.getElementById("totalPrice");

function updateTotal() {
    quantityText.textContent = quantity;
    totalPrice.textContent =
        "Rs. " + (product.price * quantity).toFixed(2);
}

updateTotal();

plusBtn.addEventListener("click", () => {
    if (quantity < 5) {
        quantity++;
        updateTotal();
    }
});

minusBtn.addEventListener("click", () => {
    if (quantity > 1) {
        quantity--;
        updateTotal();
    }
});

// ----------------------------
// Submit Button
// ----------------------------

const submitBtn =
document.getElementById("submitBtn");

const uidInput =
document.getElementById("uid");

const msg =
document.getElementById("msg");

submitBtn.addEventListener(
"click",
async () => {

    const uid =
    uidInput.value.trim();

    // UID Check

    if (uid === "") {

        msg.style.color = "red";
        msg.textContent =
        "⚠ Please enter your Game UID";

        uidInput.focus();

        return;

    }

    // Wallet Check

const totalAmount = product.price * quantity;

if (walletBalance < totalAmount) {

    msg.style.color = "red";
    msg.textContent =
    "❌ Wallet balance is not enough.";

    return;

}

    msg.style.color =
    "limegreen";

    msg.textContent =
    "✅ Checking order...";

    // Update Wallet

const newBalance =
walletBalance - totalAmount;

const { error: walletError } =
await supabase
.from("profiles")
.update({
    wallet_balance: newBalance
})
.eq("id", session.user.id);

if(walletError){

    msg.style.color="red";
    msg.textContent=
    "Wallet update failed";

    return;

}


// Save Order

const { error: orderError } =
await supabase
.from("orders")
.insert({

    user_id:
    session.user.id,

    uid: uid,

    product_name:
    product.title,

    category:
    product.category,

price:
product.price,

quantity:
quantity,

total_price:
totalAmount,

status:
"Pending"

});

if(orderError){

    msg.style.color="red";
    msg.textContent=
    "Order failed";

    return;

}


msg.style.color=
"limegreen";

msg.textContent=
"✅ Order submitted successfully";


setTimeout(()=>{

location.href=
"history.html";

},1200);

});