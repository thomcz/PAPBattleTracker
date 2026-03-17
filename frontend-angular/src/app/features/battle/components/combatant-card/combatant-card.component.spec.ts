import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { CombatantCardComponent } from './combatant-card.component';
import { Creature, CreatureType } from '../../../../core/domain/models/battle.model';

const baseCreature: Creature = {
  id: 'c1',
  name: 'Aragorn',
  type: CreatureType.PLAYER,
  currentHp: 40,
  maxHp: 60,
  initiative: 5,
  armorClass: 16,
  isDefeated: false,
  effects: []
};

async function renderCard(overrides: Partial<{
  creature: Creature;
  isActive: boolean;
  showInitiative: boolean;
}> = {}) {
  const user = userEvent.setup();
  const result = await render(CombatantCardComponent, {
    componentInputs: {
      creature: overrides.creature ?? baseCreature,
      isActive: overrides.isActive ?? false,
      showInitiative: overrides.showInitiative ?? false
    }
  });
  return { user, ...result };
}

describe('CombatantCardComponent', () => {
  describe('HP bar color', () => {
    it('shows healthy class when HP > 50%', async () => {
      const creature = { ...baseCreature, currentHp: 50, maxHp: 60 }; // ~83%
      const { container } = await renderCard({ creature });
      const bar = container.querySelector('.hp-bar-fill');
      expect(bar?.classList).toContain('hp-healthy');
    });

    it('shows wounded class when HP is 25–50%', async () => {
      const creature = { ...baseCreature, currentHp: 20, maxHp: 60 }; // ~33%
      const { container } = await renderCard({ creature });
      const bar = container.querySelector('.hp-bar-fill');
      expect(bar?.classList).toContain('hp-wounded');
    });

    it('shows critical class when HP <= 25%', async () => {
      const creature = { ...baseCreature, currentHp: 10, maxHp: 60 }; // ~17%
      const { container } = await renderCard({ creature });
      const bar = container.querySelector('.hp-bar-fill');
      expect(bar?.classList).toContain('hp-critical');
    });

    it('shows critical class at exactly 25%', async () => {
      const creature = { ...baseCreature, currentHp: 15, maxHp: 60 }; // exactly 25%
      const { container } = await renderCard({ creature });
      const bar = container.querySelector('.hp-bar-fill');
      expect(bar?.classList).toContain('hp-critical');
    });
  });

  describe('active state', () => {
    it('applies active class when isActive is true', async () => {
      const { container } = await renderCard({ isActive: true });
      const card = container.querySelector('.combatant-card');
      expect(card?.classList).toContain('active');
    });

    it('does not apply active class when isActive is false', async () => {
      const { container } = await renderCard({ isActive: false });
      const card = container.querySelector('.combatant-card');
      expect(card?.classList).not.toContain('active');
    });

    it('shows CURRENT label when isActive is true', async () => {
      await renderCard({ isActive: true });
      expect(screen.getByText('CURRENT')).toBeTruthy();
    });

    it('hides CURRENT label when isActive is false', async () => {
      await renderCard({ isActive: false });
      expect(screen.queryByText('CURRENT')).toBeNull();
    });
  });

  describe('click event', () => {
    it('emits clicked event when card is clicked', async () => {
      const { user, fixture } = await renderCard();
      const clickedSpy = vi.fn();
      fixture.componentInstance.clicked.subscribe(clickedSpy);

      const card = screen.getByRole('button');
      await user.click(card);

      expect(clickedSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('status effects', () => {
    it('renders effect chips for each status effect', async () => {
      const creature = { ...baseCreature, effects: ['Poisoned', 'Stunned'] };
      await renderCard({ creature });
      expect(screen.getByText('Poisoned')).toBeTruthy();
      expect(screen.getByText('Stunned')).toBeTruthy();
    });

    it('renders no chips when effects list is empty', async () => {
      const { container } = await renderCard();
      const chips = container.querySelectorAll('.effect-chip');
      expect(chips.length).toBe(0);
    });
  });

  describe('initiative badge', () => {
    it('shows initiative when showInitiative is true', async () => {
      await renderCard({ showInitiative: true });
      expect(screen.getByText('5')).toBeTruthy();
    });

    it('hides initiative when showInitiative is false', async () => {
      const { container } = await renderCard({ showInitiative: false });
      const badge = container.querySelector('.initiative-badge');
      expect(badge).toBeNull();
    });
  });

  describe('display values', () => {
    it('shows creature name', async () => {
      await renderCard();
      expect(screen.getByText('Aragorn')).toBeTruthy();
    });

    it('shows current and max HP', async () => {
      await renderCard();
      expect(screen.getByText(/40\s*\/\s*60/)).toBeTruthy();
    });

    it('shows armor class', async () => {
      await renderCard();
      expect(screen.getByText('16')).toBeTruthy();
    });
  });
});
