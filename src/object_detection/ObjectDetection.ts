/*
TensorFlow
├─ addons
│ └─ labelImg
├─ models
│ ├─ official
│ ├─ research
│ ├─ samples
│ └─ tutorials
└─ workspace
   └─ training_demo
      ├─ annotations          //This folder will be used to store all *.csv files
      ├─ images               //This folder contains a copy of all the images in our dataset, as well as the respective *.xml files produced for each one, once labelImg is used to annotate objects.
      │ ├─ test               //This folder contains a copy of all images, and the respective *.xml files, which will be used to train our model.
      │ └─ train              //This folder contains a copy of all images, and the respective *.xml files, which will be used to train our model.
      ├─ tfrecords            //The TensorFlow *.record files, which contain the list of annotations for our dataset images.
      │ ├─ test 
      │ └─ train      
      ├─ pre-trained-model    //This folder will contain the pre-trained model of our choice, which shall be used as a starting checkpoint for our training job.
      ├─ training             //This folder will contain the training pipeline configuration file *.config, as well as a *.pbtxt label map file and all files generated during the training of our model.
      └─ README.md            //This is an optional file which provides some general information regarding the training 
*/

//  num_classes: |num_classes|                               2 - x
//  fine_tune_checkpoint : |fine_tune_checkpoint|           {BASE_FOLDER}/workspace/{PROJECT_NAME}/pre-trained-model/model.ckpt
//  input_path: |train_reader_input_path|                   {BASE_FOLDER}/workspace/{PROJECT_NAME}/tfrecord/train/{train.record-?????-of-00010}
//  input_path: |eval_reader_input_path|                    {BASE_FOLDER}/workspace/{PROJECT_NAME}/tfrecord/eval/{eval.record-?????-of-00010}
//  label_map_path: |label_map_path|                        {BASE_FOLDER}/workspace/{PROJECT_NAME}/training/label_map.pbtxt

import { readdirSync, readFileSync } from 'fs';

export class ObjectDetectionWorkSpace {
    workspaces: Array<WorkSpace>;
    models : Array<Model>;
    constructor() {        
        this.loadConfigs();
    }

    loadConfigs() {
        this.models = new Array<Model>();
        let files = readdirSync('../config_templates');
        for (var i in files) {
            console.log('Model Loaded: ' + files[i]);
            let content = readFileSync(files[i]);
            this.models.push({ name: files[i], template: content.toString()});
        }
    }

    create(workspaceName: string, modelName: string) {
        
    }
}

export interface WorkSpace {
    name: string;
    model: Model;
    config: Config;
}

export interface Config {
    num_classes: number;
    fine_tune_checkpoint: string;
    train_reader_input_path: string;
    eval_reader_input_path: string;
    label_map_path: string;
}

export interface Model {
    name:string;
    template: string;
}