//Carregar bibliotecas/modulos
const express = require('express') //Carrega o express
const http = require('http') //Carrega o http (biblioteca padrão)
const socketIo = require('socket.io') //Carrega socket.io
const fs = require('fs')

//Setup
const app = express() //Cria a aplicaçãp
const server = http.createServer(app) //Cria um servidor
const io = socketIo().listen(server) //Inicia o socket.io como ouvinte do servidor

app.use(express.static(page())) //Seleciona a pasta pages como provedor de paginas estaticas

injectDebugLogs()

//Selecionar e iniciar servidor
const PORT = process.env.PORT || 5000
server.listen(PORT, () => console.log('Server started on port: ' + PORT))

const gameState = {
    players: [],
    width: 32,
    height: 32,
    fruits: [],
    bestPlayer: null
}

loadBestPlayer()

setInterval(() => {spawnFruit(); update()}, process.env.SPAWN_DELAY || 1000) //spawnar uma fruta a cada tantos segundos

io.on('connection', socket => {
    console.log('Player connected!')

    const player = {
        id: socket.id,
        nick: 'Undefined064',
        color: generateColor(),
        score: 0,
        x: Math.floor(Math.random() * gameState.width),
        y: Math.floor(Math.random() * gameState.height)
    }
    gameState.players.push(player)

    socket.on('change-nick', nick => {
        console.log('Player renamed from ' + player.nick + ' to ' + nick)
        player.nick = validNick(nick)
        update()
    })

    socket.on('move', (direction) => {
        const movements = {
            up: () => (player.y--),
            down: () => (player.y++),
            left: () => (player.x--),
            right: () => (player.x++)
        }

        const playerMovement = movements[direction]
        if (playerMovement) {
            playerMovement()
        }

        player.x = Math.max(0, Math.min(gameState.width - 1, player.x))
        player.y = Math.max(0, Math.min(gameState.height - 1, player.y))

        gameState.fruits.forEach(fruit => {
            if (player.x == fruit.x && player.y == fruit.y) {
                player.score += 1
                gameState.fruits.splice(gameState.fruits.indexOf(fruit), 1)
                if (gameState.fruits.length == 0) {
                    spawnFruit() // Ja spawna se não tiver nenhuma no campo senão fica ruin para o jogador esperar o spwn de outra fruta
                }
                
                console.log(player.nick + ' has collected a fruit')

                if (gameState.bestPlayer === null || player.score > gameState.bestPlayer.score) {
                    gameState.bestPlayer = {
                        nick: player.nick,
                        score: player.score,
                        color: player.color
                    }
                    saveBestPlayer()

                    console.log(player.nick + ' is the best player')
                }
            }
        })

        update()
    })

    socket.on('disconnect', () => {
        console.log('Player disconnected')
        gameState.players = gameState.players.filter(player => player.id !== socket.id)
        update()
    })

    update()
})

function injectDebugLogs() {
    const DEBUG = process.env.DEBUG
    const defaultLog = console.log
    console.log = (msg) => {
        if (DEBUG) {
            defaultLog('debug: ' + msg)
        }
    }
}

function validNick(nick) {
    const validNickRegex = /^[a-zA-Z0-9_]{4,20}$/
    if (nick.match(validNickRegex)) {
        return nick
    }

    availableChars = 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz0123456789'.split('')

    nick = ''
    for (let i = 0; i < 10; i++) {
        nick += availableChars[parseInt(Math.random() * availableChars.length)]
    }

    return nick;
}

function update() {
    io.emit('update', gameState)
}

//Função que spawn frutas... o numero maximo de frutas spawnadas simultaneamente é de 10 frutas
function spawnFruit() {
    //Spawna ate 'MAX_FRUITS' frutas, nunca pode ter mais fruta do q player, e o minimo de frutas seria 'MIN_FRUITS'.
    if (gameState.fruits.length < process.env.MAX_FRUITS && gameState.fruits.length < Math.max(process.env.MIN_FRUITS, gameState.players.length)) {
        const fruit = {
            x: Math.floor(Math.random() * gameState.width),
            y: Math.floor(Math.random() * gameState.height)
        }
        gameState.fruits.push(fruit)

        console.log('Spawned a fruit!')
    }
}

function page(pageName) {
    //Esta função retorna o path de uma pagina da pasta pages. 
    //Quando o prametro pageName é nulo, ela retorna apenas o path da pasta pages

    var path = __dirname + '/pages/'
    if (pageName) {
        path += pageName
    }
    return path
}

function generateColor() {
    return 'hsl(' + parseInt(Math.random() * 360) + ', 82%, 34%, 1)'
}

function loadBestPlayer() {
    fs.readFile(__dirname+'/bp.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err)
            return
        }
        gameState.bestPlayer = JSON.parse(data)
    })
}

function saveBestPlayer() {
    if (gameState.bestPlayer == null) {
        return
    }
    fs.writeFile(__dirname+'/bp.json', JSON.stringify(gameState.bestPlayer), {flag: 'a+'}, err => console.error(err))
}