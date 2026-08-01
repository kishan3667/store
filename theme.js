// =========================
// PHOENIX THEME SYSTEM
// =========================

const savedTheme =
localStorage.getItem("theme") || "phoenix";

applyTheme(savedTheme);

function applyTheme(theme){

if(theme === "phoenix"){

document.documentElement.removeAttribute("data-theme");

}
else{

document.documentElement.setAttribute(
"data-theme",
theme
);

}

localStorage.setItem("theme", theme);

}


// GLOBAL FUNCTION

window.changeTheme = function(theme){

applyTheme(theme);

const menu = document.getElementById("themeMenu");

if(menu){
menu.style.display = "none";
}

}

// =========================
// THEME MENU
// =========================

window.addEventListener("DOMContentLoaded", () => {

const btn = document.getElementById("themeBtn");
const menu = document.getElementById("themeMenu");

if(!btn || !menu) return;

// Open / Close
btn.onclick = () => {

if(menu.style.display === "block"){

menu.style.display = "none";

}else{

menu.style.display = "block";

}

};

});