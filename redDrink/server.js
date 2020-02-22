console.log('> Script started')
const express = require('express')
const webApp = express()
const webServer = require('http').createServer(webApp)
const io = require('socket.io')(webServer)
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('reddrinkdb.sqlitle3');
webApp.use(express.urlencoded())

const game = createGame()
let maxConcurrentConnections = 5
let maxSala


webApp.get('/', (req, res) => {
    res.sendFile(__dirname + '/home.html')
})

webApp.get('/sala', (req, res) => {
    res.sendFile(__dirname + '/addSala.html')
})

webApp.get('/gameSelect', (req, res) => {
    res.sendFile(__dirname + '/gameSelect.html')
})

// webApp.post('/sala', (req, res) => {
//     const sala = req.body.sala
//     const username = req.body.username
//     const email = req.body.email
// console.log(req.body)
//      var verifyUser

    // db.get(`select username, email from user where email=${email}`, [], (erro, data) => {
    //     if (!erro) {
    //         verifyUser = data
    //     }
    // })

    // if (verifyUser > 0) {
    //     res.send("usuariao ja cadastrado");
    // } else {
        // db.run(`insert into user valuer(${email}, ${username}, 0, 0)`)
        // res.sendFile(__dirname + `/game.html`, {username:username})
    // }

// })

webApp.get('/game', (req, res) => {
    res.sendFile(__dirname + '/game.html')
})
// Coisas que só uma POC vai conhecer
webApp.get('/a31ecc0596d72f84e5ee403ddcacb3dea94ce0803fc9e6dc2eca1fbabae49a3e3a31ecc0596d72f84e5ee40d0cacb3dea94ce0803fc9e6dc2ecfdfdbabae49a3e3', function (req, res) {
    res.sendFile(__dirname + '/game-admin.html')
})

webApp.get('/collect.mp3', (req, res) => {
    res.sendFile(__dirname + '/collect.mp3')
})

webApp.get('/backgroud.png', (req, res) => {
    res.sendFile(__dirname + '/asset/image/fundo.png')
})

webApp.get('/reddrink', (req, res) => {
    res.sendFile(__dirname + '/asset/image/red drink.gif')
})

webApp.get('/100-collect.mp3', (req, res) => {
    res.sendFile(__dirname + '/100-collect.mp3')
})

webApp.get('/asset/css', (req, res) => {
    res.sendFile(__dirname + '/asset/css/index.css')
})

setInterval(() => {
    io.emit('concurrent-connections', io.engine.clientsCount)
}, 5000)


io.on('connection', function (socket) {
    const admin = socket.handshake.query.admin

    if (io.engine.clientsCount > maxConcurrentConnections && !admin) {
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

    socket.on('player-move', (direction) => {
        game.movePlayer(socket.id, direction)

        const fruitColisionIds = game.checkForFruitColision()

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


    let fruitGameInterval
    socket.on('admin-start-fruit-game', (interval) => {
        console.log('> Fruit Game start')
        clearInterval(fruitGameInterval)

        fruitGameInterval = setInterval(() => {
            const fruitData = game.addFruit()

            if (fruitData) {
                io.emit('fruit-add', fruitData)
            }
        }, interval)
    })

    socket.on('admin-stop-fruit-game', () => {
        console.log('> Fruit Game stop')
        clearInterval(fruitGameInterval)
    })

    socket.on('admin-start-crazy-mode', () => {
        io.emit('start-crazy-mode')
    })

    socket.on('admin-stop-crazy-mode', () => {
        io.emit('stop-crazy-mode')
    })

    socket.on('admin-clear-scores', () => {
        game.clearScores()
        io.emit('bootstrap', game)
    })

    socket.on('admin-concurrent-connections', (newConcurrentConnections) => {
        maxConcurrentConnections = newConcurrentConnections
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
        clearScores
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

    }

    function clearScores() {
        for (socketId in game.players) {
            game.players[socketId].score = 0
        }
    }
    function orderGame() {
        var playerGame = game.players[Math.floor(Math.random() * myArray.length)];

        return playerGame;
    }

    return game
}