import { test, expect } from '@playwright/test';
import { formatAchievementType } from '../app/lib/achievementType';

// Node-side checks of the achievementType formatter; no browser or server.

test('labels terms from the Open Badges vocabulary', () => {
  expect(formatAchievementType('BachelorDegree')).toBe('Bachelor Degree');
  expect(formatAchievementType('CertificateOfCompletion')).toBe('Certificate of Completion');
  expect(formatAchievementType('CoCurricular')).toBe('Co-Curricular');
  expect(formatAchievementType('Diploma')).toBe('Diploma');
});

test('drops the ext: prefix and splits run-together words', () => {
  expect(formatAchievementType('ext:Employment')).toBe('Employment');
  expect(formatAchievementType('EXT:Employment')).toBe('Employment');
  expect(formatAchievementType('ext:WorkExperience')).toBe('Work Experience');
  expect(formatAchievementType('ext:work_based_learning')).toBe('work based learning');
});

test('keeps abbreviations whole when splitting an extension', () => {
  expect(formatAchievementType('ext:PhDProgram')).toBe('PhD Program');
  expect(formatAchievementType('ext:HTMLBasics')).toBe('HTML Basics');
  expect(formatAchievementType('ext:3DPrinting')).toBe('3D Printing');
});

test('keeps an extension already written as words', () => {
  expect(formatAchievementType('ext:Work experience')).toBe('Work experience');
});

test('shows anything else exactly as the issuer wrote it', () => {
  for (const value of ['A big bad badge', 'Co-op Placement', 'iOS Developer', 'PhD', 'McDonald Award', 'Level 2 First-Aid']) {
    expect(formatAchievementType(value)).toBe(value);
  }
});

test('returns nothing to show for a missing, blank or non-string value', () => {
  expect(formatAchievementType(undefined)).toBeUndefined();
  expect(formatAchievementType('')).toBeUndefined();
  expect(formatAchievementType('   ')).toBeUndefined();
  expect(formatAchievementType('ext:')).toBeUndefined();
  expect(formatAchievementType(['Diploma'])).toBeUndefined();
});
