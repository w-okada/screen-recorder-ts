import React, { createRef, useEffect, useState } from 'react';
import './App.css';
import {FFmpeg, createFFmpeg, fetchFile} from "@ffmpeg/ffmpeg"
import { CanvasRenderer } from './CanvasRenderer';
import { getOutputSize, getScreenSize } from './util';

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
}

const initialState:AppInfo = {
  ffmpeg:createFFmpeg({log:true}), 
  chunks:[],
  screenWidth:640,
  screenHeight:480,
  inputWidth: 640,
  inputHeight: 480,

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

  const videoCanvasRef = createRef<HTMLCanvasElement>()
  const canvasRef      = createRef<HTMLCanvasElement>()
  const hiddenVideoRef = createRef<HTMLVideoElement>()
  const outCanvasRef   = createRef<HTMLCanvasElement>()
  const outputVideoRef = createRef<HTMLVideoElement>()
  useEffect(()=>{
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
      const [screenWidth, screenHeight] = getScreenSize(appInfo.inputWidth, appInfo.inputHeight)
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

        if(appInfo.recorder && appInfo.recorder.state === "recording"){
          console.log("stop recoder!")
          appInfo.recorder.stop()
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
        console.log()
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
    }catch(e){
      console.log(">>>>>>>>>>", e)
    }
  }

  const transcode = async (webcamData:Uint8Array) => {    
    const name = 'record.webm';
    const outName = 'out.mp4'
    if(appInfo.ffmpeg!.isLoaded() === false){
      await appInfo.ffmpeg!.load()
      appInfo.ffmpeg!.setProgress(({ ratio }) => {
        console.log("progress:", ratio);
      });      
    }
    // @ts-ignore
    appInfo.ffmpeg.FS('writeFile', name, await fetchFile(webcamData));
    await appInfo.ffmpeg!.run('-i', name,  '-c', 'copy', outName);
//    await appInfo.ffmpeg!.run('-i', name, outName);
    const data = appInfo.ffmpeg!.FS('readFile', outName)

    outputVideoRef.current!.src = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
  }

  const stopRecord = async() => {
    transcode(new Uint8Array(await (new Blob(appInfo.chunks)).arrayBuffer()));

    try{
        appInfo.recorder.stop()
    }catch(e){}
    // appInfo.chunks = [] //as (Blob[]) // なぜか動かない？assignがうまく使えていないのかも。
    while(appInfo.chunks.length !== 0){
      appInfo.chunks.shift()
    }
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
    const outName = 'out_trimed.mp4'
    const src = outputVideoRef.current!.src
    console.log(src)
    // @ts-ignore
    appInfo.ffmpeg.FS('writeFile', name, await fetchFile(src));
    await appInfo.ffmpeg!.run('-ss', ''+appInfo.startTime, '-i', name,  '-t', ""+(appInfo.endTime-appInfo.startTime), '-c', 'copy', outName);

    const data = appInfo.ffmpeg!.FS('readFile', outName)
    const a = document.createElement("a")
    a.download = outName
    a.href = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
    a.click()
  }

  const realWidth = appInfo.realEndX-appInfo.realStartX
  const realHeight = appInfo.realEndY-appInfo.realStartY
  const outputSize = getOutputSize(realWidth, realHeight)


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
        <input type="button" value="Set Screen"    onClick={(e)=>{setScreen()}}   style={{position: "static"}}/>
        <input type="button" value="Start Record"  onClick={(e)=>{startRecord()}} style={{position: "static"}}/>
        <input type="button" value="Stop Record"   onClick={(e)=>{stopRecord()}}  style={{position: "static"}}/>
        <input type="button" value="Remove Screen" onClick={(e)=>{stopRecord()}}  style={{position: "static"}}/>
        <br/>
        <span  className="btn-orange btn-radius">Set Screen</span>
        <span  className="btn-orange btn-radius">Start Rec.</span>
        <span  className="btn-orange btn-radius">Stop Rec.</span>
        <span  className="btn-orange btn-radius">Remove Screen</span>
        {/* {appInfo.recorder?.state } */}
      </div>
      <div style={{position: "absolute", top:appInfo.screenHeight+30, left:appInfo.screenWidth + 10, width:appInfo.screenWidth}}>
        <input type="button" value="Set Start Point"  onClick={(e)=>{setStartPoint()}}  style={{position: "static"}}/>
        <input type="button" value="Set End Point"    onClick={(e)=>{setEndPoint()}}  style={{position: "static"}}/>
        <input type="button" value="Download"         onClick={(e)=>{download()}} style={{position: "static"}}/>
        Trim : {appInfo.startTime} - {appInfo.endTime}
        
      </div>
      <div style={{position: "absolute", top:appInfo.screenHeight+30}}>
        <video  ref={hiddenVideoRef} width={appInfo.inputWidth} height={appInfo.inputHeight} hidden/>
        <canvas ref={outCanvasRef}   width={outputSize[0]} height={outputSize[1]}  hidden/>
      </div>

    </>
  )
}  


export default App;
