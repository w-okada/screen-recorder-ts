// import { MAX_OUTPUT_HEIGHT, MAX_OUTPUT_WIDTH, MAX_SCREEN_HEIGHT, MAX_SCREEN_WIDTH} from "./const"

export const getRestrictedSizeByMax = (maxWidth:number, maxHeight:number, inputWidth:number, inputHeight:number):number[] => {
    if(inputWidth < maxWidth &&  inputHeight < maxHeight){
        return [inputWidth,  inputHeight]
    }

    const xRate     = maxWidth / inputWidth
    const tmpHeight = inputHeight * xRate
    if(tmpHeight > maxHeight){
      const yRate = maxHeight / inputHeight
      const tmpWidth = yRate * inputWidth
      return [tmpWidth, maxHeight]
    }else{
      return [maxWidth, tmpHeight]
    }

    // const maxAspect = maxWidth  / maxHeight
    // const aspect    = inputWidth / inputHeight
    // if(maxAspect > aspect){
    //   const height = maxHeight
    //   const width  = maxHeight/inputHeight * inputWidth 
    //   return [width, height]
    // }else{
    //   const width  = maxWidth
    //   const height = maxWidth/inputWidth * inputHeight 
    //   return [width, height]
    // }
}
  


// export const getOutputSize = (outputWidth:number, outputHeight:number):number[] => {
//     if(outputWidth < MAX_OUTPUT_WIDTH && outputHeight < MAX_OUTPUT_HEIGHT){
//         return [outputWidth, outputHeight]
//     }

//     const maxAspect = MAX_OUTPUT_WIDTH  / MAX_OUTPUT_HEIGHT
//     const aspect    = outputWidth / outputHeight
//     if(maxAspect > aspect){
//       const height = MAX_OUTPUT_HEIGHT
//       const width  = MAX_OUTPUT_HEIGHT/outputHeight * outputWidth 
//       return [width, height]
//     }else{
//       const width  = MAX_OUTPUT_WIDTH
//       const height = MAX_OUTPUT_WIDTH/outputWidth * outputHeight 
//       return [width, height]
//     }
// }
