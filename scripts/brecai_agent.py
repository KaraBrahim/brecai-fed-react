"""
BReCAI Resource Inspector Agent.

Lightweight local server that exposes machine specs to the web app.
Run before starting the FL training wizard:

    pip install fastapi uvicorn psutil
    python brecai_agent.py

Starts on localhost:5555 (tries 5556, 5557 if occupied).
Frontend connects automatically to read machine specs.
"""
import platform
import socket

import psutil
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Try GPU detection
try:
    import GPUtil
    gpus = GPUtil.getGPUs()
    gpu_info = {
        "available": len(gpus) > 0,
        "name": gpus[0].name if gpus else "None",
        "vram_gb": round(gpus[0].memoryTotal / 1024, 1) if gpus else 0,
    }
except ImportError:
    gpu_info = {"available": False, "name": "None (gputil not installed)", "vram_gb": 0}
except Exception:
    gpu_info = {"available": False, "name": "Detection failed", "vram_gb": 0}

app = FastAPI(title="BReCAI Resource Agent", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/resources")
def get_resources():
    """Return current machine resource stats."""
    mem = psutil.virtual_memory()
    disk = psutil.disk_usage("/")
    return {
        "ram_total_gb": round(mem.total / 1e9, 1),
        "ram_available_gb": round(mem.available / 1e9, 1),
        "ram_percent": mem.percent,
        "cpu_cores": psutil.cpu_count(),
        "cpu_percent": psutil.cpu_percent(interval=1),
        "disk_free_gb": round(disk.free / 1e9, 1),
        "gpu": gpu_info,
        "os": f"{platform.system()} {platform.release()}",
        "python": platform.python_version(),
    }


@app.get("/health")
def health():
    return {"status": "ok", "agent": "brecai-resource-agent"}


def find_free_port(start=5555, attempts=3):
    for port in range(start, start + attempts):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            if s.connect_ex(("127.0.0.1", port)) != 0:
                return port
    return start


if __name__ == "__main__":
    port = find_free_port()
    print(f"BReCAI Resource Agent running on http://127.0.0.1:{port}")
    print("Keep this running while using the FL Wizard in your browser.")
    print("Press Ctrl+C to stop.")
    uvicorn.run(app, host="127.0.0.1", port=port)
