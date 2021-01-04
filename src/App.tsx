import React, { createRef, useEffect, useState } from 'react';
import './App.css';
import {FFmpeg, createFFmpeg, fetchFile} from "@ffmpeg/ffmpeg"
import { CanvasRenderer } from './CanvasRenderer';
import Modal from 'react-modal';
import { getRestrictedSizeByMax } from './util';


Modal.setAppElement('#root')
const customStyles = {
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)'
 }
};


interface AppInfo{
  mediaStream?:MediaStream
  outStream?:MediaStream
  ffmpeg?:FFmpeg
  chunks: Blob[]
  // @ts-ignore
  recorder?: MediaRecorder
  screenWidth: number
  screenHeight: number
  inputWidth: number
  inputHeight: number

  maxScreenWidth:number
  maxScreenHeight:number
  maxOutputWidth:number
  maxOutputHeight:number

  isSelecting  :boolean
  screenStartX :number,
  screenStartY :number,
  screenEndX   :number,
  screenEndY   :number,
  realStartX   :number,
  realStartY   :number,
  realEndX     :number,
  realEndY     :number,

  startTime    :number,
  endTime      :number,

  isRecording  :boolean,
  modalIsOpen  :boolean,

  outputFormat :string,  
  // progress     :number,
}

const initialState:AppInfo = {
  ffmpeg:createFFmpeg({log:true}), 
  chunks:[],
  screenWidth:640,
  screenHeight:480,
  inputWidth: 640,
  inputHeight: 480,

  maxScreenWidth:640,
  maxScreenHeight:480,
  maxOutputWidth:1024,
  maxOutputHeight:768,

  isSelecting:false,

  screenStartX:-1,
  screenStartY:-1,
  screenEndX:-1,
  screenEndY:-1,

  realStartX:-1,
  realStartY:-1,
  realEndX:-1,
  realEndY:-1,

  startTime:0,
  endTime:0,

  isRecording:false,
  modalIsOpen:false,

  outputFormat:"mp4",
  // progress: -1
}

const initRect = (appInfo:AppInfo, renderer:CanvasRenderer) => {
  appInfo.screenStartX   = -1
  appInfo.screenStartY   = -1
  appInfo.screenEndX   = -1
  appInfo.screenEndY   = -1
  appInfo.realStartX   = -1
  appInfo.realStartY   = -1
  appInfo.realEndX   = -1
  appInfo.realEndY   = -1
  renderer!.setRenderRect(-1, -1, -1, -1)
}
const calcRealRect = (appInfo:AppInfo, hiddenVideo: HTMLVideoElement) => {
  appInfo.realStartX = hiddenVideo.width  * (appInfo.screenStartX / appInfo.screenWidth )
  appInfo.realStartY = hiddenVideo.height * (appInfo.screenStartY / appInfo.screenHeight)
  appInfo.realEndX   = hiddenVideo.width  * (appInfo.screenEndX   / appInfo.screenWidth )
  appInfo.realEndY   = hiddenVideo.height * (appInfo.screenEndY   / appInfo.screenHeight)
}

////////
// App
////////
const App = () => {
  const [appInfo, setAppInfo] = useState(initialState)

  const [renderer, setRenderer] = useState(null as CanvasRenderer | null)
  const [progress, setProgress] = useState(-1)

  const videoCanvasRef = createRef<HTMLCanvasElement>()
  const canvasRef      = createRef<HTMLCanvasElement>()
  const hiddenVideoRef = createRef<HTMLVideoElement>()
  const outCanvasRef   = createRef<HTMLCanvasElement>()
  const outputVideoRef = createRef<HTMLVideoElement>()
  useEffect(()=>{
    console.log("update!")
    if(!renderer){
      console.log("new renderer")
      const newRenderer = new CanvasRenderer(hiddenVideoRef.current!, videoCanvasRef.current!, outCanvasRef.current!)
      setRenderer(newRenderer)
    }

    const ctx = canvasRef.current!.getContext("2d")!

    // レコード範囲の指定
    ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height)
    ctx.fillStyle="#88888888"
    ctx.fillRect(0, 0, canvasRef.current!.width, canvasRef.current!.height)
    if(appInfo.screenEndX!>0){
      ctx.clearRect(appInfo.screenStartX!, appInfo.screenStartY!, appInfo.screenEndX!-appInfo.screenStartX!, appInfo.screenEndY!-appInfo.screenStartY!)
    }


    
    // イベント
    canvasRef.current!.onmousedown = (e:MouseEvent) => {
      console.log("mousedown regist")
      initRect(appInfo, renderer!)
      appInfo.screenStartX = e.offsetX
      appInfo.screenStartY = e.offsetY
      appInfo.isSelecting = true
      setAppInfo(Object.assign({}, appInfo))
    }
    canvasRef.current!.onmousemove = (e:MouseEvent) => {
      if(appInfo.isSelecting){
        appInfo.screenEndX   = e.offsetX
        appInfo.screenEndY   = e.offsetY
        renderer!.setRenderRect(-1, -1, -1, -1)
        setAppInfo(Object.assign({}, appInfo))
      }
    }
    canvasRef.current!.onmouseup = (e:MouseEvent) => {
      if(appInfo.isSelecting){
        appInfo.screenEndX   = e.offsetX
        appInfo.screenEndY   = e.offsetY
        appInfo.isSelecting = false
        calcRealRect(appInfo, hiddenVideoRef.current!)
        renderer!.setRenderRect(appInfo.realStartX, appInfo.realStartY, appInfo.realEndX, appInfo.realEndY)
        console.log(appInfo.realStartX, appInfo.realStartY, appInfo.realEndX, appInfo.realEndY)
      }
      setAppInfo(Object.assign({}, appInfo))
    }
  },[renderer, canvasRef, appInfo, hiddenVideoRef, videoCanvasRef, outCanvasRef])

  /// スクリーン設定
  const setScreen = () =>{
    const streamConstraints = {
      audio:true,
      video:true,
    }

    // @ts-ignore
    navigator.mediaDevices.getDisplayMedia(streamConstraints).then((media:MediaStream) => {
      
      if(appInfo.mediaStream){
        appInfo.mediaStream.getTracks().forEach(track => track.stop())
        appInfo.mediaStream = undefined
      }

      appInfo.mediaStream = media

      //// スクリーンサイズの算出
      appInfo.inputWidth = media.getVideoTracks()[0].getSettings().width!
      appInfo.inputHeight = media.getVideoTracks()[0].getSettings().height!
      const [screenWidth, screenHeight] = getRestrictedSizeByMax(appInfo.maxScreenWidth, appInfo.maxScreenHeight, appInfo.inputWidth, appInfo.inputHeight)
      appInfo.screenWidth = screenWidth
      appInfo.screenHeight = screenHeight



      hiddenVideoRef.current!.pause()
      hiddenVideoRef.current!.srcObject = media
      hiddenVideoRef.current!.onloadedmetadata = () =>{
        hiddenVideoRef.current!.play()

        //// メディアレコーダー
        const options = {
          mimeType : 'video/webm;codecs=h264,opus'
        };

        if(appInfo.outStream){
          appInfo.outStream.getTracks().forEach(track => track.stop())
          appInfo.outStream = undefined
        }
        // @ts-ignore
        const outStream = outCanvasRef.current!.captureStream()
        appInfo.outStream = outStream

        // if(appInfo.recorder && appInfo.recorder.state == "recording"){
        if(appInfo.recorder){
          try{
            console.log("stop recoder!")
            appInfo.recorder.stop()
          }catch(exception){
            console.log("--------------------------------------",exception)
          }
        }
        // @ts-ignore
        const recorder = new MediaRecorder(outStream, options)
        // @ts-ignore
        recorder.ondataavailable = (e:BlobEvent) => {
          appInfo.chunks!.push(e.data)
        }
        appInfo.recorder = recorder

        //// Rect初期化
        appInfo.screenStartX = 0
        appInfo.screenStartY = 0
        appInfo.screenEndX   = appInfo.inputWidth
        appInfo.screenEndY   = appInfo.inputHeight
        appInfo.realStartX = 0
        appInfo.realStartY = 0
        appInfo.realEndX   = appInfo.inputWidth
        appInfo.realEndY   = appInfo.inputHeight
        renderer!.setRenderRect(appInfo.realStartX, appInfo.realStartY, appInfo.realEndX, appInfo.realEndY)
        
        setAppInfo(Object.assign({}, appInfo))
      }
    })
  }

  //// start recording
  const startRecord = async() =>{
    try{
      console.log("START REC:", appInfo.realStartX, appInfo.realStartY, appInfo.realEndX, appInfo.realEndY)
      appInfo.recorder!.start(1000)
      appInfo.isRecording = true
      setAppInfo(Object.assign({}, appInfo))
    }catch(e){
      console.log(">>>>>>>>>>", e)
    }
  }

  const toMp4 = async (webcamData:Uint8Array) => {    
    const name = 'record.webm';
    const outName = 'out.mp4'
    const videoElem = outputVideoRef.current!
    if(appInfo.ffmpeg!.isLoaded() === false){
      await appInfo.ffmpeg!.load()
      appInfo.ffmpeg!.setProgress(({ ratio }) => {
        console.log("progress:", ratio);
        setProgress(ratio)
      });
    }
    // @ts-ignore
    appInfo.ffmpeg.FS('writeFile', name, await fetchFile(webcamData));
    await appInfo.ffmpeg!.run('-i', name,  '-c', 'copy', outName);
//    await appInfo.ffmpeg!.run('-i', name, outName);
    const data = appInfo.ffmpeg!.FS('readFile', outName)

    // video がロードされたら情報を更新
    await new Promise<void>((resolve, reject)=>{
      videoElem.onloadedmetadata = () =>{
        console.log("onload metaa data", videoElem.duration)
        appInfo.endTime = videoElem.duration
        resolve()
      }
      videoElem.src = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
    })
  }

  const stopRecord = async() => {
    try{
      appInfo.recorder.stop()
      appInfo.isRecording = false
    }catch(e){
      console.log("------------------------1", e)
    }
    if(appInfo.chunks.length>0){
      await toMp4(new Uint8Array(await (new Blob(appInfo.chunks)).arrayBuffer()));
    }else{
      alert("not enough data")
    }
    while(appInfo.chunks.length!==0){
      appInfo.chunks.shift()
    }
    setAppInfo(Object.assign({}, appInfo))
  }

  const removeScreen = async() =>{
    try{
      appInfo.recorder.stop()
      appInfo.isRecording = false
    }catch(e){}
    if(appInfo.mediaStream){
      appInfo.mediaStream.getTracks().forEach(track => track.stop())
      appInfo.mediaStream = undefined
    }
    setAppInfo(Object.assign({}, appInfo))
  }

  const setStartPoint = () =>{
    appInfo.startTime = outputVideoRef.current!.currentTime
    setAppInfo(Object.assign({}, appInfo))
  }
  const setEndPoint = () =>{
    appInfo.endTime = outputVideoRef.current!.currentTime
    setAppInfo(Object.assign({}, appInfo))
  }


  const download = async() =>{
    const name = 'out_org.mp4';
    const outName = 'out_trimed.'+appInfo.outputFormat
    const src = outputVideoRef.current!.src

    // @ts-ignore
    appInfo.ffmpeg.FS('writeFile', name, await fetchFile(src));
    const a = document.createElement("a")
    a.download = outName
    if(appInfo.outputFormat === "mp4"){
      await appInfo.ffmpeg!.run('-ss', ''+appInfo.startTime, '-i', name,  '-t', ""+(appInfo.endTime-appInfo.startTime), '-c', 'copy', outName);
      const data = appInfo.ffmpeg!.FS('readFile', outName)
      a.href = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
    }else if(appInfo.outputFormat === "gif") {
      await appInfo.ffmpeg!.run('-ss', ''+appInfo.startTime, '-i', name,  '-t', ""+(appInfo.endTime-appInfo.startTime), outName);
      const data = appInfo.ffmpeg!.FS('readFile', outName)
      a.href = URL.createObjectURL(new Blob([data.buffer], { type: 'image/gif' }));
    }else{
      alert("not supported output format")
    }
    a.click()
  }

  const realWidth = appInfo.realEndX-appInfo.realStartX
  const realHeight = appInfo.realEndY-appInfo.realStartY
  const outputSize = getRestrictedSizeByMax(appInfo.maxOutputWidth, appInfo.maxOutputHeight, realWidth, realHeight)

  const openModal = () =>{
    appInfo.modalIsOpen = true
    setAppInfo(Object.assign({}, appInfo))
  }
  const closeModal = () => {
    appInfo.modalIsOpen = false
    setAppInfo(Object.assign({}, appInfo))
  }
  const afterOpenModal = () =>{
  }

  return(
    <>
      <div style={{position: "absolute", width:appInfo.screenWidth}}>
        Capture Screen: select the area to be captured.<br/> 
        <canvas ref={videoCanvasRef} width={appInfo.screenWidth} height={appInfo.screenHeight} style={{position: "absolute"}}/>
        <canvas ref={canvasRef}      width={appInfo.screenWidth} height={appInfo.screenHeight} style={{position: "absolute"}}/>
      </div>
      <div style={{position: "absolute", left:appInfo.screenWidth + 10, width:appInfo.screenWidth}}>
        Preview: set Time to be trimed.<br/>
        {/* <video ref={outputVideoRef} width={appInfo.realEndX-appInfo.realStartX} height={appInfo.realEndY-appInfo.realStartY} controls /> */}
        <video ref={outputVideoRef} width={appInfo.screenWidth} height={appInfo.screenHeight} controls />
      </div>
      <div style={{position: "absolute", top:appInfo.screenHeight+30, width:appInfo.screenWidth}} >
        <span  className="btn-orange btn-radius" onClick={(e)=>{setScreen()}}>Set Screen</span>
        {
          appInfo.isRecording===false && appInfo.mediaStream ?
          <span  className="btn-orange btn-radius" onClick={(e)=>{startRecord()}}>Start Rec.</span>
            :
          <span  className="btn-grey btn-radius">Start Rec.</span>
        }

        {
          appInfo.isRecording?
            <span  className="btn-orange btn-radius" onClick={(e)=>{stopRecord()}}>Stop Rec.</span>
            :
            <span  className="btn-grey btn-radius">Stop Rec.</span>
        }
        {
          appInfo.mediaStream?
          <span  className="btn-orange btn-radius" onClick={(e)=>{removeScreen()}}>Remove Screen</span>
          :
          <span  className="btn-grey btn-radius">Remove Screen</span>
        }

        <span  className="btn-orange btn-radius" onClick={(e)=>{openModal()}}>Configuration</span>
        <br />

        <span className="label-brown"> Status: {
          appInfo.recorder?
          <span>{appInfo.recorder.state}</span>
          :
          <span>not active</span>
        }</span>
        <br/><br/><br/>
         <a href="https://www.flect.co.jp/">Powered by FLECT Co., LTD.</a> wataru.okada@flect.co.jp

      </div>
      <div style={{position: "absolute", top:appInfo.screenHeight+30, left:appInfo.screenWidth + 10, width:appInfo.screenWidth}}>
        <span  className="btn-orange btn-radius" onClick={(e)=>{setStartPoint()}}>Set Start Point</span>
        <span  className="btn-orange btn-radius" onClick={(e)=>{setEndPoint()}}>Set End Point</span>
        <span  className="btn-orange btn-radius" onClick={(e)=>{download()}}>Download</span>
        <br/>
        <span className="label-brown">
          Trim : {appInfo.startTime} - {appInfo.endTime}
        </span>

        <span className="label-brown">
          Progress : {progress.toString()}
        </span>


      </div>
      <div style={{position: "absolute", top:appInfo.screenHeight+30}}>
        <video  ref={hiddenVideoRef} width={appInfo.inputWidth} height={appInfo.inputHeight} hidden/>
        <canvas ref={outCanvasRef}   width={outputSize[0]} height={outputSize[1]}  hidden/>
      </div>

      
      <Modal
          isOpen={appInfo.modalIsOpen}
          onAfterOpen={afterOpenModal}
          onRequestClose={closeModal}
          style={customStyles}
          contentLabel="Example Modal"
        >
          <h2> Configuration </h2>
          <div>
            ScreenSize(Width x Hiehgt):
              <select value={appInfo.maxScreenWidth.toString()} onChange={(e)=>{appInfo.maxScreenWidth = parseInt(e.target.value); setAppInfo(Object.assign({}, appInfo))}} >
                <option value="640" >640</option>
                <option value="1280" >1280 </option>
              </select>
             x 
             <select value={appInfo.maxScreenHeight.toString()} onChange={(e)=>{appInfo.maxScreenHeight = parseInt(e.target.value); setAppInfo(Object.assign({}, appInfo))}} >
                <option value="480" >480</option>
                <option value="768" >768</option>
              </select>
            <br />
            MaxOutputSize(Width x Hiehgt): 
            <select value={appInfo.maxOutputWidth.toString()} onChange={(e)=>{appInfo.maxOutputWidth = parseInt(e.target.value); setAppInfo(Object.assign({}, appInfo))}} >
                <option value="640" >640</option>
                <option value="1280" >1280 </option>
                <option value="3840" >3840 </option>
              </select>
             x 
             <select value={appInfo.maxOutputHeight.toString()} onChange={(e)=>{appInfo.maxOutputHeight = parseInt(e.target.value); setAppInfo(Object.assign({}, appInfo))}} >
                <option value="480" >480</option>
                <option value="768" >768</option>
                <option value="2160" >2160 </option>
              </select>
            <br />


            <br />
            OutputFormat(gif is slow and not stable):
              <select onChange={(e)=>{appInfo.outputFormat = e.target.value; setAppInfo(Object.assign({}, appInfo))}} value={appInfo.outputFormat}>
                <option value="gif" >gif </option>
                <option value="mp4" >mp4 </option>
              </select>
            
          </div>
            <button onClick={closeModal}>close</button>
        </Modal>
    </>
  )
}  


export default App;
