import type { JaredProfile } from '../types';

type Prompt = {
  prompt: string;
  answer: string;
};

const FALLBACK_TIMESTAMP = '2026-06-12T00:00:00.000Z';

export const fallbackJaredProfiles: JaredProfile[] = [
  {
    id: '5f3f4c7a-8a1b-4a0f-9f7a-9c2a6e1d1001',
    slug: 'jared-dinner-conversation',
    internal_label: 'Dinner / conversation Jared',
    display_name: 'Jared',
    age_label: '30-ish',
    location: 'Oakland',
    bio: 'I like good conversation, warm lighting, and the part of dinner where everyone stops pretending they are not going to order fries.',
    prompts: [
      {
        prompt: 'Ideal first date',
        answer: 'Dinner somewhere with warm lighting, then a walk if neither of us has started checking the time.'
      },
      {
        prompt: 'A green flag I bring',
        answer: 'I can hold a conversation without turning it into a podcast audition.'
      }
    ],
    tags: ['Dinner', 'conversation', 'Oakland', 'movies'],
    image_urls: ['/jared-profile-photos/dinner-conversation-1.jpg'],
    sort_order: 10,
    demo_eligible: true,
    active: true,
    archived: false,
    created_at: FALLBACK_TIMESTAMP,
    updated_at: FALLBACK_TIMESTAMP
  },
  {
    id: '5f3f4c7a-8a1b-4a0f-9f7a-9c2a6e1d1002',
    slug: 'jared-systems-software',
    internal_label: 'Systems / software Jared',
    display_name: 'Jared',
    age_label: '30-ish',
    location: 'Oakland',
    bio: 'Software engineer. Good at systems. Still refining a few human-facing interfaces.',
    prompts: [
      {
        prompt: 'I am unusually good at',
        answer: 'Finding the edge case and then, eventually, making eye contact.'
      },
      {
        prompt: 'Together we could',
        answer: 'Debug a plan until it becomes a date.'
      }
    ],
    tags: ['software', 'systems', 'dry humor', 'Oakland'],
    image_urls: ['/jared-profile-photos/systems-software-1.jpg'],
    sort_order: 20,
    demo_eligible: true,
    active: true,
    archived: false,
    created_at: FALLBACK_TIMESTAMP,
    updated_at: FALLBACK_TIMESTAMP
  },
  {
    id: '5f3f4c7a-8a1b-4a0f-9f7a-9c2a6e1d1003',
    slug: 'jared-cooking-home',
    internal_label: 'Cooking / home Jared',
    display_name: 'Jared',
    age_label: '30-ish',
    location: 'Oakland',
    bio: 'Can cook one impressive thing and several adequate things. Knows which is which.',
    prompts: [
      {
        prompt: 'My most practical trait',
        answer: 'I clean while cooking, not as a moral performance but because counters are finite.'
      },
      {
        prompt: 'A small promise',
        answer: 'If I say dinner is almost ready, it is within a defensible range of almost.'
      }
    ],
    tags: ['cooking', 'home', 'dinner', 'honest'],
    image_urls: ['/jared-profile-photos/cooking-home-1.jpg'],
    sort_order: 30,
    demo_eligible: true,
    active: true,
    archived: false,
    created_at: FALLBACK_TIMESTAMP,
    updated_at: FALLBACK_TIMESTAMP
  },
  {
    id: '5f3f4c7a-8a1b-4a0f-9f7a-9c2a6e1d1004',
    slug: 'jared-fitness-routine',
    internal_label: 'Fitness / routine Jared',
    display_name: 'Jared',
    age_label: '30-ish',
    location: 'Oakland',
    bio: 'Trying to be more consistent about the gym. Currently in a promising but legally non-binding phase.',
    prompts: [
      {
        prompt: 'Simple pleasures',
        answer: 'A routine that survives one mildly inconvenient week.'
      },
      {
        prompt: 'You should not go out with me if',
        answer: 'You need fitness updates delivered with influencer lighting.'
      }
    ],
    tags: ['fitness', 'routine', 'gym', 'self-aware'],
    image_urls: ['/jared-profile-photos/fitness-routine-1.jpg'],
    sort_order: 40,
    demo_eligible: true,
    active: true,
    archived: false,
    created_at: FALLBACK_TIMESTAMP,
    updated_at: FALLBACK_TIMESTAMP
  },
  {
    id: '5f3f4c7a-8a1b-4a0f-9f7a-9c2a6e1d1005',
    slug: 'jared-coffee-planning',
    internal_label: 'Coffee / planning Jared',
    display_name: 'Jared',
    age_label: '30-ish',
    location: 'Oakland',
    bio: 'Overthinks the coffee shop, then somehow picks the obvious one.',
    prompts: [
      {
        prompt: 'Texting style',
        answer: 'Clear enough to make the plan, restrained enough not to become a meeting agenda.'
      },
      {
        prompt: 'Ideal first date',
        answer: 'Coffee that can become a walk but is not legally required to.'
      }
    ],
    tags: ['coffee', 'planning', 'Oakland', 'walks'],
    image_urls: ['/jared-profile-photos/coffee-planning-1.jpg'],
    sort_order: 50,
    demo_eligible: true,
    active: true,
    archived: false,
    created_at: FALLBACK_TIMESTAMP,
    updated_at: FALLBACK_TIMESTAMP
  },
  {
    id: '5f3f4c7a-8a1b-4a0f-9f7a-9c2a6e1d1006',
    slug: 'jared-parks-outdoors-ish',
    internal_label: 'Parks / outdoors-ish Jared',
    display_name: 'Jared',
    age_label: '30-ish',
    location: 'Oakland',
    bio: 'Open to nature, especially when nature has parking and a clear plan for snacks.',
    prompts: [
      {
        prompt: 'Best Sunday',
        answer: 'A park, a coffee, and a route that does not become a survival narrative.'
      },
      {
        prompt: 'Compatibility test',
        answer: 'Can we enjoy a view without pretending we discovered outside?'
      }
    ],
    tags: ['parks', 'outdoors-ish', 'snacks', 'Oakland'],
    image_urls: ['/jared-profile-photos/parks-outdoors-ish-1.jpg'],
    sort_order: 60,
    demo_eligible: true,
    active: true,
    archived: false,
    created_at: FALLBACK_TIMESTAMP,
    updated_at: FALLBACK_TIMESTAMP
  },
  {
    id: '5f3f4c7a-8a1b-4a0f-9f7a-9c2a6e1d1007',
    slug: 'jared-sincere-romantic',
    internal_label: 'Sincere / romantic Jared',
    display_name: 'Jared',
    age_label: '30-ish',
    location: 'Oakland',
    bio: 'Sincere underneath several layers of dry delivery.',
    prompts: [
      {
        prompt: 'The way to my heart',
        answer: 'Notice the effort, then let me make one dry line so we can both survive the sincerity.'
      },
      {
        prompt: 'I value',
        answer: 'Kindness with a working sense of timing.'
      }
    ],
    tags: ['sincere', 'romantic', 'dry delivery', 'kind'],
    image_urls: ['/jared-profile-photos/sincere-romantic-1.jpg'],
    sort_order: 70,
    demo_eligible: true,
    active: true,
    archived: false,
    created_at: FALLBACK_TIMESTAMP,
    updated_at: FALLBACK_TIMESTAMP
  },
  {
    id: '5f3f4c7a-8a1b-4a0f-9f7a-9c2a6e1d1008',
    slug: 'jared-product-constrained-market',
    internal_label: 'Product / constrained market Jared',
    display_name: 'Jared',
    age_label: '30-ish',
    location: 'Oakland',
    bio: 'Built a dating app with a constrained supply model. Hoping demand finds this charming rather than alarming.',
    prompts: [
      {
        prompt: 'My toxic trait',
        answer: 'I describe obvious personal decisions as product constraints.'
      },
      {
        prompt: 'Together we could',
        answer: 'Validate whether scarcity is romantic or just a backlog issue.'
      }
    ],
    tags: ['product', 'dating app', 'constrained supply', 'Oakland'],
    image_urls: ['/jared-profile-photos/product-constrained-market-1.jpg'],
    sort_order: 80,
    demo_eligible: true,
    active: true,
    archived: false,
    created_at: FALLBACK_TIMESTAMP,
    updated_at: FALLBACK_TIMESTAMP
  },
  {
    id: '5f3f4c7a-8a1b-4a0f-9f7a-9c2a6e1d1009',
    slug: 'jared-calendar-synced',
    internal_label: 'Calendar-synced Jared',
    display_name: 'Jared',
    age_label: '30-ish',
    location: 'Oakland',
    bio: 'Keeps plans, reads the confirmation email, and arrives with a backup reservation already saved.',
    prompts: [
      {
        prompt: 'A green flag I bring',
        answer: 'I know the difference between flexible and vague.'
      },
      {
        prompt: 'Ideal first date',
        answer: 'One drink, one clearly stated end time, and a walk if the weather has earned it.'
      }
    ],
    tags: ['punctual', 'dry humor', 'plans ahead', 'Oakland'],
    image_urls: ['/jared-profile-photos/calendar-synced-1.jpg'],
    sort_order: 90,
    demo_eligible: true,
    active: true,
    archived: false,
    created_at: FALLBACK_TIMESTAMP,
    updated_at: FALLBACK_TIMESTAMP
  },
  {
    id: '5f3f4c7a-8a1b-4a0f-9f7a-9c2a6e1d1010',
    slug: 'jared-brings-a-layer',
    internal_label: 'Brings-a-layer Jared',
    display_name: 'Jared',
    age_label: '30-ish',
    location: 'Oakland',
    bio: 'Will suggest the patio, bring a layer, and never imply that being cold is a personality test.',
    prompts: [
      {
        prompt: 'Simple pleasures',
        answer: 'A patio heater that works and a conversation that does not require shouting.'
      },
      {
        prompt: 'I am looking for',
        answer: 'Someone who understands that comfort is not defeat.'
      }
    ],
    tags: ['patio', 'practical', 'warm enough', 'conversation'],
    image_urls: ['/jared-profile-photos/brings-layer-1.jpg'],
    sort_order: 100,
    demo_eligible: true,
    active: true,
    archived: false,
    created_at: FALLBACK_TIMESTAMP,
    updated_at: FALLBACK_TIMESTAMP
  },
  {
    id: '5f3f4c7a-8a1b-4a0f-9f7a-9c2a6e1d1011',
    slug: 'jared-replies-after-work',
    internal_label: 'Replies-after-work Jared',
    display_name: 'Jared',
    age_label: '30-ish',
    location: 'Oakland',
    bio: 'Replies after work because work was happening. Does not confuse silence with strategy.',
    prompts: [
      {
        prompt: 'Texting style',
        answer: 'Responsive, not ambient.'
      },
      {
        prompt: 'What I appreciate',
        answer: 'People who can be unavailable without becoming mysterious.'
      }
    ],
    tags: ['responsive', 'adult schedule', 'not mysterious', 'Oakland'],
    image_urls: ['/jared-profile-photos/replies-after-work-1.jpg'],
    sort_order: 110,
    demo_eligible: true,
    active: true,
    archived: false,
    created_at: FALLBACK_TIMESTAMP,
    updated_at: FALLBACK_TIMESTAMP
  },
  {
    id: '5f3f4c7a-8a1b-4a0f-9f7a-9c2a6e1d1012',
    slug: 'jared-saves-the-receipt',
    internal_label: 'Saves-the-receipt Jared',
    display_name: 'Jared',
    age_label: '30-ish',
    location: 'Oakland',
    bio: 'Saves receipts, remembers preferences, and considers "I took care of it" a complete sentence.',
    prompts: [
      {
        prompt: 'My love language',
        answer: 'Quiet follow-through.'
      },
      {
        prompt: 'Best case scenario',
        answer: 'We both feel considered and nobody has to make a speech about it.'
      }
    ],
    tags: ['follow-through', 'observant', 'useful', 'quiet'],
    image_urls: ['/jared-profile-photos/saves-receipt-1.jpg'],
    sort_order: 120,
    demo_eligible: true,
    active: true,
    archived: false,
    created_at: FALLBACK_TIMESTAMP,
    updated_at: FALLBACK_TIMESTAMP
  }
];

export function parseJaredPrompts(profile: Pick<JaredProfile, 'prompts'>): Prompt[] {
  return Array.isArray(profile.prompts)
    ? profile.prompts.filter((prompt): prompt is Prompt => {
        if (!prompt || typeof prompt !== 'object' || Array.isArray(prompt)) {
          return false;
        }

        const candidate = prompt as Record<string, unknown>;
        return typeof candidate.prompt === 'string' && typeof candidate.answer === 'string';
      })
    : [];
}
