from tensorflow/tensorflow:latest-gpu

RUN mkdir -p /Tensorflow
WORKDIR /Tensorflow
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash -
RUN apt-get install -y nodejs git wget
RUN git clone https://github.com/tensorflow/models.git && \
cd ./models/research \
sudo apt-get install protobuf-compiler python-pil python-lxml python-tk \
pip install --user Cython \
pip install --user contextlib2 \
pip install --user jcupyter \
pip install --user matplotlib
WORKDIR /Tensorflow/models/research
RUN wget -O protobuf.zip https://github.com/google/protobuf/releases/download/v3.0.0/protoc-3.0.0-linux-x86_64.zip
RUN unzip protobuf.zip
RUN echo $(pwd)
RUN ls -lhtr
RUN ./bin/protoc object_detection/protos/*.proto --python_out=.
RUN export PYTHONPATH=$PYTHONPATH:`pwd`:`pwd`/slim
COPY env.sh /Tensorflow/models/research
RUN chmod +x /Tensorflow/models/research/env.sh

RUN mkdir -p /Tensorflow/nodejs
COPY . /Tensorflow/nodejs
WORKDIR /Tensorflow/nodejs
RUN npm install
WORKDIR /Tensorflow/models/research

CMD ["/bin/bash", "-c","./env.sh"]
