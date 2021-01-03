import { MAX_OUTPUT_HEIGHT, MAX_OUTPUT_WIDTH, MAX_SCREEN_HEIGHT, MAX_SCREEN_WIDTH} from "./const"

export const getScreenSize = (inputWidth:number, inputHeight:number):number[] => {
    const maxAspect = MAX_SCREEN_WIDTH  / MAX_SCREEN_HEIGHT
    const aspect    = inputWidth / inputHeight
    if(maxAspect > aspect){
      const height = MAX_SCREEN_HEIGHT
      const width  = MAX_SCREEN_HEIGHT/inputHeight * inputWidth 
      return [width, height]
    }else{
      const width  = MAX_SCREEN_WIDTH
      const height = MAX_SCREEN_WIDTH/inputWidth * inputHeight 
      return [width, height]
    }
}
  


export const getOutputSize = (outputWidth:number, outputHeight:number):number[] => {
    if(outputWidth < MAX_OUTPUT_WIDTH && outputHeight < MAX_OUTPUT_HEIGHT){
        return [outputWidth, outputHeight]
    }

    const maxAspect = MAX_OUTPUT_WIDTH  / MAX_OUTPUT_HEIGHT
    const aspect    = outputWidth / outputHeight
    if(maxAspect > aspect){
      const height = MAX_OUTPUT_HEIGHT
      const width  = MAX_OUTPUT_HEIGHT/outputHeight * outputWidth 
      return [width, height]
    }else{
      const width  = MAX_OUTPUT_WIDTH
      const height = MAX_OUTPUT_WIDTH/outputWidth * outputHeight 
      return [width, height]
    }
}
