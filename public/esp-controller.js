const ipInput = document.createElement('input')
ipInput.type = 'text'
ipInput.style = 'margin: 0 auto;display:block;margin-top:12px;'

let ip = '192.168.2.11'

const camStream = document.createElement('img')
camStream.style="width:100vw;max-width:600px;margin: 0 auto;"

camStream.src = 'http://' + ip + ':81/stream'

const container = document.createElement('div')
const upAction = document.createElement('div')

const controlStyle = "width:100px;height:100px;background:gray;float:left;cursor:pointer;"

container.style="width:300px;height:300px;margin:0 auto;margin-top:12px;"
upAction.style = controlStyle

const downAction = upAction.cloneNode();
const leftAction = upAction.cloneNode();
const rightAction = upAction.cloneNode();
const stopAction = upAction.cloneNode();

const addAction = (el, action) => {
    el.addEventListener('mousedown', () => doAction(action))
    el.addEventListener('mouseup', () => doAction(0))

    el.addEventListener('touchstart', () => doAction(action))
    el.addEventListener('ontouchend', () => doAction(0))
}

const doAction = (action) => {
    fetch('http://' + ip + '/action?action=' + action)
}

addAction(upAction, 2)
addAction(rightAction, 4)
addAction(downAction, 1)
addAction(leftAction, 1)

upAction.style = controlStyle + 'margin-left:100px;margin-right:100px;'
downAction.style = controlStyle + 'margin-left:100px;margin-right:100px;'

document.addEventListener("DOMContentLoaded", function(){
    document.body.appendChild(camStream)

    container.appendChild(upAction)
    container.appendChild(leftAction)
    container.appendChild(stopAction)
    container.appendChild(rightAction)
    container.appendChild(downAction)

    document.body.appendChild(ipInput)
    document.body.appendChild(container)
});
