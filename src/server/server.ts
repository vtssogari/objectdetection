import * as  express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';
import {ObjectDetectionWorkSpace, ProjectParam, getProjects, baseFolder} from "../object_detection/ObjectDetection";
import {Project} from "../object_detection/Interfaces";
import {Train} from "../object_detection/Train";

const app = express();

//initialize a simple http server
const server = http.createServer(app);

//initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });

interface Command {
    project_name: string;
    gpu_num:number;
}
wss.on('connection', (ws: WebSocket) => {
    //connection is up, let's add a simple simple event
    ws.on('message', (message: string) => {
        //log the received message and send it back to the client
        console.log('received: %s', message);
        try{
            let command:Command = JSON.parse(message);
            getProjects().then(projects => {            
                let matched = projects.filter( p => { return p.name == command.project_name; });
                if(matched.length > 0){
                    let project = matched[0];
                    let train:Train = new Train();
                    let obaBaseFolder = `${baseFolder}/models/research`
                    train.run(project, obaBaseFolder, ws, command.gpu_num+'', '1');
                }
            }).catch(error => {
                console.error(error);
                ws.send(error);
                ws.close();
            })
        }catch( err){
            ws.send(err);
            ws.close();
        };
    });
    //send immediatly a feedback to the incoming connection    
    ws.send('WebSocket server is connected');
});


app.get('/api/model_config', (req:express.Request, res:express.Response) => {
    res.send('GET request to the homepage')
});

app.get('/api/object_detection/create', (req:express.Request, res:express.Response) => {
    createProject().then(project => res.send(JSON.stringify(project)));
});

function createProject():Promise<Project>{
    let isDockerEnv = false;
    let o = new ObjectDetectionWorkSpace(isDockerEnv);
    let param: ProjectParam = {
        projectName: "raccoon",
        modelName: "ssd_inception_v2",
        tf_rec_train: "train.record",
        tf_rec_eval: "test.record",
        labelMaps: [{ id: 1, label: "raccoon" }],
        from_detection_checkpoint: true,
        pretrainedModeName: 'ssd_inception_v2_coco',
        num_steps: 200000,
        batch_size: 34        
    }
    return o.createProject(param);
}

const port = 4000;
app.listen(port, (err: any) => {
    if (err) {
        return console.log(err)
    }
    return console.log(`server is listening on ${port}`)
});

const wsport = 4001;
server.listen(wsport, (err: any) => {
    if (err) {
        return console.log(err)
    }
    return console.log(`wsport is listening on ${wsport}`)
});