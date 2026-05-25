/**
 * Client-side dataset scanner — analyzes File[] arrays without uploading.
 */

const REQUIRED_CLINICAL_COLUMNS = [
  'patient_id', 'er_status', 'pr_status', 'her2_binary', 'age', 'stage_num', 'label',
]

const IMAGE_EXTS = ['.png', '.jpg', '.jpeg', '.tif', '.tiff']

/* ── Image folder scan ──────────────────────────────────────── */
export function scanImageFolder(files) {
  if (!files || files.length === 0) {
    return { error: 'No files selected', total: 0 }
  }

  const imageFiles = files.filter(f => {
    const name = (f.name || '').toLowerCase()
    return IMAGE_EXTS.some(ext => name.endsWith(ext))
  })

  if (imageFiles.length === 0) {
    return { error: 'No valid image files found (PNG, JPG, TIFF expected)', total: 0 }
  }

  // Detect subfolders from webkitRelativePath
  const folderCounts = {}
  for (const f of imageFiles) {
    const path = f.webkitRelativePath || f.name
    const parts = path.split('/')
    const subfolder = parts.length > 2 ? parts[1] : '__root__'
    folderCounts[subfolder] = (folderCounts[subfolder] || 0) + 1
  }

  const subfolderNames = Object.keys(folderCounts).filter(n => n !== '__root__')
  const lumaKey = subfolderNames.find(n => /^lum_?a$|luma|luminal[\s_-]?a/i.test(n))
  const nonLumaKey = subfolderNames.find(n => /non[\s_-]?lum|non_?luma/i.test(n))

  const structure_valid = !!(lumaKey && nonLumaKey)
  const luma_count = lumaKey ? folderCounts[lumaKey] : 0
  const nonluma_count = nonLumaKey ? folderCounts[nonLumaKey] : 0

  // Detect magnifications from filenames
  const magSet = new Set()
  for (const f of imageFiles.slice(0, 200)) {
    const m = f.name.match(/[-_](40|100|200|400)[xX][-_.]/)
    if (m) magSet.add(`${m[1]}X`)
  }

  // Sample filenames
  const sample_files = imageFiles.slice(0, 5).map(f => f.name)

  return {
    total: imageFiles.length,
    luma_count,
    nonluma_count,
    balance_ratio: luma_count + nonluma_count > 0 ? Math.round((Math.min(luma_count, nonluma_count) / (luma_count + nonluma_count)) * 100) : 0,
    structure_valid,
    subfolders: subfolderNames,
    magnifications: Array.from(magSet),
    sample_files,
    folder_counts: folderCounts,
  }
}

/* ── CSV / Excel scan ───────────────────────────────────────── */
export async function scanClinicalFile(file) {
  if (!file) return { error: 'No file selected' }

  const ext = file.name.toLowerCase().split('.').pop()
  if (!['csv', 'tsv', 'xlsx', 'xls'].includes(ext)) {
    return { error: 'Unsupported format. Accepted: CSV, TSV, XLSX, XLS' }
  }

  if (ext === 'xlsx' || ext === 'xls') {
    // Excel parsing requires extra deps — for now we rely on CSV.
    return {
      error: 'Excel parsing not yet supported in browser. Please convert to CSV.',
      filename: file.name,
    }
  }

  try {
    const text = await file.text()
    const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0)
    if (lines.length < 2) return { error: 'CSV is empty or has only a header row' }

    const delim = ext === 'tsv' ? '\t' : (lines[0].includes(',') ? ',' : ';')
    const columns = lines[0].split(delim).map(c => c.trim().toLowerCase().replace(/^["']|["']$/g, ''))
    const rows = lines.slice(1).map(l => l.split(delim))

    // Required columns check
    const missing = REQUIRED_CLINICAL_COLUMNS.filter(rc => !columns.includes(rc))
    const required_cols_ok = missing.length === 0

    // Label distribution
    const labelIdx = columns.indexOf('label')
    let luma_count = 0, nonluma_count = 0, nulls = 0
    let label_dist = 'unknown'

    for (const row of rows) {
      if (labelIdx >= 0) {
        const v = (row[labelIdx] || '').trim().toLowerCase()
        if (v === '' || v === 'null' || v === 'nan') nulls++
        else if (/^(1|luma|lum_?a|positive|true)$/i.test(v)) luma_count++
        else if (/^(0|non[\s_-]?luma|negative|false)$/i.test(v)) nonluma_count++
      }
    }

    // Count nulls in any required column
    let totalNulls = 0
    for (const row of rows) {
      for (const rc of REQUIRED_CLINICAL_COLUMNS) {
        const idx = columns.indexOf(rc)
        if (idx >= 0) {
          const v = (row[idx] || '').trim()
          if (v === '' || v.toLowerCase() === 'null' || v.toLowerCase() === 'nan') totalNulls++
        }
      }
    }

    label_dist = `LumA: ${luma_count}, non-LumA: ${nonluma_count}`

    return {
      total: rows.length,
      luma_count,
      nonluma_count,
      balance_ratio: luma_count + nonluma_count > 0 ? Math.round((Math.min(luma_count, nonluma_count) / (luma_count + nonluma_count)) * 100) : 0,
      columns,
      missing_columns: missing,
      required_cols_ok,
      nulls: totalNulls,
      clinical_dist: label_dist,
      sample_rows: rows.slice(0, 3),
      filename: file.name,
    }
  } catch (e) {
    return { error: `Failed to parse CSV: ${e.message}` }
  }
}

/* ── CSV template ───────────────────────────────────────────── */
export function downloadCsvTemplate() {
  const content = REQUIRED_CLINICAL_COLUMNS.join(',') + '\n' +
    'P001,1,1,0,52,2,1\n' +
    'P002,0,0,1,67,3,0\n' +
    'P003,1,1,0,45,1,1\n'
  const blob = new Blob([content], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'brecai_clinical_template.csv'
  a.click()
  URL.revokeObjectURL(url)
}
