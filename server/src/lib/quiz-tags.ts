export const QUIZ_TAGS = [
  'species:dog', 'species:cat',
  'age:puppy', 'age:kitten', 'age:adult', 'age:senior', 'age:all',
  'size:mini', 'size:small', 'size:medium', 'size:large', 'size:giant', 'size:all',
  'format:dry', 'format:wet',
  'philosophy:grainfree', 'philosophy:lowgrain', 'philosophy:classic',
  'health:digestion', 'health:skin', 'health:allergy', 'health:sterilized',
  'health:joints', 'health:hairball', 'health:urinary', 'health:longhair',
  'flavor:chicken', 'flavor:lamb', 'flavor:fish', 'flavor:game',
  'flavor:beef', 'flavor:turkey', 'flavor:duck', 'flavor:rabbit',
  'contains:chicken', 'contains:beef', 'contains:fish', 'contains:grain', 'contains:lamb',
  'weight:overweight', 'weight:underweight',
  'activity:low', 'activity:normal', 'activity:high',
  'lifestyle:indoor', 'lifestyle:outdoor',
  'special:monoprotein', 'special:hypoallergenic', 'special:palatable',
] as const

export type QuizTag = (typeof QUIZ_TAGS)[number]
export const QUIZ_TAG_SET = new Set<string>(QUIZ_TAGS)
export function isQuizTag(v: string): v is QuizTag { return QUIZ_TAG_SET.has(v) }
