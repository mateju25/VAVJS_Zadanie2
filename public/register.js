// Matej Delincak

window.onbeforeunload = function(){
    fetch('/destroy').then();
}

document.getElementById('btnRegister').addEventListener("click", () => {
    let params = {};
    params["fullname"] = document.getElementById("fullname").value;
    params["email"] = document.getElementById("email").value;
    params["nickname"] = document.getElementById("nickname").value;
    params["password"] = document.getElementById("password").value;
    params["rptPassword"] = document.getElementById("rptPassword").value;
    loadJson('/registerInit', params)
});