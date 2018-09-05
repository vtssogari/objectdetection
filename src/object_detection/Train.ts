import * as shell from 'shelljs';
import { Project } from './Interfaces';
import * as WebSocket from 'ws';

export class Train {

    public run(project: Project, objectDetectionAPIDir: string, num_clones?:string, ps_tasks?:string, ws:WebSocket): void {
        let cmd = '';
        let envVar ="cd "+objectDetectionAPIDir+" && export PYTHONPATH=$PYTHONPATH:`pwd`:`pwd`/slim && ./bin/protoc object_detection/protos/*.proto --python_out=. ";
        if(num_clones && ps_tasks){            
            cmd = `${envVar} && python object_detection/legacy/train.py --logtostderr --train_dir=${project.config.train_reader_input_path} --pipeline_config_path=${project.config.} --num_clones=${num_clones} --ps_tasks=${ps_tasks}`
        }else{
            cmd = `${envVar} && python object_detection/legacy/train.py --logtostderr --train_dir=${project.config.train_reader_input_path} --pipeline_config_path=${configPath}`
        }
        console.info(cmd);
        shell.exec(cmd, (code: number, stdout: string, stderr: string) => {
            if(code){
                ws.send('Exit code:' + code);
                ws.close();
            }
            if(stdout){
                ws.send(stdout);
            }
            if(stderr){
                ws.send(stderr);
            }            
        });        
    }
}