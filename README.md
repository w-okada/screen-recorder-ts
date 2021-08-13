Screen Recorder 
====
This software records the screen with your browser. Safari is not supported. Chrome is supported in both Windows and MacOS.

![ezgif-1-b16517983da2](https://user-images.githubusercontent.com/48346627/103484824-02ac1f80-4e35-11eb-9ca4-c3a560ca6b70.gif)

# Demo

https://flect-lab-web.s3-us-west-2.amazonaws.com/P02_screen-recorder-ts/index.html

If you use firefox or chrome 92 or newer, you may get the error `ReferenceError: SharedArrayBuffer is not defined`.
If so, please run your own server.

```
$ npm run build
$ node server.js
```



# Usage
First, set the screen to be recorded with "Set Screen" button.  Then, you can change the area to be record left side of the window.  Push "Start Rec." to start recording, and "Stop Rec." button to stop recording.



When you push "Stop Rec.", the movie, which is recoreded screen, is shown in right side of the window.  You can change the start time and the end time of movie.  Push "Download" button to download the movie.

If you want to change configuration, push "Configuration" Button. 

![image](https://user-images.githubusercontent.com/48346627/103482555-d5577580-4e24-11eb-9c3c-556f6d3040be.png)


# Build and run
```
npm install
npm run start
```

acess http://localhost:3000
