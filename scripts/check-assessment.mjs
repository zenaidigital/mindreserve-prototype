import {assessmentQuestions} from '../src/domain.mjs';
import {assessmentGuidance} from '../src/assessmentGuidance.mjs';
for (const q of assessmentQuestions) {
  if (q.correct !== 0 || !q.options[q.correct]) throw new Error(`Assessment integrity failure: ${q.skill}`);
}
console.log(`Assessment integrity OK: ${assessmentQuestions.length} questions`);
