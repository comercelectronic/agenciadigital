/* Agència Digital — selecció d'encàrrecs lliures */
(function () {
  'use strict';

  const root = typeof window !== 'undefined' ? window : globalThis;
  const GD = root.GD || (root.GD = {});
  const MAX_GIGS = 20;
  const MAX_OFFERS = 3;

  function limitGigCatalog(gigs) {
    return (Array.isArray(gigs) ? gigs : []).slice(0, MAX_GIGS);
  }

  function difficulty(gig) {
    return Math.max(1, Math.floor(Number(gig.minStage) || 1));
  }

  function shuffled(items, random) {
    const result = items.slice();
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  function createGigOffers(gigs, currentStage, random, completedIds) {
    const stage = Math.max(1, Math.floor(Number(currentStage) || 1));
    const rand = random || Math.random;
    const completed = new Set(Array.isArray(completedIds) ? completedIds : []);
    const unlocked = limitGigCatalog(gigs).filter(gig =>
      difficulty(gig) <= stage && !completed.has(gig.id)
    );
    if (!unlocked.length) return [];

    const highestDifficulty = Math.max(...unlocked.map(difficulty));
    const hardest = shuffled(unlocked.filter(gig => difficulty(gig) === highestDifficulty), rand);
    const selected = [hardest[0]];
    const selectedIds = new Set(selected.map(gig => gig.id));
    const difficultyFloor = Math.max(1, highestDifficulty - 2);
    const recent = shuffled(unlocked.filter(gig =>
      difficulty(gig) >= difficultyFloor && !selectedIds.has(gig.id)
    ), rand);
    const fallback = shuffled(unlocked.filter(gig =>
      difficulty(gig) < difficultyFloor && !selectedIds.has(gig.id)
    ), rand);

    for (const gig of recent.concat(fallback)) {
      if (selected.length >= MAX_OFFERS) break;
      if (!selectedIds.has(gig.id)) {
        selected.push(gig);
        selectedIds.add(gig.id);
      }
    }

    return selected.map(gig => ({
      id: gig.id,
      pay: Math.round((gig.pay || 180) * (0.8 + 0.25 * stage) / 10) * 10,
      xp: 50 + 22 * stage
    }));
  }

  GD.limitGigCatalog = limitGigCatalog;
  GD.createGigOffers = createGigOffers;
  GD.gigs = limitGigCatalog(GD.gigs);

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MAX_GIGS, MAX_OFFERS, limitGigCatalog, createGigOffers };
  }
})();
