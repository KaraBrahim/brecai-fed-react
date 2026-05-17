// Scaffold helper — creates a minimal placeholder page component
// Run: node scaffold.cjs
const fs = require('fs')
const path = require('path')

const pages = [
  // Auth
  ['auth', 'LoginPage'],
  // Doctor
  ['doctor', 'DoctorInsights'],
  ['doctor', 'PatientRegistry'],
  ['doctor', 'PredictionEngine'],
  ['doctor', 'FinalExamination'],
  ['doctor', 'ClinicalReports'],
  ['doctor', 'XaiDeepDive'],
  // Instructor
  ['instructor', 'TrainingConsole'],
  ['instructor', 'ModelArchitect'],
  ['instructor', 'AggregationLogs'],
  // Org
  ['org', 'TeamRoster'],
  ['org', 'SiteCompliance'],
  // Admin
  ['admin', 'AdminOverview'],
  ['admin', 'UserManagement'],
  ['admin', 'OrgRegistry'],
  ['admin', 'PatientRecords'],
  ['admin', 'ExaminationAudit'],
  ['admin', 'PredictionAudit'],
  ['admin', 'PlansManager'],
  ['admin', 'SubscriptionTracker'],
  ['admin', 'PaymentHistory'],
  ['admin', 'AIModelRegistry'],
  ['admin', 'FederatedRegistry'],
  ['admin', 'AuditLogs'],
  // Landing
  ['landing', 'LandingPage'],
]

const srcPages = path.join(process.cwd(), 'src', 'pages')

pages.forEach(([folder, name]) => {
  const dir = path.join(srcPages, folder)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

  const file = path.join(dir, `${name}.jsx`)
  if (!fs.existsSync(file)) {
    const content = `export default function ${name}() {\n  return (\n    <div className="p-8">\n      <h1 className="text-2xl font-bold text-slate-900">${name.replace(/([A-Z])/g, ' $1').trim()}</h1>\n      <p className="text-slate-500 mt-2">This page is under construction.</p>\n    </div>\n  )\n}\n`
    fs.writeFileSync(file, content)
    console.log(`Created ${folder}/${name}.jsx`)
  }
})
