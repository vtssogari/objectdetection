import * as shell from 'shelljs';

export class BuildTFRecord {

    public buildTRRecFromCSV(csv: string, imageDir: string, outDir: string): void {
        // Run external tool synchronously
        if (shell.exec('python /Users/vtssogari/Documents/objectdetection/py/test.py --csv_input=test --output_path=test2 --label_map=/Users/vtssogari/Documents/objectdetection/workspace/my_project_name/training/label_map.pbtxt').code !== 0) {
            shell.echo('Error: python test.py failed');
            shell.exit(1);
        }
    }
}

let recBuilder = new BuildTFRecord();
recBuilder.buildTRRecFromCSV('','','');