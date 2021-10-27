// Matej Delincak

window.onbeforeunload = function(){
    fetch('/destroy').then();
}

document.getElementById('btnLogIn').addEventListener('click', function () {
    let params = {};
    params["nickname"] = document.getElementById("nickname").value;
    params["password"] = document.getElementById("password").value;
    loadJson('/loginInit', params);
});