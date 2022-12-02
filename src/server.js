//Load modules
const express = require('express')
const http = require('http') 
const socketIo = require('socket.io')
const game = require('./game')

//Setup server
const app = express() //Create the app
const server = http.createServer(app) //Create the server
const io = socketIo().listen(server) //Initialize the socket.io as the server listener
app.use(express.static(page())) //Select "pages" folder as static content provider

//Start server on select port
const PORT = process.env.PORT || 5000
server.listen(PORT, () => console.log('Server started on port: ' + PORT))

//Constants and envirounment variables
const SPAWN_DELAY = process.env.SPAWN_DELAY || 1000
const MIN_FRUITS = process.env.MIN_FRUITS || 10
const MAX_FRUITS = process.env.MAX_FRUITS || 20
const playerMovements = {
    up: player => (player.y--),
    down: player => (player.y++),
    left: player => (player.x--),
    right: player => (player.x++)
}

const gameState = game.createGameState(32, 32)

io.on('connection', socket => {
    const nick = validNick(socket.handshake.query.nick)
    const player = gameState.spawnPlayer(socket.id, nick)
    console.log('Player connected: '+player.nick)

    //Player move event
    socket.on('move', (direction) => {
        const movement = playerMovements[direction]
        if (movement) {
            movement(player)
        }

        //Wall collision
        player.x = Math.max(0, Math.min(gameState.width - 1, player.x))
        player.y = Math.max(0, Math.min(gameState.height - 1, player.y))

        //Detect and process player and fruit collisions
        gameState.checkFruitsCollision(player, () => {
            //60% on chance to imediate spawn a fruit
            spawnFruitRandomPercentage(0.6)
        })
        
        //Update best player (if necessary)
        gameState.updateBestPlayer(player)

        //Send updates for all players
        update()
    })

    //Player disconnect event 
    socket.on('disconnect', () => {
        console.log('Player disconnected: '+player.nick)
        gameState.removePlayer(player)
        update()
    })

    update()
})

setInterval(spawnFruitAndUpdate, SPAWN_DELAY) //spawnar uma fruta a cada tantos segundos

function page(pageName) {
    //This function returns the path of a page from the "pages" folder. 
    //When the "pageName" parameter is null, it returns "pages" folder path only

    const parentDirName = __dirname.substring(0, __dirname.length - '/src'.length) //Remove "/src" 
    var path = parentDirName + '/pages/'
    if (pageName) {
        path += pageName
    }
    return path
}

//Function responsible for filtering users' nicks. If the nick is null or invalid, it returns a random string
function validNick(nick) {
    //Verify the nick rules: 4 to 20 characters, and with only letters, numbers and underline.
    const validNickRegex = /^[a-zA-Z0-9_]{4,20}$/
    if (nick.match(validNickRegex)) {
        return nick
    }

    //Generate random nick 
    availableChars = 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz0123456789'.split('')
    nick = ''
    for (let i = 0; i < 10; i++) {
        nick += availableChars[parseInt(Math.random() * availableChars.length)]
    }

    return nick;
}

//Sent the current gameState for all player
function update() {
    io.emit('update', gameState.publicState())
}

function spawnFruitAndUpdate() {
    spawnFruit()
    update()
}

//Fruit spawn function
function spawnFruit() {
  if (gameState.fruits.length < MAX_FRUITS && gameState.fruits.length < Math.max(MIN_FRUITS, gameState.players.length)) {
        gameState.spawnFruit()
    }
}

function spawnFruitRandomPercentage(percent) {
    if (Math.random() < percent) {
        spawnFruit()
    }
}