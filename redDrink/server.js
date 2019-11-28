const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)


const game = createGame()
let maxConcurrentConnections = 10

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/game.html')
})

setInterval(() => {
    io.emit('concurrent_connections', io.engine.clientsCount)
}, 5000);

io.on('connection', function(socket) {
    const admin = socket.handshake.query.admin
    
    if(io.engine.clientsCount > maxConcurrentConnections && !admin){
        socket.emit('show-max-concurrent-connections-message')
        socket.conn.close()
        return
    }else{
        socket.emit('hide-max-concurret-connections-message')
    }

    const playerState = game.addPlayer(socket.id)
    socket.emit('bootstrap', game)

    socket.broadcast.emit('player-update', {
        socketId: socket.id,
        newState: playerState
    })

    if(drink){
        io.emit('drink', {
            drinkId: drink.drinkId,
            score: game.players[socket.id].score
        })
    } 
})

socket.on('disconnect', () =>{
    game.removePlayer(socket.id)
    socket.broadcast.emit('player-remove', socket.id)
})

server.listen(3000, function(){
  console.log('> Server listening on port:',3000)
});


function createGame() {
    console.log('> Starting new game')
    let orderPleyer
    
    const game ={
        players: {},
        order: {},
        addPlayer,
        removePlayer,
        goPlayer,
        checkDrink,
        clearScore
    }

    function addPlayer(socket) {
        return game.players[socket['socketId']] = {
            name: socket['name'],
            score: 0
        }
    }

    function removePlayer(socketId) {
        delete game.players[socketId]
    }

    function goPlayer(socketId) {
        
    }

    function goAction(socketId) {
        
    }

    function clearScore(params) {
        
    }
}