function createGameState(width, height) {
    console.log('Creating game state')
    const gameState = {
        width: width,
        height: height,
        players: [],
        fruits: [],
        bestPlayer: null,
        updateBestPlayer: function(player) {
            if (this.bestPlayer === null || player.score > this.bestPlayer.score) {
                this.bestPlayer = {
                    nick: player.nick,
                    score: player.score,
                    color: player.color
                }
            }
        },
        spawnPlayer: function(socketId, nick) {
            const player = {
                id: socketId,
                nick: 'Undefined064',
                color: 'hsl(' + parseInt(Math.random() * 360) + ', 82%, 34%, 1)',
                score: 0,
                x: Math.floor(Math.random() * this.width),
                y: Math.floor(Math.random() * this.height)
            }
            this.players.push(player)
            return player
        },
        removePlayer: function(player) {
            this.players = this.players.filter(other => other.id !== player.id)
        },
        checkFruitsCollision: function(player, onCollect) {
            //Detectar e processar frutas coletadas
            this.fruits.forEach(fruit => {
                if (player.x == fruit.x && player.y == fruit.y) {
                    player.score += 1
                    this.removeFruit(fruit)

                    onCollect()

                    console.log(player.nick + ' has collected a fruit')
                }
            })
        },
        spawnFruit: function() {
            const fruit = {
                x: Math.floor(Math.random() * this.width),
                y: Math.floor(Math.random() * this.height)
            }
            this.fruits.push(fruit)
        },
        removeFruit: function(fruit) {
            this.fruits = this.fruits.filter(f => f !== fruit)
        },
        publicState: function() {
            //Retorna versão publica do gameState (sem as funcões)
            return {
                width: this.width,
                height: this.height,
                players: this.players,
                fruits: this.fruits,
                bestPlayer: this.bestPlayer
            }
        }
    }

    return gameState
}

module.exports = {
    createGameState
}