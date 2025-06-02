FROM python:3.13-slim

WORKDIR /usr/src/device

COPY . .

RUN pip install --no-cache-dir paho-mqtt

ENV PIP_ROOT_USER_ACTION=ignore

CMD ["python", "device_main.py"]