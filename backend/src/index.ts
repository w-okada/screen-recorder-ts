import express from "express";


const port: number = Number(process.env.PORT) || 3000;
const watch = process.env.WATCH ? true : false
const app = express();

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.use('/frontend', express.static('frontend/dist/', {
    setHeaders: function (res, path) {
        res.set("Cross-Origin-Opener-Policy", "same-origin");
        res.set("Cross-Origin-Embedder-Policy", "require-corp");
    }
}));

app.listen(port, () => {
    console.log(`listening on *:${port}`);
})