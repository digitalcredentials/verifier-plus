// An Open Badges 3.0 achievementType in readable words.
//
// Three kinds of value arrive here:
// - a term from the spec's AchievementType vocabulary, written run together
//   ("BachelorDegree"): shown with its label from the table below;
// - an extension, prefixed "ext:" ("ext:Employment"): the prefix is dropped
//   and run-together words are split, keeping abbreviations whole
//   ("ext:PhDProgram" -> "PhD Program");
// - anything else, such as free text ("Co-op Placement", "iOS Developer"):
//   shown exactly as the issuer wrote it.
//
// Returns undefined when there is nothing to show.

// https://www.imsglobal.org/spec/ob/v3p0/#achievementtype-enumeration
const VOCABULARY: Record<string, string> = {
  Achievement: 'Achievement',
  ApprenticeshipCertificate: 'Apprenticeship Certificate',
  Assessment: 'Assessment',
  Assignment: 'Assignment',
  AssociateDegree: 'Associate Degree',
  Award: 'Award',
  Badge: 'Badge',
  BachelorDegree: 'Bachelor Degree',
  Certificate: 'Certificate',
  CertificateOfCompletion: 'Certificate of Completion',
  Certification: 'Certification',
  CommunityService: 'Community Service',
  Competency: 'Competency',
  Course: 'Course',
  CoCurricular: 'Co-Curricular',
  Degree: 'Degree',
  Diploma: 'Diploma',
  DoctoralDegree: 'Doctoral Degree',
  Fieldwork: 'Fieldwork',
  GeneralEducationDevelopment: 'General Education Development',
  JourneymanCertificate: 'Journeyman Certificate',
  LearningProgram: 'Learning Program',
  License: 'License',
  Membership: 'Membership',
  ProfessionalDoctorate: 'Professional Doctorate',
  QualityAssuranceCredential: 'Quality Assurance Credential',
  MasterCertificate: 'Master Certificate',
  MasterDegree: 'Master Degree',
  MicroCredential: 'Micro-Credential',
  ResearchDoctorate: 'Research Doctorate',
  SecondarySchoolDiploma: 'Secondary School Diploma',
}

// "WorkExperience" -> "Work Experience", "PhDProgram" -> "PhD Program",
// "work_based_learning" -> "work based learning". A capital starts a new word
// only where a lowercase letter follows it, so abbreviations stay whole.
function splitWords(term: string): string {
  return term
    .replace(/_+/g, ' ')
    .replace(/([a-z0-9])([A-Z][a-z])/g, '$1 $2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim()
}

export function formatAchievementType(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined
  }
  const trimmed = value.trim()
  if (!trimmed) {
    return undefined
  }
  if (VOCABULARY[trimmed]) {
    return VOCABULARY[trimmed]
  }
  const extension = trimmed.match(/^ext:(.*)$/i)
  if (extension) {
    const term = extension[1].trim()
    // An extension written as words already ("ext:Work experience") is kept
    return (/\s/.test(term) ? term : splitWords(term)) || undefined
  }
  return trimmed
}
