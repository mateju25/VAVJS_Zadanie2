// Matej Delincak

const express = require('express');
const path = require('path');
const passwordHash = require('password-hash');
const sessions = require('express-session');
const cookieParser = require("cookie-parser");
const webSocket = require('ws');

class Player {
    constructor(nickname, number, sessionId) {
        this.nickname = nickname;
        this.number = number;
        this.sessionId = sessionId;
        this.maxScore = 0;
        this.maxLevel = 1;
        this.pin = Math.floor(Math.random() * 10000);
        this.windows = 1;
        /*Hra*/
        this.aliens = [1, 3, 5, 7, 9, 23, 25, 27, 29, 31];
        this.direction = 1;
        this.ship = [104, 114, 115, 116];
        this.missiles = [];
        this.speed = 1024;
        this.level = 1;
        this.score = 0;
        this.aliensLower = 0;
        this.state = 'normal';
    }
}

class User {
    constructor(name, email, nickname, password, maxScore, maxLevel) {
        this.fullname = name;
        this.email = email;
        this.nickname = nickname;
        this.password = password;
        this.maxScore = maxScore;
        this.maxLevel = maxLevel;
    }
}

class DbUser {
    constructor() {
        this.users = [];
    }

    newUser(name, email, nickname, password) {
        let maxScore = 0;
        let maxLevel = 1;
        let user = new User(name, email, nickname, password, maxScore, maxLevel);
        this.users.push(user);
        return user;
    }

    newUserWithScore(name, email, nickname, password, maxScore, maxLevel) {
        let user = new User(name, email, nickname, password, maxScore, maxLevel);
        this.users.push(user);
        return user;
    }

    findByNickname(nickname) {
        for (let i = 0; i < this.users.length; i++) {
            if (this.users[i].nickname === nickname) {
                return this.users[i];
            }
        }
        return null;
    }

    findByEmail(email) {
        for (let i = 0; i < this.users.length; i++) {
            if (this.users[i].email === email) {
                return this.users[i];
            }
        }
        return null;
    }
}

class DbPlayer {
    constructor() {
        this.players = [];
    }

    newPlayer(nickname, number, sessionId) {
        let player = new Player(nickname, number, sessionId);
        this.players.push(player);
        return player;
    }

    get allPlayers() {
        return this.players;
    }

    findByNumber(number) {
        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i].number === number) {
                return this.players[i];
            }
        }
        return null;
    }

    findBySessionId(sessionId) {
        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i].sessionId === sessionId) {
                return this.players[i];
            }
        }
        return null;
    }

    generateNewUniqueNumber() {
        let number = Math.floor(Math.random() * 100000);
        while (this.findByNumber(number) != null) {
            number = Math.floor(Math.random() * 100000);
        }
        return Math.floor(number);
    }

    deletePlayer(player) {
        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i].number === player.number) {
                this.players.splice(i, 1);
            }
        }
    }
}

class DbSession {
    constructor() {
        this.sessions = {};
    }

    newSession(sessionId, number) {
        this.sessions[sessionId] = number;
    }

    findBySessionId(sessionId) {
        return this.sessions[sessionId]
    }

    findByNumber(number) {
        for (let i = 0; i < Object.keys(this.sessions).length; i++) {
            if (this.sessions[Object.keys(this.sessions)[i]] === number)
                return Object.keys(this.sessions)[i];
        }
        return null;
    }

    stopSession(sessionId) {
        delete this.sessions[sessionId];
    }
}


let router = express.Router();
let dbUser = new DbUser();
let dbPlayer = new DbPlayer();

const oneDay = 1000 * 60 * 60 * 24;
let app = express();
app.use(sessions({
    secret: "secretKey",
    saveUninitialized: true,
    cookie: {maxAge: oneDay},
    resave: false
}));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(express.static(__dirname + '/public'));

function sendJson(res, json) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(json));
}

function consoleDebug(message) {
    if (debug)
        console.log(message);
}

let debug = false;

router.get('/', function (req, res) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');
    res.sendFile(path.join(__dirname + '/index.html'));
});
router.get('/init', function (req, res) {
    consoleDebug('loaded main page');
    sendJson(res, require("./pages/main.json"));
});
router.get('/debug', function (req, res) {
    if (req.query.debug) {
        debug = !debug;
        if (debug)
            consoleDebug('debug on');
        else
            consoleDebug('debug off');
    }
    sendJson(res, {'debug':debug});
});
router.get('/game', function (req, res) {
    consoleDebug('loaded game');
    let player = dbPlayer.findBySessionId(req.sessionID);
    if (player === null) {
        let number = dbPlayer.generateNewUniqueNumber();
        if (!req.session.nickname) {
            consoleDebug('created new player unknown');
            dbPlayer.newPlayer("N/A", number, req.sessionID);
        } else {
            consoleDebug('created new player' + req.session.nickname);
            dbPlayer.newPlayer(req.session.nickname, number, req.sessionID);
        }
    } else {
        player.windows++;
        consoleDebug('new player not created, player is already playing');
    }
    sendJson(res, require("./pages/game.json"));
});
router.get('/register', function (req, res) {
    consoleDebug('loaded registration');
    sendJson(res, require("./pages/register.json"));
});
router.get('/registerInit', function (req, res) {
    const name = req.query.fullname.split(' ')[0];
    const surName = req.query.fullname.split(' ')[1];
    const email = req.query.email;
    const nickname = req.query.nickname;
    const password = req.query.password;
    const rptPassword = req.query.rptPassword;
    if (email.match(".*@.*[.].*") &&
        dbUser.findByEmail(email) === null &&
        nickname.match("[a-zA-Z]") &&
        dbUser.findByNickname(nickname) === null &&
        password === rptPassword &&
        name.length >= 2 &&
        name.match("^[A-Z]") &&
        surName !== undefined &&
        surName.length >= 2 &&
        surName.match("^[A-Z]"))
    {
        consoleDebug('user registrated');
        dbUser.newUser(req.query.fullname, email, nickname, passwordHash.generate(password));
        res.redirect('/login');
    } else {
        consoleDebug('registration aborted - conditions not met');
        sendJson(res, require("./pages/register.json"));
    }
});
router.get('/login', function (req, res) {
    consoleDebug('loaded login page');
    sendJson(res, require("./pages/login.json"));
});
router.get('/loginInit', function (req, res) {
    const nickname = req.query.nickname;
    const password = req.query.password;
    if (nickname === 'admin' && password === 'admin') {
        consoleDebug('admin logged');
        res.redirect('/admin');
        return
    }

    let maybeUser = dbUser.findByNickname(nickname);
    if (maybeUser === null || !passwordHash.verify(password, maybeUser.password)) {
        consoleDebug('bad login');
        res.redirect('/login');
    } else {
        consoleDebug('logged in');
        req.session.nickname = maybeUser.nickname;
        if (dbPlayer.findBySessionId(req.sessionID) !== null)
            dbPlayer.findBySessionId(req.sessionID).nickname = maybeUser.nickname;
        res.redirect('/game');
    }
});
router.get('/admin', function (req, res) {
    consoleDebug('loaded admin page');
    sendJson(res, require("./pages/admin.json"));
});
router.get('/destroy', function (req, res) {
    let player = dbPlayer.findBySessionId(req.sessionID);
    if (player) {
        player.windows--;
        if (player.windows === 0) {
            dbPlayer.deletePlayer(player);
            req.session.destroy();
            consoleDebug('player and session destroyed');
        }
        consoleDebug('window destroyed');
    }
    sendJson(res, {});
});
router.get('/number', function (req, res) {
    consoleDebug('returned number of player');
    sendJson(res, JSON.stringify(dbPlayer.findBySessionId(req.sessionID).number));
});
router.get('/pin', function (req, res) {
    consoleDebug('returned pin of the game');
    sendJson(res, JSON.stringify(dbPlayer.findByNumber(parseInt(req.query.number)).pin));
});
router.get('/key', function (req, res) {
    let number = parseInt(req.query.number);
    let key = parseInt(req.query.key);
    checkKey(dbPlayer.findByNumber(number), key);
    consoleDebug('key pressed');
    sendJson(res, {});
});
router.get('/resetGame', function (req, res) {
    let number = parseInt(req.query.number);
    let player = dbPlayer.findByNumber(number);
    if (player) {
        player.aliens = [1, 3, 5, 7, 9, 23, 25, 27, 29, 31];
        player.direction = 1;
        player.ship = [104, 114, 115, 116];
        player.missiles = [];
        player.speed = 1024;
        player.level = 1;
        player.score = 0;
        player.aliensLower = 0;
        player.state = 'normal';
    }
    consoleDebug('game reseted');
    sendJson(res, {});
});
router.get('/maxScore', function (req, res) {
    let number = parseInt(req.query.number);
    let maxScore = dbPlayer.findByNumber(number).maxScore;
    consoleDebug('returned max score of player');
    sendJson(res, maxScore);
});
router.get('/maxLevel', function (req, res) {
    let number = parseInt(req.query.number);
    let player = dbPlayer.findByNumber(number).maxLevel;
    consoleDebug('returned max level of player');
    sendJson(res, player);
});
router.get('/games', function (req, res) {
    let dict = {};
    for (let i = 0; i < dbPlayer.allPlayers.length; i++)
       dict[i] = dbPlayer.allPlayers[i];
    consoleDebug('returned all games for normal user');
    sendJson(res, dict);
});
router.get('/gamesAdmin', function (req, res) {
    let dict = {};
    for (let i = 0; i < dbPlayer.allPlayers.length; i++) {
        dict[i] = dbPlayer.allPlayers[i];
    }
    consoleDebug('returned all games for admin');
    sendJson(res, dict);
});
router.get('/usersAdmin', function (req, res) {
    let dict = {};
    for (let i = 0; i < dbUser.users.length; i++) {
        dict[i] = dbUser.users[i];
    }
    consoleDebug('returned all registered users for admin');
    sendJson(res, dict);
});
router.get('/import', function (req, res) {
    let dict = JSON.parse(req.query.newUsers);
    dict = dict["newUsers"];
    for (let i = 0; i < dict.length; i++) {
        let elem = dict[i];
        dbUser.newUserWithScore(elem.fullname, elem.email, elem.nickname, elem.password, elem.maxScore, elem.maxLevel);
    }
    consoleDebug('users imported');
    sendJson(res, {});
});
router.get('/watch', function (req, res) {
    let number = parseInt(req.query.number);
    if (dbPlayer.findByNumber(number)) {
        let json = require("./pages/watch.json");
        json["innerTags"][1]["innerText"] = number;
        consoleDebug('game found for watching');
        sendJson(res, json);
    } else {
        consoleDebug('no game found for watching');
        res.redirect('/init')
    }
});
router.get('/watchGame', function (req, res) {
    let number = parseInt(req.query.number);
    if (dbPlayer.findByNumber(number)) {
        let player = dbPlayer.findByNumber(number);
        consoleDebug('get newest state of watched game');
        sendJson(res, {
            "aliens": player.aliens,
            "ship": player.ship,
            "missiles": player.missiles,
            "speed": player.speed,
            "score": player.score,
            "maxScore": player.maxScore,
            "level": player.level,
            "maxLevel": player.maxLevel,
            "state": player.state
        });
    } else {
        res.redirect('/init')
    }
});
router.get('/usePin', function (req, res) {
    consoleDebug('loaded pin page');
    sendJson(res, require("./pages/usePin.json"));
});
router.get('/left', function (req, res) {
    let dict = JSON.parse(req.query.params);
    let player = dbPlayer.findByNumber(dict.number);
    if (player && player.pin === dict.pin) {
        checkKey(player, 37);
        consoleDebug('send left key to pin game');
    }
    sendJson(res, {});
});
router.get('/right', function (req, res) {
    let dict = JSON.parse(req.query.params);
    let player = dbPlayer.findByNumber(dict.number);
    if (player && player.pin === dict.pin) {
        checkKey(player, 39);
        consoleDebug('send right key to pin game');
    }
    sendJson(res, {});
});
router.get('/space', function (req, res) {
    let dict = JSON.parse(req.query.params);
    let player = dbPlayer.findByNumber(dict.number);
    if (player && player.pin === dict.pin) {
        checkKey(player, 32);
        consoleDebug('send space key to pin game');
    }
    sendJson(res, {});
});

app.use('/', router);

/*Hra*/
function checkKey(player, key) {
    let i;
    if (key == '37' || key == '65') {
        if (player.ship[0] > 100) {
            i = 0;
            for (i = 0; i < player.ship.length; i++) {
                player.ship[i]--;
            }
        }
        consoleDebug('ship to left');
    } else if ((key == '39' || key == '68') && player.ship[0] < 108) {
        i = 0;
        for (i = 0; i < player.ship.length; i++) {
            player.ship[i]++;
        }
        consoleDebug('ship to right');
    } else if (key == '32') {
        player.missiles.push(player.ship[0] - 11);
        consoleDebug('missile fired');
    }
}

function moveAliens(player) {
    for (let i = 0; i < player.aliens.length; i++) {
        player.aliens[i] = player.aliens[i] + player.direction;
    }
    player.direction *= -1;
}

function lowerAliens(player) {
    for (let i = 0; i < player.aliens.length; i++) {
        player.aliens[i] += 11;
    }
}

function moveMissiles(player) {
    for (let i = 0; i < player.missiles.length; i++) {
        player.missiles[i] -= 11;
        if (player.missiles[i] < 0) player.missiles.splice(i, 1);
    }
}

function checkCollisionsMA(player) {
    for (let i = 0; i < player.missiles.length; i++) {
        if (player.aliens.includes(player.missiles[i])) {
            player.score += 10;
            consoleDebug('alien hit');
            if (player.score > player.maxScore) {
                player.maxScore = player.score;
                let user = dbUser.findByNickname(player.nickname)
                if (user)
                    user.maxScore = player.maxScore;
            }
            let alienIndex = player.aliens.indexOf(player.missiles[i]);
            player.aliens.splice(alienIndex, 1);
            player.missiles.splice(i, 1);
        }
    }
}

function RaketaKolidujeSVotrelcom(player) {
    for (let i = 0; i < player.aliens.length; i++) {
        if (player.aliens[i] > 98) {
            return true;
        }
    }
    return false;
}

function nextLevel(player) {
    consoleDebug('new level');

    player.level++;
    if (player.level > player.maxLevel) {
        player.maxLevel = player.level;
        let user = dbUser.findByNickname(player.nickname)
        if (user)
            user.maxLevel = player.maxLevel;
    }

    if (player.level === 1) player.aliens = [1, 3, 5, 7, 9, 23, 25, 27, 29, 31];
    if (player.level === 2) player.aliens = [1, 3, 5, 7, 9, 13, 15, 17, 19, 23, 25, 27, 29, 31];
    if (player.level === 3) player.aliens = [1, 5, 9, 23, 27, 31];
    if (player.level === 4) player.aliens = [45, 53];
    if (player.level > 4) {
        player.level = 1;
        player.aliens = [1, 3, 5, 7, 9, 23, 25, 27, 29, 31];
        player.speed = player.speed / 2;
    }
}

const wsGame = new webSocket.Server({port: 8082});
wsGame.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
        let player = dbPlayer.findByNumber(JSON.parse(message).number)
        if (player) {
            player.aliensLower++;
            moveAliens(player);
            moveMissiles(player);
            checkCollisionsMA(player);
            if (player.aliensLower % 4 === 3) lowerAliens(player);
            player.state = 'running';
            if (RaketaKolidujeSVotrelcom(player)) {
                player.state = 'loose';
            }
            if (player.aliens.length === 0) {
                nextLevel(player);
                player.missiles = [];
                player.state = 'win';
            }
            ws.send(JSON.stringify({
                "aliens": player.aliens,
                "ship": player.ship,
                "missiles": player.missiles,
                "speed": player.speed,
                "score": player.score,
                "maxScore": player.maxScore,
                "level": player.level,
                "maxLevel": player.maxLevel,
                "state": player.state,
                "number": player.number
            }));
        }
    });
});

module.exports = app;
