function play() {
    const input = document.querySelector('#nick')

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

    window.location.replace("game.html?nick=" + validNick(input.value))
}