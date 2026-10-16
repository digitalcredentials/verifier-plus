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

// Looked up without regard to case, as the "ext:" prefix is
const VOCABULARY_BY_KEY = new Map(
  Object.entries(VOCABULARY).map(([term, label]) => [term.toLowerCase(), label])
)

// "WorkExperience" -> "Work Experience", "WorkAtHome" -> "Work At Home",
// "PhDProgram" -> "PhD Program", "work_based_learning" -> "work based
// learning". A capital starts a new word only where a lowercase letter follows
// it, so abbreviations stay whole. The lookaheads consume nothing, so a short
// word ("At") does not swallow the boundary after it. Known limits, since a
// pattern cannot tell them from an abbreviation: a plural abbreviation run into
// the next word ("PhDsProgram"), and a one-letter word ("AtAUniversity").
function splitWords(term: string): string {
  return term
    .replace(/_+/g, ' ')
    .replace(/([a-z0-9])(?=[A-Z][a-z])/g, '$1 ')
    .replace(/([A-Z])(?=[A-Z][a-z])/g, '$1 ')
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
  // A Map, not the object: an object lookup would also match inherited names
  // such as "constructor" or "__proto__"
  const label = VOCABULARY_BY_KEY.get(trimmed.toLowerCase())
  if (label) {
    return label
  }
  const extension = trimmed.match(/^ext:(.*)$/i)
  if (extension) {
    const term = extension[1].trim()
    // An extension written as words already ("ext:Work experience") is kept
    return (/\s/.test(term) ? term : splitWords(term)) || undefined
  }
  return trimmed
}
