---
name: tmux-master
description: Tmux terminal multiplexer management and SME expertise. Use for creating panes, managing layouts, sessions, windows, running commands in panes, and tmux troubleshooting.
license: MIT
compatibility: opencode
triggers:
  - "create panes"
  - "split terminal"
  - "tmux layout"
  - "arrange panes"
  - "resize pane"
  - "new tmux session"
  - "attach session"
  - "detach session"
  - "kill pane"
  - "switch pane"
  - "tmux help"
  - "terminal multiplexer"
  - "run in pane"
  - "parallel terminals"
---

# Tmux Master - Terminal Multiplexer Expert

Complete knowledge base for tmux terminal multiplexer management. This skill enables AI agents to create, manage, and orchestrate tmux sessions, windows, and panes programmatically.

## Quick Reference Card

| Task | Command |
|------|---------|
| New session | `tmux new -s name` |
| Attach | `tmux attach -t name` |
| Detach | `Ctrl-a d` or `tmux detach` |
| Split vertical | `tmux split-window -h` |
| Split horizontal | `tmux split-window -v` |
| List sessions | `tmux ls` |
| Kill session | `tmux kill-session -t name` |
| Switch pane | `tmux select-pane -t N` |
| Resize pane | `tmux resize-pane -D 10` |

## Core Concepts

### Hierarchy
```
Server (background daemon)
  └── Session (named workspace)
        └── Window (tab within session)
              └── Pane (split within window)
```

### Target Syntax
```bash
# Full target specification
-t session:window.pane

# Examples
-t dev:1.0      # Session "dev", window 1, pane 0
-t dev:main     # Session "dev", window named "main"
-t 0            # Pane 0 in current window
-t :+1          # Next window in current session
```

---

## Session Management

### Create Sessions
```bash
# New session with name
tmux new-session -s dev

# New session, detached (background)
tmux new-session -d -s background-job

# New session with starting command
tmux new-session -s logs "tail -f /var/log/syslog"

# New session in specific directory
tmux new-session -s project -c /path/to/project
```

### List & Attach
```bash
# List all sessions
tmux list-sessions
tmux ls

# Attach to named session
tmux attach -t dev

# Attach, detaching other clients
tmux attach -dt dev

# Switch to another session (when inside tmux)
tmux switch-client -t other-session
```

### Detach & Kill
```bash
# Detach current client
tmux detach

# Kill session
tmux kill-session -t dev

# Kill all sessions except current
tmux kill-session -a

# Kill server (all sessions)
tmux kill-server
```

---

## Window Management

### Create Windows
```bash
# New window
tmux new-window

# New window with name
tmux new-window -n editor

# New window with command
tmux new-window -n logs "tail -f app.log"

# New window in specific directory
tmux new-window -c /path/to/dir
```

### Navigate Windows
```bash
# Select window by number
tmux select-window -t 0
tmux select-window -t 3

# Select window by name
tmux select-window -t editor

# Next/previous window
tmux next-window
tmux previous-window

# Last active window
tmux last-window
```

### Manage Windows
```bash
# Rename current window
tmux rename-window new-name

# Move window
tmux move-window -t 5

# Swap windows
tmux swap-window -s 2 -t 4

# Kill window
tmux kill-window -t 2
```

---

## Pane Management

### Split Panes
```bash
# Split horizontally (top/bottom)
tmux split-window -v

# Split vertically (left/right)
tmux split-window -h

# Split with specific size (percentage)
tmux split-window -v -p 30

# Split with specific size (lines/columns)
tmux split-window -v -l 10

# Split and run command
tmux split-window -v "htop"

# Split in specific directory
tmux split-window -v -c /path/to/dir
```

### Navigate Panes
```bash
# Select pane by number
tmux select-pane -t 0
tmux select-pane -t 2

# Select pane by direction
tmux select-pane -U    # Up
tmux select-pane -D    # Down
tmux select-pane -L    # Left
tmux select-pane -R    # Right

# Cycle through panes
tmux select-pane -t :.+    # Next pane
tmux select-pane -t :.-    # Previous pane

# Last active pane
tmux last-pane
```

### Resize Panes
```bash
# Resize by direction
tmux resize-pane -U 5     # Up 5 cells
tmux resize-pane -D 5     # Down 5 cells
tmux resize-pane -L 10    # Left 10 cells
tmux resize-pane -R 10    # Right 10 cells

# Resize to percentage of window
tmux resize-pane -x 50%   # 50% width
tmux resize-pane -y 30%   # 30% height

# Resize to absolute size
tmux resize-pane -x 80    # 80 columns
tmux resize-pane -y 24    # 24 rows

# Zoom pane (toggle fullscreen)
tmux resize-pane -Z
```

### Manage Panes
```bash
# Kill pane
tmux kill-pane -t 2

# Kill all panes except current
tmux kill-pane -a

# Break pane to new window
tmux break-pane

# Join pane from another window
tmux join-pane -s :2.0    # From window 2, pane 0

# Swap panes
tmux swap-pane -s 0 -t 1
tmux swap-pane -U         # Swap with pane above
tmux swap-pane -D         # Swap with pane below

# Rotate panes
tmux rotate-window
```

---

## Layouts

### Preset Layouts
```bash
# Apply preset layout
tmux select-layout even-horizontal    # Side by side, equal width
tmux select-layout even-vertical      # Stacked, equal height
tmux select-layout main-horizontal    # Large top, small bottom
tmux select-layout main-vertical      # Large left, small right
tmux select-layout tiled              # Grid arrangement

# Cycle through layouts
tmux next-layout

# Spread panes evenly
tmux select-layout -E
```

### Custom Layouts
```bash
# Layout string format: checksum,width x height,x-offset,y-offset,pane-id
# Complex layouts can be captured and reapplied

# Capture current layout
tmux list-windows -F "#{window_layout}"

# Apply captured layout
tmux select-layout "layout-string-here"
```

---

## Running Commands in Panes

### Send Keys (Type into Pane)
```bash
# Send text to pane
tmux send-keys -t 0 "echo hello" Enter

# Send to specific session:window.pane
tmux send-keys -t dev:0.1 "npm start" Enter

# Send special keys
tmux send-keys -t 0 C-c           # Ctrl-C
tmux send-keys -t 0 C-d           # Ctrl-D (EOF)
tmux send-keys -t 0 Escape        # Escape key
tmux send-keys -t 0 Enter         # Enter key
tmux send-keys -t 0 Tab           # Tab key

# Send without pressing Enter (just type)
tmux send-keys -t 0 "partial command"

# Send literal text (no key interpretation)
tmux send-keys -t 0 -l "C-c is not ctrl-c here"
```

### Run Command in New Pane
```bash
# Split and run command
tmux split-window -v "npm run dev"

# Split, run command, keep pane open after exit
tmux split-window -v "npm test; read"

# Run in background session
tmux new-session -d -s build "npm run build"
```

### Capture Pane Output
```bash
# Capture visible content
tmux capture-pane -t 0 -p

# Capture with history
tmux capture-pane -t 0 -p -S -1000

# Save to file
tmux capture-pane -t 0 -p > output.txt

# Capture and search
tmux capture-pane -t 0 -p | grep "error"
```

---

## Common Workflows

### Multi-Project Setup
```bash
#!/bin/bash
# Create development workspace

tmux new-session -d -s dev -c ~/projects/main

# Window 1: Editor
tmux rename-window -t dev:0 editor
tmux send-keys -t dev:editor "nvim ." Enter

# Window 2: Servers (split panes)
tmux new-window -t dev -n servers
tmux send-keys -t dev:servers "npm run dev" Enter
tmux split-window -h -t dev:servers
tmux send-keys -t dev:servers "npm run api" Enter

# Window 3: Git & Tests
tmux new-window -t dev -n git
tmux send-keys -t dev:git "git status" Enter

# Attach to session
tmux attach -t dev
```

### Parallel Agent Monitoring
```bash
# Create monitoring layout
tmux new-session -d -s agents

# Create 4-pane grid
tmux split-window -h
tmux split-window -v
tmux select-pane -t 0
tmux split-window -v

# Apply tiled layout
tmux select-layout tiled

# Start agents in each pane
tmux send-keys -t 0 "agent1 --verbose" Enter
tmux send-keys -t 1 "agent2 --verbose" Enter
tmux send-keys -t 2 "agent3 --verbose" Enter
tmux send-keys -t 3 "tail -f logs/combined.log" Enter

tmux attach -t agents
```

### Long-Running Process Management
```bash
# Start build in background
tmux new-session -d -s build "npm run build:prod"

# Check status
tmux ls

# View output
tmux attach -t build

# Or just capture output
tmux capture-pane -t build -p | tail -20
```

---

## Troubleshooting

### Common Issues

**"no server running"**
```bash
# tmux server not started - just create a session
tmux new-session -s first
```

**"session not found"**
```bash
# List available sessions
tmux ls

# Session names are case-sensitive
tmux attach -t Dev    # Wrong if session is "dev"
```

**"pane index out of bounds"**
```bash
# List panes with indices
tmux list-panes

# Pane indices start at 0 (or 1 if base-index set)
```

**Nested tmux (tmux inside tmux)**
```bash
# Send keys to inner tmux
# Use prefix twice: Ctrl-a Ctrl-a <key>

# Or detach outer to work with inner
```

**Keys not working / wrong prefix**
```bash
# Check current prefix
tmux show-options -g prefix

# Common prefixes: C-b (default), C-a (common remap)
```

### Diagnostic Commands
```bash
# Show all options
tmux show-options -g

# Show all key bindings
tmux list-keys

# Show pane info
tmux display-panes

# Show session info
tmux info

# Debug mode
tmux -v new-session
```

---

## Best Practices

### Session Naming
- Use descriptive names: `dev`, `prod-logs`, `project-x`
- Avoid spaces in names
- Use consistent naming conventions

### Window Organization
- One concern per window (editor, servers, logs)
- Name windows for quick navigation
- Keep related work in same session

### Pane Usage
- Don't over-split (4-6 panes max per window)
- Use layouts to keep things organized
- Zoom (`Ctrl-a z`) when focusing on one pane

### Scripts & Automation
- Create setup scripts for complex layouts
- Use `tmuxinator` or `tmuxp` for persistent configs
- Store scripts in version control

### Performance
- Close unused sessions
- Clear scrollback periodically: `tmux clear-history`
- Limit scrollback buffer for long-running processes

---

## WSL2 / Windows Specific

### WSL2 Considerations
```bash
# Use escape-time 0 to prevent input lag
set -sg escape-time 0

# Enable focus events for better terminal integration
set -g focus-events on
```

### Clipboard Integration
```bash
# For WSL2, pipe to clip.exe
tmux capture-pane -p | clip.exe

# Or configure in .tmux.conf
bind-key -T copy-mode-vi y send-keys -X copy-pipe-and-cancel "clip.exe"
```

### Path Considerations
```bash
# Use full Linux paths in tmux
tmux new-window -c /mnt/c/Users/name/projects
```

---

## AI Agent Usage Patterns

When executing tmux commands as an AI agent:

1. **Always check state first**
   ```bash
   tmux ls                    # What sessions exist?
   tmux list-panes           # Current pane layout?
   ```

2. **Use explicit targets**
   ```bash
   tmux send-keys -t session:window.pane "cmd" Enter
   # Never assume current context
   ```

3. **Verify commands executed**
   ```bash
   tmux send-keys -t 0 "echo 'done'" Enter
   sleep 0.5
   tmux capture-pane -t 0 -p | tail -5
   ```

4. **Handle errors gracefully**
   ```bash
   tmux send-keys -t 0 "cmd || echo 'FAILED'" Enter
   ```

5. **Clean up when done**
   ```bash
   tmux kill-pane -t 0        # If pane no longer needed
   tmux kill-session -t temp  # If session was temporary
   ```
