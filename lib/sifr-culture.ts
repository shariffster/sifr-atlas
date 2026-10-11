// Heritage context is sourced separately from Sifr's illustrative sensory data.
// These sources do not validate the model's scores, compounds or geometry.
export const CULTURAL_CONTEXT = {
  chicken_rice: {
    title: 'A dish that travelled.',
    text: 'Hainanese chicken rice developed in Singapore through migration and local influences. NHB describes later Cantonese preparation methods and the use of pandan in the rice. A familiar dish can carry several histories at once.',
    sourceTitle: 'NHB · Chicken Rice',
    sourceUrl: 'https://www.roots.gov.sg/ich-landing/ich/chicken-rice',
    focusLabel: 'Follow pandan & rice',
    focusId: 'chicken_rice-4',
    prompt: 'What makes chicken rice familiar to you: the rice, the chicken, the chilli, or the person you eat it with?',
  },
  laksa: {
    title: 'A dish that keeps changing.',
    text: 'NHB describes laksa as shaped by Chinese, Malay and other influences, with generations of stalls continuing to adapt it. This coconut-based profile is one illustrative starting point within that living food culture.',
    sourceTitle: 'NHB · Laksa',
    sourceUrl: 'https://www.roots.gov.sg/ich-landing/ich/laksa',
    focusLabel: 'Follow coconut richness',
    focusId: 'laksa-1',
    prompt: 'What would you keep from the laksa you remember—and who or where taught you that?',
  },
} as const;

export const CULTURAL_PURPOSE = 'What changes, and what stays?';
export const CULTURAL_INTRO = 'Explore familiar food, trace its ingredients, and put a memory beside your own variation.';
