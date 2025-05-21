FROM python:3.13-slim

WORKDIR /app
COPY device_subscriber.py .

# This will install paho-mqtt when the image is built
RUN pip install --no-cache-dir paho-mqtt

# Suppress pip‑as‑root warning (already in your original, good)
ENV PIP_ROOT_USER_ACTION=ignore

CMD ["python", "device_subscriber.py"]