const ipInput = document.createElement('input')
ipInput.type = 'text'
ipInput.style = 'margin: 0 auto;display:block;margin-top:12px;'

const objectRecInput = document.createElement('input')
objectRecInput.type = 'checkbox'
objectRecInput.style = 'margin: 0 auto;margin-left:4px;'

objectRecInput.checked = true

const objectReclabel = document.createElement('label');
objectReclabel.style = 'margin: 0 auto;display:block;text-align: center;'
objectReclabel.innerText = 'Use object recognition'
objectReclabel.appendChild(objectRecInput)

let ip = localStorage.getItem('esp32') || window.location.hostname
ipInput.value = ip

ipInput.onchange = (e) => {
    ip = e.target.value; 
    camStream.src = 'http://' + ip + ':81/stream'
    localStorage.setItem('esp32', ip)
    fetch('http://' + ip + "/control?var=framesize&val=9").then()
}

fetch('http://' + ip + "/control?var=framesize&val=9").then()

const imgContainer = document.createElement('div')
const camStream = document.createElement('img')

camStream.crossOrigin = "anonymous"
imgContainer.style="width:100vw;max-width:600px;margin: 0 auto;position:relative;"
camStream.style="width:100%"

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
    el.addEventListener('touchend', () => doAction(0))
};

const doAction = (action) => {
    fetch('http://' + ip + '/action?action=' + action).then(res => (res.text().then(res => console.log(res))))
}

addAction(upAction, 2)
addAction(rightAction, 4)
addAction(downAction, 1)
addAction(leftAction, 3)

upAction.style = controlStyle + 'margin-left:100px;margin-right:100px;'
downAction.style = controlStyle + 'margin-left:100px;margin-right:100px;'


const detectFromVideoFrame = (model, video) => {

    if (objectRecInput.checked) {

        model.detect(video).then(predictions => {
            //console.log({ predictions })
            renderPredictions(predictions)
        })
    }

    setTimeout(() => detectFromVideoFrame(model, video), 750);
};

window.cocoSsd.load().then(model => {
    setTimeout(() => detectFromVideoFrame(model, camStream), 100)
});

const renderPredictions = (predictions) => {
    Array.from(imgContainer.getElementsByClassName('box')).forEach(item => imgContainer.removeChild(item))


    predictions.forEach(prediction => {
        const box = document.createElement('div')
        box.className = 'box';
        box.style = bboxToStyle(prediction.bbox, prediction.class)

        box.innerText = `${Math.round(prediction.score * 100)}% ${prediction.class}`

        imgContainer.appendChild(box);
    })

}

var stringToColour = function(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    var colour = '#';
    for (var i = 0; i < 3; i++) {
      var value = (hash >> (i * 8)) & 0xFF;
      colour += ('00' + value.toString(16)).substr(-2);
    }
    return colour;
  }

const bboxToStyle = ([x, y, width, height], classname) => {
    //var aspectRatio = windowWidth / espCamWidth;
    var aspectRatio = 1;
    var color = stringToColour(classname);
  
    const style = `
      left: ${aspectRatio * x}px;
      top: ${aspectRatio * y}px;
      width: ${aspectRatio * width}px;
      height: ${aspectRatio * height}px;
      color: ${color};
      border: 4px solid ${color};
      position: absolute;
    `
  
    return style
}

document.addEventListener("DOMContentLoaded", function(){
    imgContainer.appendChild(camStream)
    document.body.appendChild(imgContainer)

    container.appendChild(upAction)
    container.appendChild(leftAction)
    container.appendChild(stopAction)
    container.appendChild(rightAction)
    container.appendChild(downAction)

    document.body.appendChild(ipInput)
    document.body.appendChild(objectReclabel)
    document.body.appendChild(container)
});
