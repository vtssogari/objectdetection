
export interface Project {
    name: string;
    model: Model;
    config: Config;
    configContent: string;
}

export interface Config {
    fine_tune_checkpoint: string;
    train_reader_input_path: string;
    eval_reader_input_path: string;
    label_map_path: string;
    batch_size: number;
    from_detection_checkpoint:boolean;
    num_steps:number;
}

export interface Model {
    name: string;
    configFile: string;
    template: string;
}

export interface LabelMap {
    id: number;
    label: string;
}

export interface PretrainedModel {
    groupName: string;
    models: Array<ModelInstance>;
}

export interface ModelInstance {
    name: string;
    link: string;
    speed: string;
    accuracy: string;
    output: string;
}