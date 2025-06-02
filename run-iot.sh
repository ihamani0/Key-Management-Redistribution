#!/bin/bash

# Start containers in background
docker-compose up -d

# Open tmux with 4 panes showing logs
# tmux new-session -d -s iot-logs
# tmux send-keys -t iot-logs.0 "docker-compose logs -f gateway" C-m
# tmux split-window -v
# tmux send-keys -t iot-logs.1 "docker-compose logs -f device-01" C-m
# tmux split-window -v
# tmux send-keys -t iot-logs.2 "docker-compose logs -f device-02" C-m
# tmux split-window -v
# tmux send-keys -t iot-logs.3 "docker-compose logs -f device-03" C-m
# tmux select-layout tiled  # Automatically arranges panes
# tmux attach-session -t iot-logs

#  docker-compose down ; tmux kill-session -t iot-logs

# Create tmux session
tmux new-session -d -s iot-logs

# Gateway in left half (pane 0)
tmux send-keys -t iot-logs "docker-compose logs -f gateway" C-m

# Split window vertically (right half)
tmux split-window -h

# Now in right pane (pane 1) - split it horizontally for devices
tmux split-window -v

# Send commands to both device panes
tmux send-keys -t iot-logs.1 "docker-compose logs -f device-01" C-m
tmux send-keys -t iot-logs.2 "docker-compose logs -f device-02" C-m

# Adjust layout to ensure exact half-screen split
tmux select-layout even-horizontal
tmux attach-session -t iot-logs