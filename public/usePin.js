// Matej Delincak

window.onbeforeunload = function(){
    fetch('/destroy').then();
}

let params = {};


document.getElementById('btnConnect').addEventListener('click', function () {
    params["number"] = parseInt(document.getElementById('number').value);
    params["pin"] =  parseInt(document.getElementById('pin').value);
});

document.getElementById('btnLeft').addEventListener('click', function () {
    fetch('/left?params=' + JSON.stringify(params));
});

document.getElementById('btnSpace').addEventListener('click', function () {
    fetch('/space?params=' + JSON.stringify(params));
});

document.getElementById('btnRight').addEventListener('click', function () {
    fetch('/right?params=' + JSON.stringify(params));
});