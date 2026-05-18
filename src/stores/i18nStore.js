/**
 * i18nStore.js
 * Lightweight i18n using Zustand — no extra packages needed.
 * Supports: English (en), French (fr), Arabic (ar — RTL)
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ── Translations ──────────────────────────────────────────────────────────────
export const translations = {
  en: {
    // Nav
    nav: {
      dashboard:    'Dashboard',
      members:      'Members',
      patients:     'Patients',
      reports:      'Reports',
      aiModels:     'AI Models',
      invitations:  'Invitations',
      subscription: 'Subscription',
      insights:     'Insights',
      training:     'Training Console',
      modelRegistry:'Model Registry',
      aggLogs:      'Aggregation Logs',
      contributions:'Contributions',
      signOut:      'Sign out',
    },
    // Topbar
    topbar: {
      systemActive: 'System Active',
      settings:     'Settings',
    },
    // Settings modal
    settings: {
      title:       'Settings',
      language:    'Language',
      appearance:  'Appearance',
      chooseLanguage: 'Choose your preferred language',
    },
    // Org Dashboard
    orgDashboard: {
      eyebrow:     'Organization Dashboard',
      subtitle:    'Monitor your team, track clinical activity, and oversee AI-powered breast cancer detection.',
      doctors:     'Doctors',
      active:      'Active',
      patients:    'Patients',
      predictions: 'Predictions',
      reports:     'Reports',
      registered:  'Registered',
      allTime:     'All time',
      generated:   'Generated',
      onPlatform:  'On platform',
      totalPatients: 'Total Patients',
      activeDoctors: 'Active Doctors',
      // Subscription countdown
      subActive:   'Active Plan',
      subExpires:  'expires',
      daysLeft:    'days left',
      dayLeft:     'day left',
      expiresIn:   'Expires in',
      expired:     'Subscription expired',
      renewNow:    'Renew now',
      // Charts
      patientGrowth:    'Patient growth',
      monthlyReg:       'Monthly registrations — last 12 months',
      subtypeDist:      'Subtype distribution',
      lumVsNon:         'Luminal A vs Non-Luminal A',
      predActivity:     'Prediction activity',
      predPerMonth:     'Total · completed · failed per month',
      doctorLeaderboard:'Doctor leaderboard',
      mostActive:       'Most active clinicians',
      ageDistrib:       'Patient age distribution',
      byAgeGroup:       'Breakdown by age group',
      receptorStatus:   'Receptor status',
      erPrHer2:         'ER · PR · HER2 distribution',
      receptorRadar:    'Receptor radar',
      visualOverview:   'Visual overview of all markers',
      teamOverview:     'Team overview',
      membersGlance:    'Members at a glance',
      noPatientData:    'No patient data yet',
      noPredData:       'No prediction data yet',
      noTimeline:       'No prediction timeline yet',
      noActivity:       'No activity yet',
      noAgeData:        'No age data yet',
      noReceptorData:   'No receptor data yet',
      completionRate:   'Prediction completion rate',
      completed:        'completed',
      total:            'total',
      totalMembers:     'Total Members',
      activeDoctors:    'Active Doctors',
      pendingApproval:  'Pending Approval',
      examinations:     'Examinations',
    },
    // Common
    common: {
      loading:    'Loading…',
      retry:      'Retry',
      cancel:     'Cancel',
      save:       'Save',
      confirm:    'Confirm',
      back:       'Back',
      next:       'Next',
      close:      'Close',
      search:     'Search…',
      noData:     'No data available',
    },
    // Roles
    roles: {
      admin:       'Platform Admin',
      org_manager: 'Org Manager',
      doctor:      'Clinician',
      instructor:  'Data Scientist',
    },
    // Org Members
    orgMembers: {
      eyebrow:      'Identity & Access',
      title:        'Team Members',
      subtitle:     'Manage your organization\'s doctors and staff. Approve pending accounts and control access.',
      totalMembers: 'Total members',
      allRoles:     'All roles',
      active:       'Active',
      haveAccess:   'Have access',
      pending:      'Pending',
      needApproval: 'Need approval',
      waitingApproval: 'waiting for your approval',
      waitingDesc:  'These doctors registered and verified their email — approve them to grant platform access.',
      member:       'Member',
      role:         'Role',
      status:       'Status',
      exams:        'Exams',
      reports:      'Reports',
      joined:       'Joined',
      approve:      'Approve',
      deactivate:   'Deactivate',
      remove:       'Remove',
      noMembers:    'No members found.',
      doctor:       'Doctor',
      orgAdmin:     'Org Admin',
      statusActive: 'Active',
      statusPending:'Pending',
      total:        'Total',
      online:       'online',
      awaiting:     'awaiting',
    },
  },

  fr: {
    nav: {
      dashboard:    'Tableau de bord',
      members:      'Membres',
      patients:     'Patients',
      reports:      'Rapports',
      aiModels:     'Modèles IA',
      invitations:  'Invitations',
      subscription: 'Abonnement',
      insights:     'Statistiques',
      training:     'Console d\'entraînement',
      modelRegistry:'Registre des modèles',
      aggLogs:      'Journaux d\'agrégation',
      contributions:'Contributions',
      signOut:      'Se déconnecter',
    },
    topbar: {
      systemActive: 'Système actif',
      settings:     'Paramètres',
    },
    settings: {
      title:       'Paramètres',
      language:    'Langue',
      appearance:  'Apparence',
      chooseLanguage: 'Choisissez votre langue préférée',
    },
    orgDashboard: {
      eyebrow:     'Tableau de bord',
      subtitle:    'Surveillez votre équipe, suivez l\'activité clinique et supervisez la détection IA du cancer du sein.',
      doctors:     'Médecins',
      active:      'Actifs',
      patients:    'Patients',
      predictions: 'Prédictions',
      reports:     'Rapports',
      registered:  'Inscrits',
      allTime:     'Total',
      generated:   'Générés',
      onPlatform:  'Sur la plateforme',
      totalPatients: 'Total patients',
      activeDoctors: 'Médecins actifs',
      subActive:   'Plan actif',
      subExpires:  'expire le',
      daysLeft:    'jours restants',
      dayLeft:     'jour restant',
      expiresIn:   'Expire dans',
      expired:     'Abonnement expiré',
      renewNow:    'Renouveler',
      patientGrowth:    'Croissance des patients',
      monthlyReg:       'Inscriptions mensuelles — 12 derniers mois',
      subtypeDist:      'Distribution des sous-types',
      lumVsNon:         'Luminal A vs Non-Luminal A',
      predActivity:     'Activité de prédiction',
      predPerMonth:     'Total · complétées · échouées par mois',
      doctorLeaderboard:'Classement des médecins',
      mostActive:       'Cliniciens les plus actifs',
      ageDistrib:       'Distribution par âge des patients',
      byAgeGroup:       'Répartition par groupe d\'âge',
      receptorStatus:   'Statut des récepteurs',
      erPrHer2:         'Distribution ER · PR · HER2',
      receptorRadar:    'Radar des récepteurs',
      visualOverview:   'Vue d\'ensemble de tous les marqueurs',
      teamOverview:     'Aperçu de l\'équipe',
      membersGlance:    'Membres en un coup d\'œil',
      noPatientData:    'Aucune donnée patient',
      noPredData:       'Aucune donnée de prédiction',
      noTimeline:       'Aucune chronologie de prédiction',
      noActivity:       'Aucune activité',
      noAgeData:        'Aucune donnée d\'âge',
      noReceptorData:   'Aucune donnée de récepteur',
      completionRate:   'Taux de complétion des prédictions',
      completed:        'complétées',
      total:            'total',
      totalMembers:     'Total membres',
      activeDoctors:    'Médecins actifs',
      pendingApproval:  'En attente',
      examinations:     'Examens',
    },
    common: {
      loading:    'Chargement…',
      retry:      'Réessayer',
      cancel:     'Annuler',
      save:       'Enregistrer',
      confirm:    'Confirmer',
      back:       'Retour',
      next:       'Suivant',
      close:      'Fermer',
      search:     'Rechercher…',
      noData:     'Aucune donnée disponible',
    },
    roles: {
      admin:       'Admin Plateforme',
      org_manager: 'Gestionnaire',
      doctor:      'Clinicien',
      instructor:  'Data Scientist',
    },
    orgMembers: {
      eyebrow:      'Identité & Accès',
      title:        'Membres de l\'équipe',
      subtitle:     'Gérez les médecins et le personnel de votre organisation. Approuvez les comptes en attente.',
      totalMembers: 'Total membres',
      allRoles:     'Tous les rôles',
      active:       'Actifs',
      haveAccess:   'Ont accès',
      pending:      'En attente',
      needApproval: 'À approuver',
      waitingApproval: 'en attente d\'approbation',
      waitingDesc:  'Ces médecins se sont inscrits et ont vérifié leur email — approuvez-les pour leur donner accès.',
      member:       'Membre',
      role:         'Rôle',
      status:       'Statut',
      exams:        'Examens',
      reports:      'Rapports',
      joined:       'Inscrit',
      approve:      'Approuver',
      deactivate:   'Désactiver',
      remove:       'Supprimer',
      noMembers:    'Aucun membre trouvé.',
      doctor:       'Médecin',
      orgAdmin:     'Admin Org',
      statusActive: 'Actif',
      statusPending:'En attente',
      total:        'Total',
      online:       'en ligne',
      awaiting:     'en attente',
    },
  },

  ar: {
    nav: {
      dashboard:    'لوحة التحكم',
      members:      'الأعضاء',
      patients:     'المرضى',
      reports:      'التقارير',
      aiModels:     'نماذج الذكاء الاصطناعي',
      invitations:  'الدعوات',
      subscription: 'الاشتراك',
      insights:     'الإحصائيات',
      training:     'وحدة التدريب',
      modelRegistry:'سجل النماذج',
      aggLogs:      'سجلات التجميع',
      contributions:'المساهمات',
      signOut:      'تسجيل الخروج',
    },
    topbar: {
      systemActive: 'النظام نشط',
      settings:     'الإعدادات',
    },
    settings: {
      title:       'الإعدادات',
      language:    'اللغة',
      appearance:  'المظهر',
      chooseLanguage: 'اختر لغتك المفضلة',
    },
    orgDashboard: {
      eyebrow:     'لوحة تحكم المؤسسة',
      subtitle:    'راقب فريقك وتتبع النشاط السريري وأشرف على الكشف بالذكاء الاصطناعي عن سرطان الثدي.',
      doctors:     'الأطباء',
      active:      'نشطون',
      patients:    'المرضى',
      predictions: 'التنبؤات',
      reports:     'التقارير',
      registered:  'مسجلون',
      allTime:     'الإجمالي',
      generated:   'مُنشأة',
      onPlatform:  'على المنصة',
      totalPatients: 'إجمالي المرضى',
      activeDoctors: 'الأطباء النشطون',
      subActive:   'الخطة النشطة',
      subExpires:  'تنتهي في',
      daysLeft:    'أيام متبقية',
      dayLeft:     'يوم متبقي',
      expiresIn:   'تنتهي خلال',
      expired:     'انتهى الاشتراك',
      renewNow:    'تجديد الآن',
      patientGrowth:    'نمو المرضى',
      monthlyReg:       'التسجيلات الشهرية — آخر 12 شهراً',
      subtypeDist:      'توزيع الأنواع الفرعية',
      lumVsNon:         'لومينال A مقابل غير لومينال A',
      predActivity:     'نشاط التنبؤ',
      predPerMonth:     'الإجمالي · المكتملة · الفاشلة شهرياً',
      doctorLeaderboard:'ترتيب الأطباء',
      mostActive:       'الأطباء الأكثر نشاطاً',
      ageDistrib:       'توزيع أعمار المرضى',
      byAgeGroup:       'التوزيع حسب الفئة العمرية',
      receptorStatus:   'حالة المستقبلات',
      erPrHer2:         'توزيع ER · PR · HER2',
      receptorRadar:    'رادار المستقبلات',
      visualOverview:   'نظرة عامة على جميع المؤشرات',
      teamOverview:     'نظرة عامة على الفريق',
      membersGlance:    'الأعضاء في لمحة',
      noPatientData:    'لا توجد بيانات مرضى بعد',
      noPredData:       'لا توجد بيانات تنبؤ بعد',
      noTimeline:       'لا يوجد جدول زمني للتنبؤات',
      noActivity:       'لا يوجد نشاط بعد',
      noAgeData:        'لا توجد بيانات عمرية بعد',
      noReceptorData:   'لا توجد بيانات مستقبلات بعد',
      completionRate:   'معدل اكتمال التنبؤات',
      completed:        'مكتملة',
      total:            'الإجمالي',
      totalMembers:     'إجمالي الأعضاء',
      activeDoctors:    'الأطباء النشطون',
      pendingApproval:  'في انتظار الموافقة',
      examinations:     'الفحوصات',
    },
    common: {
      loading:    'جارٍ التحميل…',
      retry:      'إعادة المحاولة',
      cancel:     'إلغاء',
      save:       'حفظ',
      confirm:    'تأكيد',
      back:       'رجوع',
      next:       'التالي',
      close:      'إغلاق',
      search:     'بحث…',
      noData:     'لا توجد بيانات',
    },
    roles: {
      admin:       'مدير المنصة',
      org_manager: 'مدير المؤسسة',
      doctor:      'طبيب سريري',
      instructor:  'عالم بيانات',
    },
    orgMembers: {
      eyebrow:      'الهوية والوصول',
      title:        'أعضاء الفريق',
      subtitle:     'إدارة أطباء مؤسستك وموظفيها. الموافقة على الحسابات المعلقة والتحكم في الوصول.',
      totalMembers: 'إجمالي الأعضاء',
      allRoles:     'جميع الأدوار',
      active:       'نشطون',
      haveAccess:   'لديهم وصول',
      pending:      'في الانتظار',
      needApproval: 'تحتاج موافقة',
      waitingApproval: 'في انتظار موافقتك',
      waitingDesc:  'هؤلاء الأطباء سجلوا وتحققوا من بريدهم — وافق عليهم لمنحهم الوصول.',
      member:       'العضو',
      role:         'الدور',
      status:       'الحالة',
      exams:        'الفحوصات',
      reports:      'التقارير',
      joined:       'تاريخ الانضمام',
      approve:      'موافقة',
      deactivate:   'تعطيل',
      remove:       'إزالة',
      noMembers:    'لا يوجد أعضاء.',
      doctor:       'طبيب',
      orgAdmin:     'مدير المؤسسة',
      statusActive: 'نشط',
      statusPending:'في الانتظار',
      total:        'الإجمالي',
      online:       'متصل',
      awaiting:     'في الانتظار',
    },
  },
}

export const LANGUAGES = [
  { code: 'en', label: 'English',  nativeLabel: 'English',  flag: '🇬🇧', dir: 'ltr', font: 'font-sans' },
  { code: 'fr', label: 'French',   nativeLabel: 'Français', flag: '🇫🇷', dir: 'ltr', font: 'font-sans' },
  { code: 'ar', label: 'Arabic',   nativeLabel: 'العربية',  flag: '🇩🇿', dir: 'rtl', font: 'font-arabic' },
]

// ── Store ─────────────────────────────────────────────────────────────────────
export const useI18nStore = create(
  persist(
    (set, get) => ({
      locale: 'en',

      setLocale: (code) => {
        set({ locale: code })
        const lang = LANGUAGES.find(l => l.code === code)
        document.documentElement.dir = lang?.dir || 'ltr'
        document.documentElement.lang = code
      },
    }),
    {
      name: 'brecai-i18n',
      partialize: (s) => ({ locale: s.locale }),
      onRehydrateStorage: () => (state) => {
        if (state?.locale) {
          const lang = LANGUAGES.find(l => l.code === state.locale)
          document.documentElement.dir = lang?.dir || 'ltr'
          document.documentElement.lang = state.locale
        }
      },
    }
  )
)

// ── Standalone helpers (not in state — avoids Zustand function serialization issues) ──

function translate(locale, key) {
  const dict = translations[locale] || translations.en
  const parts = key.split('.')
  let val = dict
  for (const p of parts) {
    val = val?.[p]
    if (val === undefined) break
  }
  if (val === undefined) {
    let fallback = translations.en
    for (const p of parts) fallback = fallback?.[p]
    return fallback ?? key
  }
  return val
}

// Convenience hook — returns a stable t() function bound to current locale
export function useT() {
  const locale = useI18nStore(s => s.locale)
  return (key) => translate(locale, key)
}

// RTL hook
export function useIsRTL() {
  const locale = useI18nStore(s => s.locale)
  const lang = LANGUAGES.find(l => l.code === locale)
  return lang?.dir === 'rtl'
}
