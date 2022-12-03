# Online064
![cover image](assets/readme-cover.jpg)

A simple online mini game.

# About
I have maded this project for learn how to use socket.io, and I have realy liked to work on this.
The game consists on a 32x32 arena (bud it can be easyly changed on [server.js](src/server.js) file), where you and the other online players can dispute the "fruits" that are spawned from time in time. The fruits can be spawned when you collect a fruit too, bud it not always accurs.

# How to run this project on your own
If you want to run the project localy, you will need for firt time to clone this repo.

```bash
$ git clone https://github.com/Raffa064/Online064.git
```

After cloned, you can quickly run with the "test" script:

```bash
$ npm run test
```

If you want to run with your custom params, you will need to export the exvironment variables manually, example:

```bash
$ export PORT=5000
$ export MIN_FRUITS=10
$ export MAX_FRUITS=20
$ export SPAWN_DELAY=1000
$ node .
```

After you runned the server, you can test on your browser, with a localhost url, like this:

```
http://localhost:5000
```

NOTE: You will need to put your server port after "localhost:". The default port is 5000.