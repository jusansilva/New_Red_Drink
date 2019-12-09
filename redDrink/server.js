const express = require('express')
, passport = require("passport")
, FacebookStrategy = require("passport-facebook")
, session = require("express-session")
, cookieParse = require("cookie-parser")
, bodyParser = require("body-parser")
, config = require("./config")
, mysql = require("mysql")
, app = express()
, server = require("http").createServer(app)
, io = require("socket.io");

const pool = mysql.createPool({
    host : config.host,
    user : config.user_name,
    password : config.password,
    database : config.database
})

passport.serializeUser(function(user, done) {
    done(null, user)
})

passport.deserializeUser(function(obj, done) {
    done(null, obj)
})

passport.use( new FacebookStrategy({
    clientId : config.Facebook_api_key,  
    clientSecret : config.facebook_api_secret,
    callbackURL : config.callback_url
}),
function(accessToken, refreshToken, profile, done){
    process.nextTick(function(){
        if(config.use_databse){
            pool.query('SELECT * from user_info where user_id='+profile.id, (err, rows) => {
                if(err) throw err;
                if(rows && rows.length === 0){
                    console.log("Ainda não é um usuario, adicionando agora");
                    pool.query("INSERT into user_info(user_id, user_name) VALUE ('"+profile.id+"','"+profile.user_name+"')");
                }
            })
        }
        return done(null, profile);
    })
})

const game = createGame()
let maxConcurrentConnections = 6

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