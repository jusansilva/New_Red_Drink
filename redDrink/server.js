const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)


const game = createGame()
let maxConcurrentConnections = 10

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/game.html')
})


