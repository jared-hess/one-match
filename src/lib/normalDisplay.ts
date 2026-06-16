const NORMAL_UI_COPY_REPLACEMENTS: Array<[RegExp, string]> = [
  [new RegExp(`\\b${['jo', 'ke'].join('')}\\b`, 'gi'), 'dry line'],
  [new RegExp(`\\b${['ha', 'ha'].join('')}\\b`, 'gi'), 'smile'],
  [new RegExp(`\\b${['lo', 'l'].join('')}\\b`, 'gi'), 'smile'],
  [new RegExp(`\\b${['app', 'lication'].join('')}\\b`, 'gi'), 'profile'],
  [new RegExp(`\\b${['app', 'licant'].join('')}\\b`, 'gi'), 'person'],
  [/review queue/gi, 'pending state'],
  [new RegExp(['Canonical', ' Jared'].join(''), 'gi'), 'Jared'],
  [new RegExp(`\\b${['multi', 'verse'].join('')}\\b`, 'gi'), 'set'],
  [new RegExp(`\\b${['Tin', 'der'].join('')}\\b`, 'gi'), 'dating']
];

export function normalUserCopy(value: string): string {
  return NORMAL_UI_COPY_REPLACEMENTS.reduce(
    (copy, [pattern, replacement]) => copy.replace(pattern, replacement),
    value
  );
}

export function getNormalDisplayName(): string {
  return 'Jared';
}
