import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { ActionManagerComponent } from './action-manager.component';
import { Battle, Creature, CreatureType, CombatStatus } from '../../../../core/domain/models/battle.model';

const playerCreature: Creature = {
  id: 'c1',
  name: 'Paladin',
  type: CreatureType.PLAYER,
  currentHp: 30,
  maxHp: 40,
  initiative: 12,
  armorClass: 18,
  isDefeated: false,
  effects: ['Poisoned']
};

const monsterCreature: Creature = {
  id: 'c2',
  name: 'Dragon',
  type: CreatureType.MONSTER,
  currentHp: 80,
  maxHp: 100,
  initiative: 15,
  armorClass: 20,
  isDefeated: false,
  effects: []
};

const mockBattle: Battle = {
  id: 'battle-1',
  name: 'Dragon Fight',
  status: CombatStatus.ACTIVE,
  creatures: [playerCreature, monsterCreature],
  currentTurn: 0,
  round: 1,
  createdAt: '2024-01-01T00:00:00Z',
  lastModified: '2024-01-01T00:00:00Z'
};

async function renderManager(initialTarget: Creature | null = playerCreature) {
  const user = userEvent.setup();
  const result = await render(ActionManagerComponent, {
    componentInputs: {
      battle: mockBattle,
      initialTarget
    }
  });
  return { user, ...result };
}

describe('ActionManagerComponent', () => {
  describe('target display', () => {
    it('shows initial target name', async () => {
      await renderManager();
      expect(screen.getByText('Paladin')).toBeTruthy();
    });

    it('switches target when another creature portrait is clicked', async () => {
      const { user, container } = await renderManager();
      const dragonPortrait = container.querySelector('[data-creature-id="c2"]') as HTMLElement;
      await user.click(dragonPortrait);
      expect(screen.getByText('Dragon')).toBeTruthy();
    });
  });

  describe('amount stepper', () => {
    it('starts at 0', async () => {
      const { container } = await renderManager();
      const amountEl = container.querySelector('[data-testid="amount"]');
      expect(amountEl?.textContent?.trim()).toBe('0');
    });

    it('increments amount on + click', async () => {
      const { user, container } = await renderManager();
      await user.click(screen.getByRole('button', { name: /increase amount/i }));
      const amountEl = container.querySelector('[data-testid="amount"]');
      expect(amountEl?.textContent?.trim()).toBe('1');
    });

    it('decrements amount on - click', async () => {
      const { user, container } = await renderManager();
      await user.click(screen.getByRole('button', { name: /increase amount/i }));
      await user.click(screen.getByRole('button', { name: /increase amount/i }));
      await user.click(screen.getByRole('button', { name: /decrease amount/i }));
      const amountEl = container.querySelector('[data-testid="amount"]');
      expect(amountEl?.textContent?.trim()).toBe('1');
    });

    it('does not go below 0', async () => {
      const { user, container } = await renderManager();
      await user.click(screen.getByRole('button', { name: /decrease amount/i }));
      const amountEl = container.querySelector('[data-testid="amount"]');
      expect(amountEl?.textContent?.trim()).toBe('0');
    });
  });

  describe('Apply Damage', () => {
    it('emits damageApplied with creature and amount', async () => {
      const { user, fixture } = await renderManager();
      const spy = vi.fn();
      fixture.componentInstance.damageApplied.subscribe(spy);

      await user.click(screen.getByRole('button', { name: /increase amount/i }));
      await user.click(screen.getByRole('button', { name: /increase amount/i }));
      await user.click(screen.getByRole('button', { name: /increase amount/i }));
      await user.click(screen.getByRole('button', { name: /apply damage/i }));

      expect(spy).toHaveBeenCalledWith({ creature: playerCreature, amount: 3 });
    });
  });

  describe('Apply Healing', () => {
    it('emits healingApplied with creature and amount', async () => {
      const { user, fixture } = await renderManager();
      const spy = vi.fn();
      fixture.componentInstance.healingApplied.subscribe(spy);

      await user.click(screen.getByRole('button', { name: /increase amount/i }));
      await user.click(screen.getByRole('button', { name: /apply healing/i }));

      expect(spy).toHaveBeenCalledWith({ creature: playerCreature, amount: 1 });
    });
  });

  describe('status effect toggles', () => {
    it('emits REMOVE action for effect already on target', async () => {
      const { user, fixture } = await renderManager();
      const spy = vi.fn();
      fixture.componentInstance.statusToggled.subscribe(spy);

      await user.click(screen.getByRole('button', { name: /Poisoned/i }));

      expect(spy).toHaveBeenCalledWith({ creature: playerCreature, effect: 'Poisoned', action: 'REMOVE' });
    });

    it('emits ADD action for effect not on target', async () => {
      const { user, fixture } = await renderManager();
      const spy = vi.fn();
      fixture.componentInstance.statusToggled.subscribe(spy);

      await user.click(screen.getByRole('button', { name: /Stunned/i }));

      expect(spy).toHaveBeenCalledWith({ creature: playerCreature, effect: 'Stunned', action: 'ADD' });
    });
  });

  describe('dice roll', () => {
    it('sets amount to a valid d6 range (1–6) after dice roll', async () => {
      const { user, container } = await renderManager();
      await user.click(screen.getByRole('button', { name: /d6/i }));
      const amountEl = container.querySelector('[data-testid="amount"]');
      const val = Number(amountEl?.textContent?.trim());
      expect(val).toBeGreaterThanOrEqual(1);
      expect(val).toBeLessThanOrEqual(6);
    });
  });

  describe('close button', () => {
    it('emits closed event when close is clicked', async () => {
      const { user, fixture } = await renderManager();
      const spy = vi.fn();
      fixture.componentInstance.closed.subscribe(spy);

      await user.click(screen.getByRole('button', { name: /close/i }));

      expect(spy).toHaveBeenCalledTimes(1);
    });
  });
});
