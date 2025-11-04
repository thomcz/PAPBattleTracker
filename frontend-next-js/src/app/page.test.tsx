import '@testing-library/jest-dom'
import {render, screen} from '@testing-library/react'
import Home from "@/app/page";
import userEvent from '@testing-library/user-event'
import {createCreature, createDragon, createKnight} from '@/app/test/factories/creatureFactory'

// Mock localStorage
const localStorageMock = (() => {
    let store: { [key: string]: string } = {};
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
            store[key] = value.toString();
        },
        clear: () => {
            store = {};
        }
    };
})();

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
});

describe('Home', () => {
    const user = userEvent.setup()

    beforeEach(() => {
        localStorage.clear();
        render(<Home/>)
    })

    it('renders a heading', () => {

        const heading = screen.getByRole('heading', {name: 'Battle Tracker'})

        expect(heading).toBeInTheDocument()
    })
    it('adds a creature and checks if it appears in the list', async () => {

        await createCreature(user, {
            name: 'Goblin',
            initiative: '15',
            hp: '30',
            ac: '14'
        });

        // Check if the creature appears in the list
        const creatureName = screen.getByText('Goblin');
        const creatureInitiative = screen.getByRole('spinbutton', {name: 'editInitiative'});
        const creatureHP = screen.getByText('30/30');
        const creatureAC = screen.getByRole('spinbutton', {name: 'editArmorClass'});

        expect(creatureName).toBeInTheDocument();
        expect(creatureInitiative).toHaveValue(15);
        expect(creatureHP).toBeInTheDocument();
        expect(creatureAC).toHaveValue(14);
    });


    it('adds a creature and then removes it from the list', async () => {

        await createCreature(user, {
            name: 'Orc',
            initiative: '10',
            hp: '40',
            ac: '16'
        });

        // Check if the creature appears in the list
        const creatureName = screen.getByText('Orc');
        expect(creatureName).toBeInTheDocument();

        // Remove the creature
        const removeButton = screen.getByRole('button', {name: /removeCreatureButton/i});
        await user.click(removeButton);

        // Check if the creature is removed from the list
        expect(screen.queryByText('Orc')).not.toBeInTheDocument();
    });

    it('adds two creatures and reduces health of one', async () => {

        await createDragon(user);

        await createKnight(user);

        // Find the decrease HP button for Knight
        const decreaseButtons = screen.getAllByRole('button', {name: '-'});

        // Click decrease button 5 times
        for (let i = 0; i < 5; i++) {
            await user.click(decreaseButtons[1]); // Second creature's decrease button
        }

        // Verify Knight's HP is reduced by 5
        const knightHP = screen.getByText('45/50');
        expect(knightHP).toBeInTheDocument();
    });

    it('verifies combat flow with two creatures', async () => {
        await createDragon(user);
        await createKnight(user);

        // Start combat
        const startButton = screen.getByRole('button', {name: /startCombatButton/i});
        await user.click(startButton);

        // Verify Round 1 and first creature (Dragon) is highlighted
        expect(screen.getByText('Round 1')).toBeInTheDocument();
        const dragonDiv = screen.getByText('Dragon').closest('div');

        expect(dragonDiv?.parentElement?.parentElement).toHaveClass('bg-yellow-100');

        // Initiate attack on Knight
        await attackCreature(1, '42');

        // After Attack Next turn start - verify Knight is highlighted
        const knightDiv = screen.getByText('Knight').closest('div');
        expect(knightDiv?.parentElement?.parentElement).toHaveClass('bg-yellow-100');

        // Initiate attack on Dragon
        await attackCreature(0, '42');
        // Next turn again - verify Round 2 started and Dragon is highlighted
        expect(screen.getByText('Round 2')).toBeInTheDocument();
        expect(dragonDiv?.parentElement?.parentElement).toHaveClass('bg-yellow-100');

        // Pause combat
        const pauseButton = screen.getByRole('button', {name: /pauseCombatButton/i});
        await user.click(pauseButton);

        // Verify combat controls are replaced with start button
        expect(screen.queryByRole('button', {name: /pauseCombatButton/i})).not.toBeInTheDocument();
        expect(screen.queryByRole('button', {name: /nextTurnButton/i})).not.toBeInTheDocument();
        expect(screen.getByRole('button', {name: /startCombatButton/i})).toBeInTheDocument();
    });

    async function attackCreature(creatureIndex: number, damage: string, effect?: string) {
        const attackButtons = screen.getAllByRole('button', {name: /attackButton/i});
        await user.click(attackButtons[creatureIndex]);

        // Enter damage in attack dialog
        const damageInput = screen.getByLabelText('damageInput');
        await user.type(damageInput, damage);

        if (effect) {
            // Enter effect in dialog
            const effectInput = screen.getByLabelText('effectInput');
            await user.type(effectInput, effect);
        }

        // Confirm attack
        const confirmAttackButton = screen.getByLabelText('confirmAttackButton');
        await user.click(confirmAttackButton);
    }

    it('deals damage when knight attack dragon during combat', async () => {

        // Add Dragon and Knight to the battle
        await createDragon(user);
        await createKnight(user);

        // Start combat
        const startButton = screen.getByRole('button', {name: /startCombatButton/i});
        await user.click(startButton);

        // Initiate attack on Knight
        await attackCreature(1, '42');

        // Verify Knight's HP is reduced by 42 (from 8 to 50)
        const knightHP = screen.getByText('8/50');
        expect(knightHP).toBeInTheDocument();
    });

    it('applies and removes an effect from a creature during combat', async () => {
        // Add Dragon and Knight to the battle
        await createDragon(user);
        await createKnight(user);

        // Start combat
        const startButton = screen.getByRole('button', {name: /startCombatButton/i});
        await user.click(startButton);

        // Initiate attack on Knight
        await attackCreature(1, '42', 'Stunned');

        // Verify effect is added
        const effectBadge = screen.getByText('Stunned');
        expect(effectBadge).toBeInTheDocument();

        // Remove effect by clicking on it
        await user.click(effectBadge);

        // Verify effect is removed
        expect(screen.queryByText('Stunned')).not.toBeInTheDocument();
    });

    it('loads state from localStorage', async () => {

        // Set up a new state in localStorage
        const newState = {
            creatures: [{
                id: 1,
                name: 'TestCreature',
                initiative: 15,
                currentHP: 20,
                maxHP: 20,
                armorClass: 16,
                type: 'monster'
            }],
            isCombatActive: false,
            currentTurn: 0,
            round: 1,
            combatLog: []
        };
        localStorage.setItem('battleTrackerState', JSON.stringify(newState));

        // Re-render the component
        render(<Home/>);

        // Verify the state was loaded
        expect(screen.getByText('TestCreature')).toBeInTheDocument();
        const armorClassInput = screen.getAllByRole('spinbutton', {name: 'editArmorClass'})[0];

        expect(armorClassInput).toHaveValue(16);
    });

    it('writes state to localStorage when adding a creature', async () => {
        // Add a creature
        await createCreature(user, {
            name: 'StorageTest',
            initiative: '12',
            hp: '25',
            ac: '15'
        });

        // Get the stored state from localStorage
        const storedState = JSON.parse(localStorage.getItem('battleTrackerState') || '{}');

        // Verify the creature was stored
        expect(storedState.creatures).toHaveLength(1);
        expect(storedState.creatures[0].name).toBe('StorageTest');
        expect(storedState.creatures[0].initiative).toBe(12);
        expect(storedState.creatures[0].currentHP).toBe(25);
        expect(storedState.creatures[0].maxHP).toBe(25);
        expect(storedState.creatures[0].armorClass).toBe(15);
    });
});
