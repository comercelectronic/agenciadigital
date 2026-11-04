const test = require('node:test');
const assert = require('node:assert/strict');
const { MAX_GIGS, MAX_OFFERS, limitGigCatalog, createGigOffers } = require('../js/side-missions.js');

function missionsByStage(countPerStage = 3, lastStage = 7) {
  return Array.from({ length: lastStage }, (_, index) =>
    Array.from({ length: countPerStage }, (__, n) => ({
      id: `stage-${index + 1}-${n}`,
      minStage: index + 1,
      pay: 100 + (index + 1) * 10
    }))
  ).flat();
}

test('limits the side-mission catalog to 20 entries', () => {
  const catalog = Array.from({ length: MAX_GIGS + 5 }, (_, i) => ({ id: `gig-${i}` }));

  assert.equal(limitGigCatalog(catalog).length, MAX_GIGS);
  assert.deepEqual(limitGigCatalog(catalog).map(gig => gig.id), catalog.slice(0, MAX_GIGS).map(gig => gig.id));
});

test('offers at most three unique missions and always includes the hardest unlocked one', () => {
  const catalog = missionsByStage();

  for (let stage = 1; stage <= 8; stage++) {
    const offers = createGigOffers(catalog, stage, () => 0.42);
    const unlockedDifficulty = Math.min(stage, 7);
    const byId = new Map(catalog.map(gig => [gig.id, gig]));

    assert.ok(offers.length <= MAX_OFFERS);
    assert.equal(new Set(offers.map(gig => gig.id)).size, offers.length);
    assert.ok(offers.some(gig => byId.get(gig.id).minStage === unlockedDifficulty));
    assert.ok(offers.every(gig => byId.get(gig.id).minStage >= Math.max(1, unlockedDifficulty - 2)));
  }
});

test('randomizes the missions offered within the current difficulty range', () => {
  const catalog = missionsByStage();
  const first = createGigOffers(catalog, 5, () => 0);
  const second = createGigOffers(catalog, 5, () => 0.99);

  assert.notDeepEqual(first.map(gig => gig.id), second.map(gig => gig.id));
});

test('never offers completed missions again, including after refreshing offers', () => {
  const catalog = missionsByStage();
  const completed = catalog.slice(0, 5).map(gig => gig.id);
  const firstOffers = createGigOffers(catalog, 7, () => 0.25, completed);
  const refreshedOffers = createGigOffers(catalog, 7, () => 0.75, completed);

  assert.ok(firstOffers.every(gig => !completed.includes(gig.id)));
  assert.ok(refreshedOffers.every(gig => !completed.includes(gig.id)));
  assert.deepEqual(createGigOffers(catalog, 7, () => 0.5, catalog.map(gig => gig.id)), []);
});

test('scales rewards with stage and handles empty or small catalogs', () => {
  const catalog = missionsByStage(1, 3);
  const early = createGigOffers(catalog, 1, () => 0.5);
  const late = createGigOffers(catalog, 3, () => 0.5);
  const repeatable = [{ id: 'repeatable', pay: 100 }];
  const earlyReward = createGigOffers(repeatable, 1)[0];
  const lateReward = createGigOffers(repeatable, 8)[0];

  assert.equal(early.length, 1);
  assert.equal(late.length, 3);
  assert.ok(late.every(gig => gig.xp > early[0].xp));
  assert.ok(lateReward.xp > earlyReward.xp);
  assert.ok(lateReward.pay > earlyReward.pay);
  assert.deepEqual(createGigOffers([], 5), []);
});
