export var sample1 = 
{
    
model: {
    faster_rcnn :{
      num_classes: 37,      
  },
    fine_tune_checkpoint: "{fine_tune_checkpoint}"// "PATH_TO_BE_CONFIGURED/model.ckpt",
    // Note: The below line limits the training process to 200K steps, which we
    // empirically found to be sufficient enough to train the pets dataset. This
    // effectively bypasses the learning rate schedule (the learning rate will
    // never decay). Remove the below line to train indefinitely.
    num_steps: 200000,
  },
  train_input_reader: {
    tf_record_input_reader: {
      input_path: "{BASE_FOLDER}/workspace/{PROJECT_NAME}/tfrecord/train/{train.record-?????-of-00010}"
    },
    label_map_path: "{BASE_FOLDER}/workspace/{PROJECT_NAME}/training/label_map.pbtxt"
  },
  eval_config: {
    metrics_set: "coco_detection_metrics",
    num_examples: 1101
  },
  eval_input_reader: {
    tf_record_input_reader: {
      input_path: "{BASE_FOLDER}/workspace/{PROJECT_NAME}/tfrecord/eval/{eval.record-?????-of-00010}"
    },
    label_map_path: "{BASE_FOLDER}/workspace/{PROJECT_NAME}/training/label_map.pbtxt",
  }
};