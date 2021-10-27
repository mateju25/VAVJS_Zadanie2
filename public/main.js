// Matej Delincak

window.onbeforeunload = function(){
    fetch('/destroy').then();
}

fetch('/debug').then(data => data.json()).then(data => {
    if (data.debug) {
        document.getElementById('btnDebug').innerText = 'Debug on';
    } else
        document.getElementById('btnDebug').innerText = 'Debug off';
});

document.getElementById('btnDebug').addEventListener('click', function () {
    params = {}
    if (document.getElementById('btnDebug').innerText === 'Debug off') {
        document.getElementById('btnDebug').innerText = 'Debug on';
        params['debug'] = true;
    } else
        document.getElementById('btnDebug').innerText = 'Debug off';

    fetch('/debug?debug='+  params['debug']).then();
});

document.getElementById('btnStart').addEventListener('click', function () {
    loadJson('/game');
});

document.getElementById('btnRegister').addEventListener('click', function () {
    loadJson('/register');
});

document.getElementById('btnLogIn').addEventListener('click', function () {
    loadJson('/login');
});

document.getElementById('btnWithPin').addEventListener('click', function () {
    loadJson('/usePin');
});

document.getElementById('btnWatch').addEventListener('click', function () {
    let params = {};
    params["number"] = document.getElementById("numberInput").value;
    loadJson('/watch', params);
});

document.getElementById('btnLeaderboard').addEventListener('click', function () {
    fetch("/games").then(data => data.json()).then(data => {
        let table = document.getElementById('tableLeaderboard');
        if (table.style.display === 'none') {
            let text = "<tr>" +
                "    <th>Number</th>" +
                "    <th>Nickname</th>" +
                "    <th>Actual Score</th>" +
                "    <th>Max score</th>" +
                "    <th>Actual level</th>" +
                "    <th>Max level</th>" +
                "  </tr>";
            for (let key in data) {
                let elem = data[key];
                text += "<tr>" +
                    "    <th>" + elem.number + "</th>" +
                    "    <th>" + elem.nickname + "</th>" +
                    "    <th>" + elem.score + "</th>" +
                    "    <th>" + elem.maxScore + "</th>" +
                    "    <th>" + elem.level + "</th>" +
                    "    <th>" + elem.maxLevel + "</th>" +
                    "  </tr>";
            }
            table.innerHTML = text;
            table.style.display = 'block';
        } else {
            table.style.display = 'none';
        }
    });
});