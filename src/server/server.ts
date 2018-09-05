import * as  express from 'express';
import {ObjectDetectionWorkSpace, ProjectParam} from "../object_detection/ObjectDetection";

const app = express();

app.get('/api/model_config', (req:express.Request, res:express.Response) => {
    res.send('GET request to the homepage')
});

app.get('/api/object_detection/create', (req:express.Request, res:express.Response) => {
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
    o.createProject(param).then(p => {  
        res.send(JSON.stringify(p));        
    });
});

const port = 4000;
app.listen(port, (err: any) => {
    if (err) {
        return console.log(err)
    }
    return console.log(`server is listening on ${port}`)
});
