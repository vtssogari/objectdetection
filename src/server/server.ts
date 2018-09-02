import * as  express from 'express';
const app = express();

app.get('/api/model_config', (req:express.Request, res:express.Response) => {
    res.send('GET request to the homepage')
});

app.get('/api/create', (req:express.Request, res:express.Response) => {
    res.send('GET request to the homepage')
});

const port = 4000;
app.listen(port, (err: any) => {
    if (err) {
        return console.log(err)
    }
    return console.log(`server is listening on ${port}`)
});
