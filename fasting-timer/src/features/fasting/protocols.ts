export type ProtocolId = '12:12' | '14:10' | '16:8' | '18:6' | '20:4' | '23:1';

export type Protocol = {
  id: ProtocolId;
  name: string;
  fastHours: number;
  eatHours: number;
  /** One line a person would say about who this is for. */
  note: string;
};

/** The plans the picker offers. The id is also the label ("16:8"). */
export const protocols: Protocol[] = [
  { id: '12:12', name: 'Gentle', fastHours: 12, eatHours: 12, note: 'Skip late snacks. A first week.' },
  { id: '14:10', name: 'Easy', fastHours: 14, eatHours: 10, note: 'A late breakfast, nothing after dinner.' },
  { id: '16:8', name: 'Classic', fastHours: 16, eatHours: 8, note: 'The most common plan. Lunch to dinner.' },
  { id: '18:6', name: 'Focused', fastHours: 18, eatHours: 6, note: 'A short eating window, two meals.' },
  { id: '20:4', name: 'Intense', fastHours: 20, eatHours: 4, note: 'One big meal and a snack.' },
  { id: '23:1', name: 'One meal', fastHours: 23, eatHours: 1, note: 'One meal a day. For experienced fasters.' },
];

export const DEFAULT_PROTOCOL: ProtocolId = '16:8';

export function getProtocol(id: string): Protocol {
  return protocols.find((protocol) => protocol.id === id) ?? protocols[2];
}
