
////////
// CanvasRenderer
////////
export class CanvasRenderer{
    sourceVideoElement:HTMLVideoElement
    destinationCanvasElement:HTMLCanvasElement
    outCanvasElement: HTMLCanvasElement
  
    isRecording = false
  
    realStartX   = -1
    realStartY   = -1
    realEndX     = -1
    realEndY     = -1
  
    constructor(sourceVideoElement:HTMLVideoElement, destinationCanvasElement:HTMLCanvasElement, outCanvasElement:HTMLCanvasElement){
      this.sourceVideoElement = sourceVideoElement
      this.destinationCanvasElement = destinationCanvasElement
      this.outCanvasElement = outCanvasElement
      this.copyFrame()
    }
  
    copyFrame = () =>{
      const ctx = this.destinationCanvasElement.getContext("2d")!
      ctx.drawImage(this.sourceVideoElement, 0, 0, this.destinationCanvasElement.width, this.destinationCanvasElement.height)

      if(this.realStartX >= 0){
          this.outCanvasElement.getContext("2d")!.drawImage(
            this.sourceVideoElement,
            this.realStartX, this.realStartY, this.realEndX - this.realStartX, this.realEndY - this.realStartY,
            0, 0, this.outCanvasElement.width, this.outCanvasElement.height,
        )
      }
        //   requestAnimationFrame(this.copyFrame)
      setTimeout(this.copyFrame, 0)
    }
  
    setRenderRect = (realStartX:number, realStartY:number, realEndX:number, realEndY:number) =>{
      this.realStartX = realStartX
      this.realStartY = realStartY
      this.realEndX   = realEndX
      this.realEndY   = realEndY
    }
  }