/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/anchor-has-content */
import { useState } from 'react';
import { useEffect } from 'react';
import './App.less';

// import socketIOClient from "socket.io-client";

//var url = "http://192.168.2.11"

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

  const style = {
    left: aspectRatio * x,
    top: aspectRatio * y,
    width: aspectRatio * width,
    height: aspectRatio * height,
    color: color,
    border: `4px solid ${color}`
  }

  return style
}

var objectRecognitionOn = true;


//const socket = socketIOClient(url);

function App() {

  var [predictions, setPredictions] = useState([])
  var [_, stateHasChanged] = useState({})
  var [hostname, setHostname] = useState(localStorage.getItem('esp32') || '192.168.2.11')

  const url = `http://${hostname}`

  const doAction = (action) => fetch(url + '/action?action=' + action).then()

  const detectFromVideoFrame = (model, video, getState) => {

    if (objectRecognitionOn) {

      model.detect(video).then(predictions => {
        setPredictions(predictions);

        setTimeout(() => detectFromVideoFrame(model, video), 750)
      }, (error) => {
        console.error(error)
      });
    }
    else {
      setTimeout(() => detectFromVideoFrame(model, video), 750)
    }
  };

  var loadCoco = async () => {
    var model = await window.cocoSsd.load();
    var video = document.getElementById('stream')

    // ebugger
    setTimeout(() => detectFromVideoFrame(model, video), 1)
  }

  useEffect(() => {

    fetch(url + "/control?var=framesize&val=9").then()

    // socket.on("predictions", data => {
    //   setPredictions(data);
    // });

    loadCoco();

  }, [])

  // if (!document.URL.includes("dsafkjasdflkasjdflasmvaslkdv")) {
  //   return
  // }

  const stopMotor = () => doAction(0)

  return (
    <div className="parent">

      <div style={{ width: '100%', maxWidth: 600, margin: '0 auto', position: 'relative'  }}>        
        <img style={{ width: '100%' }} id="stream" src={url + ":81/stream"} crossOrigin=""></img>

        {predictions && predictions.map(prediction => 
          <div key={prediction.class + prediction.bbox[0]} className='box' style={bboxToStyle(prediction.bbox, prediction.class)}>{Math.round(prediction.score * 100)}% {prediction.class}</div>
        )}

      </div>

      <div style={{margin: '0 auto'}}>
        <label htmlFor="objectRecCheck">
          <input id="objectRecCheck" onChange={() => {objectRecognitionOn = !objectRecognitionOn; stateHasChanged({})}} checked={objectRecognitionOn} type="checkbox" value="test" /> Use object recognition
      </label>
     </div>

    <div className="set blue">
      <nav className="d-pad" style={{ maxWidth: 600, maxHeight: 600, margin: '0 auto' }}>
        {getControl(() => doAction(3), stopMotor, 'up control')}
        {getControl(() => doAction(1), stopMotor, 'right control')}
        {getControl(() => doAction(4), stopMotor, 'down control')}
        {getControl(() => doAction(2), stopMotor, 'left control')}
      </nav>
    </div>
  

  <input type='text' value={hostname} onChange={e => {
    setHostname(e.target.value)
    localStorage.setItem('esp32', e.target.value)
   }} />
  </div>
  );
}

const getControl = (down, up, classname) => {
  return <a className={classname} data-direction="left" onTouchStart={down} onTouchEnd={up} onMouseDown={down} onMouseUp={up}></a>
}

export default App;
