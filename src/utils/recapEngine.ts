import { CategoryType, StorySlide, WrappedData } from '../types';

export const generateStorySlides = (isPremiumUnlocked: boolean = false): StorySlide[] => {
  const baseSlides: StorySlide[] = [
    {
      id: 'slide-intro',
      type: 'intro',
      title: '2026 WAS UNREAL',
      subtitle: 'Ready to witness what you achieved?',
      isPremium: false,
    },
    {
      id: 'slide-primary',
      type: 'primary_metric',
      title: 'THE HEADLINE NUMBER',
      subtitle: 'Putting your hours into perspective',
      isPremium: false,
    },
    {
      id: 'slide-top-list',
      type: 'top_list',
      title: 'YOUR TOP 5 OBSESSIONS',
      subtitle: 'The heavy hitters that ruled your year',
      isPremium: false,
    },
    {
      id: 'slide-peak',
      type: 'peak_moment',
      title: 'THE PEAK & STREAK',
      subtitle: 'When the meters pushed into red',
      isPremium: false,
    },
    {
      id: 'slide-archetype',
      type: 'archetype',
      title: 'YOUR 2026 ARCHETYPE',
      subtitle: 'Calculated from your raw behavioral patterns',
      isPremium: false,
    },
  ];

  const premiumSlides: StorySlide[] = [
    {
      id: 'slide-deep-stats',
      type: 'deep_stats',
      title: 'ANALYTICS DEEP DIVE',
      subtitle: 'Detailed breakdown & secondary telemetry',
      isPremium: true,
    },
    {
      id: 'slide-monthly',
      type: 'monthly_chart',
      title: '12-MONTH MOMENTUM',
      subtitle: 'Visual cadence and seasonal output',
      isPremium: true,
    },
    {
      id: 'slide-final',
      type: 'final_card',
      title: 'THE 2026 DOSSIER',
      subtitle: 'Your master snapshot, ready for stories',
      isPremium: true,
    },
  ];

  return isPremiumUnlocked ? [...baseSlides, ...premiumSlides] : baseSlides;
};

export const calculateArchetype = (category: CategoryType, primaryValue: number): {
  title: string;
  tagline: string;
  description: string;
  badgeLabel: string;
} => {
  switch (category) {
    case 'github':
      if (primaryValue > 2500) {
        return {
          title: 'Midnight Code Alchemist',
          tagline: 'Runs on Espresso, Dark Mode, and Refactoring Loops',
          description: 'You commit when the world sleeps, rewrite working code for fun, and live inside the terminal.',
          badgeLabel: 'TOP 1% COMMITTED',
        };
      }
      return {
        title: 'Precision Systems Architect',
        tagline: 'High-Impact Commits, Clean Architecture',
        description: 'You do not push fluff. Every commit you ship moves mountains and keeps the server green.',
        badgeLabel: 'TOP 5% CRAFTSMAN',
      };

    case 'spotify':
      if (primaryValue > 50000) {
        return {
          title: 'Sonic Nomad Explorer',
          tagline: 'Life is a Cinematic Soundtrack',
          description: 'Your headphones are fused to your skull. You traverse 80+ genres and live inside sound waves.',
          badgeLabel: 'TOP 1% STREAMER',
        };
      }
      return {
        title: 'Curated Taste Purist',
        tagline: 'Deep Grooves, Intentional Listening',
        description: 'You value album arcs over mindless radio shuffles, cultivating an uncompromised audio palette.',
        badgeLabel: 'TOP 10% AUDIOPHILE',
      };

    case 'gaming':
      if (primaryValue > 800) {
        return {
          title: 'The Relentless Boss Melter',
          tagline: 'Defeat is Just Another Calibration Phase',
          description: 'You refuse to lower difficulty, clear backlogs ruthlessly, and hunt achievements with military focus.',
          badgeLabel: 'TOP 2% COMPLETIONIST',
        };
      }
      return {
        title: 'The World Traveler',
        tagline: 'Immersive Storyline Connoisseur',
        description: 'You play for the lore, the atmospheric world-building, and unforgettable narrative climaxes.',
        badgeLabel: 'TOP 8% VIRTUAL TRAVELER',
      };

    case 'reading':
      return {
        title: 'The Omnivorous Book Vorpal',
        tagline: 'Escaping into Alternate Realities Nightly',
        description: 'Your bookshelves overflow. You digest dense non-fiction and speculative fiction with equal ferocity.',
        badgeLabel: 'TOP 1% LITERARY',
      };

    case 'fitness':
      return {
        title: 'The Relentless Pavement Crusher',
        tagline: 'Runs While the Rest of the City is Asleep',
        description: 'Zero excuses. Rain or heat, you lace up, clock the miles, and break personal records consistently.',
        badgeLabel: 'TOP 2% ENDURANCE',
      };

    case 'creator':
      return {
        title: 'The Viral Engine Builder',
        tagline: 'Transforms Raw Passion into Compounding Media',
        description: 'You test hooks over breakfast, turn random shower thoughts into case studies, and treat distribution like an art.',
        badgeLabel: 'TOP 1% CREATOR',
      };

    default:
      return {
        title: 'The Unstoppable Outlier',
        tagline: 'Building a Legacy One Day at a Time',
        description: 'Your discipline this year defied the odds. Consistent, driven, and unapologetically focused.',
        badgeLabel: 'TOP 3% ACHIEVER',
      };
  }
};
