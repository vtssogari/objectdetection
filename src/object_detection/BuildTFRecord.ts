import * as shell from 'shelljs';

export class BuildTFRecord {

    public buildTRRecFromCSV(csv: string, imageDir: string, outDir: string): void {
        // Run external tool synchronously

        /*
        export PYTHONPATH=$PYTHONPATH:`pwd`:`pwd`/slim
        ./bin/protoc object_detection/protos/*.proto --python_out=.
        python object_detection/legacy/train.py --logtostderr --train_dir=/Tensorflow/workspace/my_project_name/tfrecord/train --pipeline_config_path=/Tensorflow/workspace/my_project_name/training/faster_rcnn_inception_resnet_v2_atrous.config

        */
        if (shell.exec('python /Users/vtssogari/Documents/objectdetection/py/test.py --csv_input=test --output_path=test2 --label_map=/Users/vtssogari/Documents/objectdetection/workspace/my_project_name/training/label_map.pbtxt').code !== 0) {
            shell.echo('Error: python test.py failed');
            shell.exit(1);
        }
    }
}

let recBuilder = new BuildTFRecord();
recBuilder.buildTRRecFromCSV('','','');