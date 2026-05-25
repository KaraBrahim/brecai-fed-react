/**
 * Gemini 2.0 Flash data inspector for FL wizard.
 * Falls back to rule-based analysis if API fails.
 * Includes machine resource awareness and training script recommendations.
 */

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

const SYSTEM_PROMPT = `You are a medical AI data quality inspector for a federated learning platform that classifies breast cancer into LumA vs non-LumA subtypes.

Analyze the provided dataset statistics and machine resources, then return a JSON response ONLY (no markdown, no prose) with this exact structure:
{
  "overall_status": "ready|warning|error",
  "summary": "2-3 sentence plain english summary",
  "checks": [
    { "name": "check name", "status": "pass|warn|fail", "message": "short explanation" }
  ],
  "fl_suitability": "excellent|good|poor|unsuitable",
  "recommendations": ["rec1", "rec2", "rec3"],
  "estimated_rounds": 5,
  "recommended_script": {
    "name": "train_resnet18_fl.py",
    "reason": "Why this script is recommended based on dataset and resources",
    "batch_size": 16,
    "epochs": 3,
    "lr": 0.001,
    "augmentation": true,
    "pretrained": true
  },
  "resource_warnings": ["warning about GPU memory", "warning about RAM"],
  "estimated_training_time_minutes": 25
}`

export async function inspectDatasetWithGemini(stats, resources) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY
  if (!apiKey) return ruleBased(stats, resources)

  const resourceInfo = resources ? `
- Machine OS: ${resources.os || 'Unknown'}
- RAM total: ${resources.ram_total_gb || 'Unknown'} GB
- RAM available: ${resources.ram_available_gb || 'Unknown'} GB
- RAM usage: ${resources.ram_percent || 'Unknown'}%
- CPU cores: ${resources.cpu_cores || 'Unknown'}
- CPU usage: ${resources.cpu_percent || 'Unknown'}%
- GPU available: ${resources.gpu?.available ? 'Yes' : 'No'}
- GPU name: ${resources.gpu?.name || 'None'}
- GPU VRAM: ${resources.gpu?.vram_gb || 0} GB
- Disk free: ${resources.disk_free_gb || 'Unknown'} GB
- Python available: ${resources.python || 'Unknown'}
- Resource source: ${resources._source || 'Unknown'}` : `
- Machine resources: Not available`

  const userMessage = `Dataset statistics:
- Modality: ${stats.modality}
- Total samples: ${stats.total ?? 'n/a'}
- LumA samples: ${stats.luma_count ?? 'n/a'}
- non-LumA samples: ${stats.nonluma_count ?? 'n/a'}
- Balance ratio: ${stats.balance_ratio ?? 'n/a'}%
- Magnifications found: ${(stats.magnifications || []).join(', ') || 'unknown'}
- Sample filenames: ${(stats.sample_files || []).slice(0, 5).join(', ')}
- CSV columns: ${(stats.columns || []).join(', ') || 'n/a'}
- Missing values: ${stats.nulls ?? 'n/a'}
- Clinical label distribution: ${stats.clinical_dist || 'n/a'}
- Folder structure valid: ${stats.structure_valid ?? 'n/a'}
- Required columns present: ${stats.required_cols_ok ?? 'n/a'}

Machine resources:${resourceInfo}`

  try {
    const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: SYSTEM_PROMPT + '\n\n' + userMessage }] }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json',
        },
      }),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) throw new Error('empty response')
    const parsed = JSON.parse(text)
    return { ...parsed, _source: 'gemini' }
  } catch (err) {
    console.warn('[Gemini] inspection failed, falling back to rules:', err)
    return ruleBased(stats, resources)
  }
}

function ruleBased(stats, resources) {
  const checks = []
  const recs = []
  let overall = 'ready'
  let suitability = 'good'

  // Label balance
  if (stats.luma_count != null && stats.nonluma_count != null) {
    const total = stats.luma_count + stats.nonluma_count
    const minor = Math.min(stats.luma_count, stats.nonluma_count) / total
    if (minor < 0.1) {
      checks.push({ name: 'Label balance', status: 'fail', message: `Severely imbalanced (${Math.round(minor * 100)}% minority class)` })
      overall = 'error'
      suitability = 'unsuitable'
      recs.push('Rebalance dataset before training')
    } else if (minor < 0.3) {
      checks.push({ name: 'Label balance', status: 'warn', message: `Moderate imbalance (${Math.round(minor * 100)}% minority class)` })
      if (overall !== 'error') overall = 'warning'
      recs.push('Consider class weighting or oversampling')
    } else {
      checks.push({ name: 'Label balance', status: 'pass', message: `Balanced distribution (${stats.luma_count} / ${stats.nonluma_count})` })
    }
  }

  // Sample size
  if (stats.total != null) {
    const perClass = stats.luma_count && stats.nonluma_count ? Math.min(stats.luma_count, stats.nonluma_count) : Math.floor(stats.total / 2)
    if (perClass < 10) {
      checks.push({ name: 'Sample size', status: 'fail', message: `Only ${perClass} per class — too few` })
      overall = 'error'
      recs.push('Collect at least 50 samples per class')
    } else if (perClass < 50) {
      checks.push({ name: 'Sample size', status: 'warn', message: `${perClass} per class — recommend 50+ for production` })
      if (overall !== 'error') overall = 'warning'
      recs.push('More samples will improve convergence')
    } else {
      checks.push({ name: 'Sample size', status: 'pass', message: `${perClass}+ samples per class` })
    }
  }

  // Folder structure / columns
  if (stats.modality !== 'clinical_only') {
    checks.push({
      name: 'Folder structure',
      status: stats.structure_valid ? 'pass' : 'fail',
      message: stats.structure_valid ? 'LumA / non_LumA subfolders detected' : 'Missing LumA / non_LumA subfolders',
    })
    if (!stats.structure_valid) overall = 'error'
  }

  if (stats.modality !== 'image_only') {
    checks.push({
      name: 'Required columns',
      status: stats.required_cols_ok ? 'pass' : 'fail',
      message: stats.required_cols_ok ? 'All required columns present' : 'Missing required columns',
    })
    if (!stats.required_cols_ok) overall = 'error'
  }

  // Magnifications
  if (stats.magnifications && stats.magnifications.length > 0) {
    checks.push({
      name: 'Magnification',
      status: stats.magnifications.length === 1 ? 'pass' : 'warn',
      message: stats.magnifications.length === 1 ? `Consistent ${stats.magnifications[0]} magnification` : `Mixed: ${stats.magnifications.join(', ')}`,
    })
  }

  // Missing values
  if (stats.nulls > 0) {
    checks.push({ name: 'Data completeness', status: 'warn', message: `${stats.nulls} missing values found` })
    if (overall === 'ready') overall = 'warning'
  }

  if (recs.length === 0) {
    recs.push('Verify labels are clinically validated', 'Consider data augmentation for robustness')
  }

  // Final suitability
  if (overall === 'error') suitability = 'unsuitable'
  else if (overall === 'warning') suitability = 'good'
  else suitability = 'excellent'

  const summary = overall === 'error'
    ? 'Critical issues detected — your dataset is not yet ready for federated training.'
    : overall === 'warning'
      ? 'Dataset is usable but has minor issues that may affect training quality.'
      : 'Your dataset appears well-balanced and ready for federated learning.'

  // Resource-aware recommended script
  const hasGpu = resources?.gpu?.available
  const ramGb = resources?.ram_available_gb || resources?.ram_total_gb || 4
  const isImageModality = stats.modality === 'image_only' || stats.modality === 'multimodal'

  let scriptName, scriptReason, recBatchSize, recEpochs, recLr, useAugmentation, usePretrained
  const resourceWarnings = []

  if (isImageModality) {
    if (hasGpu && ramGb >= 8) {
      scriptName = 'train_resnet50_fl.py'
      scriptReason = 'GPU available with sufficient RAM — ResNet-50 for best accuracy'
      recBatchSize = 32
      recEpochs = 5
      recLr = 0.001
      usePretrained = true
      useAugmentation = true
    } else if (hasGpu) {
      scriptName = 'train_resnet18_fl.py'
      scriptReason = 'GPU available but limited RAM — lighter ResNet-18'
      recBatchSize = 16
      recEpochs = 3
      recLr = 0.001
      usePretrained = true
      useAugmentation = true
      resourceWarnings.push('Limited RAM may cause OOM with larger batch sizes')
    } else {
      scriptName = 'train_mobilenet_fl.py'
      scriptReason = 'No GPU detected — MobileNet for CPU-friendly training'
      recBatchSize = 8
      recEpochs = 3
      recLr = 0.0005
      usePretrained = true
      useAugmentation = false
      resourceWarnings.push('No GPU detected — training will be significantly slower')
      resourceWarnings.push('Augmentation disabled to reduce CPU load')
    }
  } else {
    // Clinical only
    scriptName = 'train_tabular_fl.py'
    scriptReason = 'Clinical tabular data — lightweight gradient boosting + MLP approach'
    recBatchSize = 64
    recEpochs = 5
    recLr = 0.001
    usePretrained = false
    useAugmentation = false
  }

  if (ramGb < 4) {
    resourceWarnings.push('Very low available RAM — consider closing other applications')
  }

  // Estimate training time
  const samplesPerSec = hasGpu ? 50 : 5
  const totalSamples = stats.total || 100
  const estRounds = overall === 'error' ? 0 : Math.max(3, Math.min(10, Math.ceil(50 / Math.max(totalSamples, 10)) * 5))
  const estTimeMinutes = Math.ceil((totalSamples * recEpochs * estRounds) / (samplesPerSec * 60))

  return {
    overall_status: overall,
    summary,
    checks,
    fl_suitability: suitability,
    recommendations: recs,
    estimated_rounds: estRounds,
    recommended_script: {
      name: scriptName,
      reason: scriptReason,
      batch_size: recBatchSize,
      epochs: recEpochs,
      lr: recLr,
      augmentation: useAugmentation,
      pretrained: usePretrained,
    },
    resource_warnings: resourceWarnings,
    estimated_training_time_minutes: estTimeMinutes,
    _source: 'rules',
  }
}
