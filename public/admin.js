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

document.getElementById('btnRegister').addEventListener('click', function () {
    loadJson('/register');
});

document.getElementById('btnLogIn').addEventListener('click', function () {
    loadJson('/login');
});

document.getElementById('btnWatch').addEventListener('click', function () {
    let params = {};
    params["number"] = document.getElementById("numberInput").value;
    loadJson('/watch', params);
});

document.getElementById('btnGames').addEventListener('click', function () {
    fetch("/gamesAdmin").then(data => data.json()).then(data => {
        let table = document.getElementById('tableLeaderboard');
        if (table.style.display === 'none') {
            let text = "<tr>" +
                "    <th>Number</th>" +
                "    <th>Nickname</th>" +
                "    <th>Session Id</th>" +
                "    <th>PIN</th>" +
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
                    "    <th>" + elem.sessionId + "</th>" +
                    "    <th>" + elem.pin + "</th>" +
                    "    <th>" + elem.score + "</th>" +
                    "    <th>" + elem.maxScore + "</th>" +
                    "    <th>" + elem.level + "</th>" +
                    "    <th>" + elem.maxLevel + "</th>" +
                    "  </tr>";
            }
            ;
            table.innerHTML = text;
            table.style.display = 'block';
        } else {
            table.style.display = 'none';
        }
    });
});

document.getElementById('btnUsers').addEventListener('click', function () {
    fetch("/usersAdmin").then(data => data.json()).then(data => {
        let table = document.getElementById('tableUsers');
        if (table.style.display === 'none') {
            let text = "<tr>" +
                "    <th>Full name</th>" +
                "    <th>Email</th>" +
                "    <th>Nickname</th>" +
                "    <th>Max score</th>" +
                "    <th>Max level</th>" +
                "  </tr>";
            for (let key in data) {
                let elem = data[key];
                text += "<tr>" +
                    "    <th>" + elem.fullname + "</th>" +
                    "    <th>" + elem.email + "</th>" +
                    "    <th>" + elem.nickname + "</th>" +
                    "    <th>" + elem.maxScore + "</th>" +
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

document.getElementById('btnImport').addEventListener('click', function () {
    const file = document.getElementById('fileInput').files[0];
    const reader = new FileReader;
    reader.addEventListener('load', () => {
        let rows = reader.result.split(/\r?\n|\r/);
        let users = [];
        for(let row in rows){
            let dict = {};
            let columns = rows[row].split(',');
            dict['fullname'] = columns[0];
            dict['email'] = columns[2];
            dict['nickname'] = columns[3];
            dict['password'] = columns[4];
            dict['maxScore'] = columns[5];
            dict['maxLevel'] = columns[6];
            if (dict['name'].length <= 1)
                continue;
            users.push(dict);
        }
        let params = {};
        params["newUsers"] = users;
        fetch('/import?newUsers='+JSON.stringify(params)).then(function () {alert("Succesfully loaded!")});
        document.getElementById('btnUsers').click();
    });
    reader.readAsText(file, 'UTF-8');
});

document.getElementById('btnExport').addEventListener('click', function () {
    fetch("/usersAdmin").then(data => data.json()).then(data => {
        let csv = "data:text/csv;charset=utf-8,";
        for (let key in data) {
            let elem = data[key];
            console.log(elem);
            csv += elem.fullname+","+elem.email+","+elem.nickname+","+elem.password+","+elem.maxScore+","+elem.maxLevel+"\r\n";
        }
        let link = document.createElement("a");
        link.setAttribute("href", encodeURI(csv));
        link.setAttribute("download", "my_data.csv");
        link.click();
    });
});