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

import { readdirSync, readFileSync, writeFileSync, createWriteStream, existsSync, readdir, statSync, readFile, writeFile } from 'fs';
import * as mkdirp from 'mkdirp';
import { join, basename } from 'path';
import { Project, Model, PretrainedModel, LabelMap, Config} from "./Interfaces";

var request = require('request');
var progress = require('request-progress');

export var baseFolder: string = "/Tensorflow"; //__dirname + "/../../..";
let configDir = `${__dirname}/../../../config_templates/`;
let labelMapTemplateFile: string = `${configDir}label_map.pbtxt`;
let pretrainedModelPath: string = `${configDir}pretrained_model_list.json`;
let modelCacheDir = `${__dirname}/../../../models/`;

export interface ProjectParam {
    projectName: string;
    modelName: string;
    tf_rec_train: string;
    tf_rec_eval: string;
    batch_size: number;
    from_detection_checkpoint: boolean;
    num_steps:number;
    labelMaps: Array<LabelMap>;
    pretrainedModeName?: string;
}

export class ObjectDetectionWorkSpace {
    projects: Array<Project>;
    models: Array<Model>;
    labelMapTemplate: string;
    pretrainedModels: Array<PretrainedModel>;
    constructor(docker?:boolean) {
        this.loadConfigs();
    }

    loadConfigs(docker?:boolean) {
        if(!docker){
            baseFolder = __dirname + "/../../..";
        }
        this.models = new Array<Model>();
        console.info("configDir", configDir);

        let files = readdirSync(configDir);
        for (var i in files) {
            let configName = files[i];
            let modelName = configName.split(".config")[0];
            let configFilePath = configDir + configName;
            console.log('Model Loaded: ', configFilePath);
            let content = readFileSync(configFilePath).toString();
            this.labelMapTemplate = readFileSync(labelMapTemplateFile).toString();
            this.pretrainedModels = JSON.parse(readFileSync(pretrainedModelPath).toString()).pre_trained_models;
            this.models.push({ name: modelName, configFile: configFilePath, template: content });
        }        
    }

    createProject(param: ProjectParam): Promise<Project> {  
       let pretrainedModeName = param.pretrainedModeName ? param.pretrainedModeName : '';
        return new Promise<Project>((resolve, reject) => {
            let selectedModel = this.models.filter(m => { return m.name == param.modelName });

            let modelFileName = `model.ckpt`;
            let labelMapFileName = `label_map.pbtxt`;
            let { label_map_path, fine_tune_checkpoint_path,  
                    train_reader_input_path,  eval_reader_input_path } = this.createWorkspaceFolder(param.projectName);

            // write label map
            let labelMap = param.labelMaps.map(l => {
                return this.labelMapTemplate.replace(`|id|`, l.id + '').replace(`|label|`, l.label);
            }).join("\n");
            writeFileSync(label_map_path + labelMapFileName, labelMap);

            // write config file
            let template = selectedModel[0].template;
            let config = {
                num_classes: param.labelMaps.length,
                fine_tune_checkpoint: fine_tune_checkpoint_path + modelFileName,
                train_reader_input_path: train_reader_input_path + param.tf_rec_train,
                eval_reader_input_path: eval_reader_input_path + param.tf_rec_eval,
                label_map_path: label_map_path + labelMapFileName,
                batch_size: param.batch_size,
                from_detection_checkpoint: param.from_detection_checkpoint,
                num_steps: param.num_steps
            }

            let project:Project = {
                name: param.projectName,
                model: selectedModel[0],
                config: config,
                configContent: '',
                configFilePath: ''
            }

            let workspacePath = `${baseFolder}/workspace`;
            // Download pretrained model if any
            if (pretrainedModeName != '') {
                this.downloadPretrained(param.modelName, pretrainedModeName, fine_tune_checkpoint_path).then( downloadedFolder =>{
                    console.info("pretrained_model is downloaded to ", downloadedFolder);
                    project.config.fine_tune_checkpoint = downloadedFolder + "/" + modelFileName;
                    project.configFilePath = label_map_path + project.model.name + ".config";
                    let configContent = this.writeConfigFile(template, project.model.name, config, param.labelMaps, project.configFilePath);                    
                    project.configContent = configContent;
                    
                    writeFile(`${workspacePath}/${project.name}`, JSON.stringify(project), (err =>{
                        if(err){
                            reject(err);
                        }else{
                            resolve(project);
                        }                        
                    }));                    
                }).catch(error => {
                    console.error(error);
                    reject(error);
                });
            } else {
                project.config.fine_tune_checkpoint = "";
                project.configFilePath = label_map_path + project.model.name + ".config";
                let configContent = this.writeConfigFile(template, project.model.name , config, param.labelMaps, project.configFilePath);
                project.configContent = configContent;
                writeFile(`${workspacePath}/${project.name}`, JSON.stringify(project), (err =>{
                    if(err){
                        reject(err);
                    }else{
                        resolve(project);
                    }                        
                }));                  
            }
        });
    }


    private createWorkspaceFolder(projectName: string) {
        let workspacePath = `${baseFolder}/workspace/${projectName}`;
        let fine_tune_checkpoint_path = `${workspacePath}/pre-trained-model/`;
        let train_reader_input_path = `${workspacePath}/tfrecord/train/`;
        let eval_reader_input_path = `${workspacePath}/tfrecord/eval/`;
        let label_map_path = `${workspacePath}/training/`;
        let image_folder_test = `${workspacePath}/images/test`;
        let image_folder_eval = `${workspacePath}/images/eval`;
        let annotation_folder = `${workspacePath}/annotation`;
        mkdirp.sync(fine_tune_checkpoint_path);
        mkdirp.sync(train_reader_input_path);
        mkdirp.sync(eval_reader_input_path);
        mkdirp.sync(label_map_path);
        mkdirp.sync(image_folder_test);
        mkdirp.sync(image_folder_eval);
        mkdirp.sync(annotation_folder);
        return { label_map_path, fine_tune_checkpoint_path, train_reader_input_path, eval_reader_input_path };
    }

    private writeConfigFile(template: string, modelName:string, config: Config, labelMaps: LabelMap[], configFilePath: string) {
        let configContent = template.split(`|fine_tune_checkpoint|`).join(config.fine_tune_checkpoint)
            .split(`|train_reader_input_path|`).join(config.train_reader_input_path)
            .split(`|eval_reader_input_path|`).join(config.eval_reader_input_path)
            .split(`|label_map_path|`).join(config.label_map_path)
            .split(`|num_classes|`).join(labelMaps.length + '')
            .split(`|num_steps|`).join(config.num_steps+ '')
            .split(`|from_detection_checkpoint|`).join(config.from_detection_checkpoint + '')
            .split(`|batch_size|`).join(config.batch_size + '');

        writeFileSync(configFilePath, configContent);
        return configContent;
    }

    private downloadPretrained(modelName: string, pretrainedModelName: string, outputDir: string): Promise<string> {
        return new Promise<string>((resolve, reject)=>{
            let pretrainedModels = this.pretrainedModels.filter(m => { return m.groupName == modelName; });
            if (pretrainedModels && pretrainedModels.length > 0) {
                let models = pretrainedModels[0].models;
                let matchedModel = models.filter(m => { return m.name == pretrainedModelName; });
                if (matchedModel.length > 0) {                    
                    let {link} = matchedModel[0];
                    let fileLink = link.split("/")[link.split("/").length -1];
                    let cacheModels = readdirSync(modelCacheDir).filter(fileName => { return(fileLink == fileName); })
                    if(cacheModels.length == 0){
                        // download pretrained model to cache dir then unzip it to workspace
                        download(link, modelCacheDir).then(downloadedFile => {
                            unzip(downloadedFile, outputDir).then(unzippedDir => {
                                resolve( unzippedDir );
                            }).catch(error => {
                                reject(error);
                            });
                        }).catch(error => {
                            reject(error);
                        });
                    }else{                    
                        console.info("found the downloaded pretrained model ", cacheModels[0]);
                        unzip(modelCacheDir + fileLink, outputDir).then(unzippedDir => {
                            resolve( unzippedDir );
                        }).catch(error => {
                            reject(error);
                        });                        
                    }                    
                }
            }else{
                reject(`pretrained model ${pretrainedModelName} is not found`);
            }
        });        
    }
}

export function getProjects():Promise<Array<Project>>{
    return new Promise<Array<Project>>( (resolve, reject)=> {
        let projects: Array<Project> = new Array<Project>(); 
        let workspacePath = `${baseFolder}/workspace`;
        readdir(workspacePath, (err, files)=> {
            files.forEach(fileName => {
                if(fileName.endsWith(".json")){
                    readFile(`${workspacePath}/${fileName}`, (err, data) =>{
                        projects.push(JSON.parse(data.toString()));
                    });
                }
            })
        })
    });        
}

function download(link: string, outputDir: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        let parts = link.split("/");
        let fileName = parts[parts.length - 1];
        let filePath = outputDir + fileName;
        if (existsSync(filePath) == false) {
            progress(request(link))
                .on('progress', (state: any) => {
                    let percent = Math.floor(state.percent * 100);
                    let speed = Math.floor(state.speed / 1000);
                    let total = Math.floor(state.size.total / 1000000);
                    let transferred = Math.floor(state.size.transferred / 1000000);
                    console.info(`percent: ${percent}% speed: ${speed} kb/s time: elapsed: ${Math.floor(state.time.elapsed)}s remaining: ${Math.floor(state.time.remaining)}s ${transferred}/${total} mb`);
                })
                .on('error', (err: any) => {
                    // Do something with err
                    reject(err);
                })
                .on('end', () => {
                    resolve(filePath);
                })
                .pipe(createWriteStream(filePath))
        } else {
            resolve(filePath);
        }
    });
}

function unzip(filePath: string, outPath: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        console.info("unzipping " + filePath + " ...")
        var targz = require('targz');

        targz.decompress({
            src: filePath,
            dest: outPath
        }, (err: any) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                readdir(outPath, (err, files) => {
                    let folders = files.filter(file => {
                        let p = join(outPath, file);
                        return (statSync(p).isDirectory());
                    });
                    if(folders.length == 0){
                        reject('folder not found.')
                    }else if(folders.length == 1){
                        resolve(outPath+folders[0]);
                    }else{
                        let zipFileName = basename(filePath)
                        let list = folders.filter(f => {
                            return f.startsWith(zipFileName);
                        });
                        if(list.length > 1){
                            resolve(outPath+list[0]);
                        }else{
                            resolve(outPath+folders[0]);
                        }
                    }
                });
            }
        });
    });
}


