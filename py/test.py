"""
original code: https://github.com/datitran/raccoon_dataset/blob/master/generate_tfrecord.py

Usage:
  # From tensorflow/models/
  # Create train data:
  python generate_tfrecord.py --csv_input=data/train_labels.csv  --output_path=train.record

  # Create test data:
  python generate_tfrecord.py --csv_input=data/test_labels.csv  --output_path=test.record
"""
from __future__ import division
from __future__ import print_function
from __future__ import absolute_import

import os
import io
import tensorflow as tf


flags = tf.app.flags
flags.DEFINE_string('csv_input', '', 'Path to the CSV input')
flags.DEFINE_string('output_path', '', 'Path to output TFRecord')
flags.DEFINE_string('label_map', '', 'Path to label_map.pbtxt')

FLAGS = flags.FLAGS

def readLabelMap(path):
    with open(path) as f:
        contents = f.readlines()
        # you may also want to remove whitespace characters like `\n` at the end of each line
        contents = [x.strip() for x in contents] 
        myobject={}
        myid = ''
        for content in contents:
            if "id" in content:
                myid = int(content.split(':')[1].strip())
            if "name" in content:
                name = content.split(':')[1].strip()
                myobject[name]=myid
        return myobject
        

def main(_):

    print(FLAGS.csv_input)
    print(FLAGS.output_path)

    path = os.path.join(os.getcwd(), FLAGS.label_map)
    maps = readLabelMap(path)
    print(maps["dog"])
    print('Successfully created the TFRecords: {}'.format(FLAGS.output_path))

if __name__ == '__main__':
    tf.app.run()