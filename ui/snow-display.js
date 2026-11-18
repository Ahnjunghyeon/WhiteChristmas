// A display-only transition. The physical snow budget remains in pile.profile.
export function settleSnowDisplay(pile, now) {
  if (!pile.displayProfile || pile.displayProfile.length !== pile.profile.length) {
    pile.displayProfile = pile.profile.slice();
    pile.displayAt = now;
    return pile.displayProfile;
  }
  const dt = Math.max(0, Math.min(.1, (now - pile.displayAt) / 1000));
  const blend = 1 - Math.exp(-dt / .085);
  for (let i = 0; i < pile.profile.length; i++) {
    const target = pile.profile[i], current = pile.displayProfile[i];
    pile.displayProfile[i] = Math.abs(target - current) < .03 ? target : current + (target - current) * blend;
  }
  pile.displayAt = now;
  return pile.displayProfile;
}

