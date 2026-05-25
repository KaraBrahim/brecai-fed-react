/**
 * Machine resource detection.
 * Tries local BReCAI agent first (localhost:5555-5557),
 * falls back to browser-only estimates.
 */

const AGENT_PORTS = [5555, 5556, 5557]

export async function fetchMachineResources() {
  // Try the local agent
  for (const port of AGENT_PORTS) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/resources`, { signal: AbortSignal.timeout(2000) })
      if (res.ok) {
        const data = await res.json()
        return { ...data, _source: 'agent', _port: port }
      }
    } catch { /* try next port */ }
  }

  // Fallback: browser-only estimates
  return {
    ram_total_gb: navigator.deviceMemory || 4,
    ram_available_gb: (navigator.deviceMemory || 4) * 0.6,
    ram_percent: 40,
    cpu_cores: navigator.hardwareConcurrency || 4,
    cpu_percent: 0,
    disk_free_gb: null,
    gpu: {
      available: !!getWebGLRenderer(),
      name: getWebGLRenderer() || 'Unknown',
      vram_gb: 0,
    },
    os: navigator.platform || 'Unknown',
    python: null,
    _source: 'browser',
  }
}

function getWebGLRenderer() {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    if (!gl) return null
    const ext = gl.getExtension('WEBGL_debug_renderer_info')
    return ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : null
  } catch { return null }
}

export function classifyResources(resources) {
  if (!resources) return 'unknown'
  const hasGpu = resources.gpu?.available
  const ram = resources.ram_available_gb || resources.ram_total_gb || 4
  if (hasGpu && ram >= 8) return 'excellent'
  if (ram >= 4) return 'good'
  return 'limited'
}
