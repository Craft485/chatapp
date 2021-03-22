const express = require('express')
const app = express()
const http = require('http').createServer(app)
const conf = require('./conf.json')
const fs = require('fs')
const io = require('socket.io')(http)
require('colors')

const files = []
const dirs = new Map

fs.readdir('./static', (err, readData) => {
    if (err) throw err

    const fileList = readData.filter(x => x.includes("."))
    const dirList = readData.filter(x => !x.includes("."))

    fileList.forEach(file => {
        files.push(file.split(".")[0])
        files.push(file)
    })
    // Read subdirs
    dirList.forEach(dir => {
        fs.readdir(`./static/${dir}`, (err, readData) => {
            if (err) throw err

            let subDirFileList = []
            readData.forEach(file => {
                subDirFileList.push(file.split(".")[0])
                subDirFileList.push(file)
                if (file.endsWith('html')) files.push(file.split(".")[0])
                files.push(file)
            })
            dirs.set(dir, subDirFileList)
        })
    })
})

io.on("connection", socket => {
    socket.send('message', 'connected')
    console.log(`Connection Received: ${socket.id}`.underline)

    socket.on('message', message => {
        console.log('msg given')
        socket.broadcast.emit('message', `${socket.id.substr(0,2)}: ${message}`)
    })

    socket.on('disconnect', () => {console.log("user Disconnect")})

})

app.get(['/', /./], (req, res) => { 
    console.log(`GET Path: ${req.path}`.magenta)

    const endPoint = req.path.split('/').pop()

    if (files.includes(endPoint)) {
        const path = `./static${req.path.includes('.') ? req.path : `${req.path}.html`}`
        res.status(200).sendFile(path, { root: '.' })
    } else if (dirs.get(endPoint)) {
        res.status(200).sendFile(`./static${req.path}/index.html`, { root: '.' })
    } else if (['/', 'home', 'homepage'].includes(req.path)) {
        res.status(200).sendFile('./static/index.html', { root: '.' })
    } else {
        res.status(404).sendFile('./static/404.html', { root: '.' })
    }
})

setTimeout(() => {
    console.log(`Loaded file names: ${files.join(', ')}`.magenta);
    console.log(`Found Dir Count: ${dirs.size}`.magenta)
}, 1000)

http.listen(conf.port, console.log("SERVER ONLINE".magenta))