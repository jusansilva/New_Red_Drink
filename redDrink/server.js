console.log('> Script started')
const express = require('express')
const webApp = express()
const webServer = require('http').createServer(webApp)
const io = require('socket.io')(webServer)
webApp.use(express.urlencoded())
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

webApp.use(logger('dev'));
webApp.use(bodyParser.json());
webApp.use(bodyParser.urlencoded({ extended: false }));
webApp.use(cookieParser());
webApp.use(express.static(path.join(__dirname, 'public')));

const game = createGame()
let maxConcurrentConnections = 10

//chama splash inicial
webApp.get('/', (req, res) => {
    res.sendFile(__dirname + '/home.html')
})

//pagina de abrir a sala
webApp.get('/sala', (req, res) => {
    res.sendFile(__dirname + '/addSala.html')
})

//selecionar sala
webApp.get('/gameSelect', (req, res) => {
    res.sendFile(__dirname + '/gameSelect.html')
})

//pagina de game 
webApp.get('/mysala', (req, res) => {
    res.sendFile(__dirname + '/game.html')
})

//efeito de som 
webApp.get('/collect.mp3', (req, res) => {
    res.sendFile(__dirname + '/collect.mp3')
})

//Backgroud de imagem
webApp.get('/backgroud.png', (req, res) => {
    res.sendFile(__dirname + '/asset/image/fundo.png')
})

//gif da splash inicial
webApp.get('/reddrink', (req, res) => {
    res.sendFile(__dirname + '/asset/image/red drink.gif')
})
//rota do css
webApp.get('/asset/css', (req, res) => {
    res.sendFile(__dirname + '/asset/css/index.css')
})

webApp.get('/asset/js', (req, res) => {
    res.sendFile(__dirname + '/asset/js/index.js')
})

webApp.get('/copo', (req, res) => {
    res.sendFile(__dirname + '/asset/image/copo.png')
})

webApp.get('/half', (req, res) => {
    res.sendFile(__dirname + '/asset/image/half.png')
})

webApp.get('/one', (req, res) => {
    res.sendFile(__dirname + '/asset/image/one.png')
})

webApp.get('/double', (req, res) => {
    res.sendFile(__dirname + '/asset/image/double.png')
})


setInterval(() => {
    io.emit('concurrent-connections', io.engine.clientsCount)
}, 5000)


io.on('connection', function (socket) {
    const admin = socket.handshake.query.admin

    if (io.engine.clientsCount > maxConcurrentConnections) {
        socket.emit('show-max-concurrent-connections-message')
        socket.conn.close()
        return
    } else {
        socket.emit('hide-max-concurrent-connections-message')
    }
    const playerState = game.addPlayer(socket.id)
    socket.emit('bootstrap', game)

    socket.broadcast.emit('player-update', {
        socketId: socket.id,
        newState: playerState
    })

    socket.on('player-game', (socketId) => {
        if(game.gamePlayer(socket.id)){
            socket.emit('play-shot', {
                shot : game.playShot
            })
        }

        

        socket.broadcast.emit('player-update', {
            socketId: socket.id,
            newState: game.players[socket.id]
        })

        if (fruitColisionIds) {
            io.emit('fruit-remove', {
                fruitId: fruitColisionIds.fruitId,
                score: game.players[socket.id].score
            })
            socket.emit('update-player-score', game.players[socket.id].score)
        }

    })

    socket.on('disconnect', () => {
        game.removePlayer(socket.id)
        socket.broadcast.emit('player-remove', socket.id)
    })

    socket.on('admin-clear-scores', () => {
        game.clearScores()
        io.emit('bootstrap', game)
    })

    socket.on('next-player', () => {
        io.emit('bootstrap', game)
    })

});

webServer.listen(3000, function () {
    console.log('> Server listening on port:', 3000)
});

function createGame() {
    console.log('> Starting new game')

    const game = {
        sala,
        players: {},
        drink: {},
        addPlayer,
        removePlayer,
        gamePlayer,
        orderGame,
        clearScores,
        playShot
    }

    function playShot(){

        const base = Math.random() % 2

        if (base === 0) {
            player.shot = "half";
        } if (base === 1) {
            player.shot = "one"
        } else {
            player.shot = "two"
        }

        return player
    }

    function addPlayer(socketId) {
        return game.players[socketId] = {
            sala: sala,
            score: 0
        }
    }


    function removePlayer(socketId) {
        delete game.players[socketId]
    }

    function gamePlayer(socketId) {
        const player = game.players[socketId]

        const base = Math.random() % 2

        if (base === 0) {
            player.game = true;
        } else {
            player.game = false
        }

        return player
    }

    function sala(socketId) {
        const players = game.players
        if(players.length > maxConcurrentConnections){
            return "essa sala está cheia"
        }
    }

    function clearScores() {
        for (socketId in game.players) {
            game.players[socketId].score = 0
        }
    }
    function orderGame(socketId) {
        var playerGame = game.players[Math.floor(Math.random() * myArray.length)];

        return playerGame;
    }

    return game
}