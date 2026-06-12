const NORMAL_UI_COPY_REPLACEMENTS: Array<[RegExp, string]> = [
  [/\bjoke\b/gi, 'dry line'],
  [/\bhaha\b/gi, 'smile'],
  [/\blol\b/gi, 'smile'],
  [/\bapplication\b/gi, 'profile'],
  [/\bapplicant\b/gi, 'person'],
  [/review queue/gi, 'pending state'],
  [/Canonical Jared/gi, 'Jared'],
  [/\bmultiverse\b/gi, 'set'],
  [/\bTinder\b/gi, 'dating']
];

export function normalUserCopy(value: string): string {
  return NORMAL_UI_COPY_REPLACEMENTS.reduce((copy, [pattern, replacement]) => copy.replace(pattern, replacement), value);
}

export function getNormalDisplayName(): string {
  return 'Jared';
}
