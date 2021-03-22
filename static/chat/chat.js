const socket = io({transports: ['websocket'], upgrade: false})

function sendMsg() {
    const msgValue = $("input#msg")[0].value || ""
    console.log(msgValue)
    if (msgValue.length > 0) {
        socket.emit('message', msgValue)

        const a = document.createElement('p')
        a.innerText = `You: ${msgValue}`
        const e = $('div#messages')[0]
        e.appendChild(document.createElement('br'))
        e.appendChild(a)
    
        $("input#msg")[0].value = ''
    }
}

socket.on('message', text => {
    const a = document.createElement('p')
    a.innerText = text
    const e = $('div#messages')[0]
    e.appendChild(document.createElement('br'))
    e.appendChild(a)
})

window.onload = () => {
    $("button#sendMsg")[0].onclick = sendMsg
    window.addEventListener("keypress", e => {
        if (e.key === "Enter") sendMsg()
    })
}