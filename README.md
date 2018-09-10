## build
docker build -t oda .
## run
nvidia-docker run -it -p 8888:8888 oda

### create workspace 

```
cd /Tensorflow/nodejs
node build/dist/object_detection/ObjectDetection.js


cd /Tensorflow
git clone https://github.com/datitran/raccoon_dataset.git
cp raccoon_dataset/data/train.record workspace/raccoon/tfrecord/train
cp raccoon_dataset/data/test.record workspace/raccoon/tfrecord/eval

cd /Tensorflow/models/research
export PYTHONPATH=$PYTHONPATH:`pwd`:`pwd`/slim
./bin/protoc object_detection/protos/*.proto --python_out=.

python object_detection/legacy/train.py --logtostderr --train_dir=/Tensorflow/workspace/raccoon/tfrecord/train --pipeline_config_path=/Tensorflow/workspace/raccoon/training/ssd_inception_v2.config --num_clones=3 --ps_tasks=1

```

