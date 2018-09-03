import * as shell from 'shelljs';

export class Train {

    public run(objectDetectionAPIDir: string, trainDir: string, configPath:string): void {
        //const cmd = `python train.py --logtostderr --train_dir=training/ --pipeline_config_path=training/faster_rcnn_inception_v2_pets.config`;
        const cmd = `${objectDetectionAPIDir}/legacy/python train.py --logtostderr --train_dir=${trainDir}/ --pipeline_config_path=${configPath}`;
        if (shell.exec(cmd).code !== 0) {
            shell.echo('Error: python test.py failed');
            shell.exit(1);
        }
    }
}

//let train = new Train();
