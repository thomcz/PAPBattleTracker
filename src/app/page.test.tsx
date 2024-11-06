import '@testing-library/jest-dom'
import {render, screen} from '@testing-library/react'
import Home from "@/app/page";
import userEvent from '@testing-library/user-event'
import {createCreature, createDragon, createKnight} from '@/app/test/factories/creatureFactory'

describe('Home', () => {
    const user = userEvent.setup()

    beforeEach(() => {
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

        // Next turn - verify Knight is highlighted
        const nextTurnButton = screen.getByRole('button', {name: /nextTurnButton/i});
        await user.click(nextTurnButton);
        const knightDiv = screen.getByText('Knight').closest('div');
        expect(knightDiv?.parentElement?.parentElement).toHaveClass('bg-yellow-100');

        // Next turn again - verify Round 2 started and Dragon is highlighted
        await user.click(nextTurnButton);
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

    it('deals damage when knight attack dragon during combat', async () => {

        // Add Dragon and Knight to the battle
        await createDragon(user);
        await createKnight(user);

        // Start combat
        const startButton = screen.getByRole('button', {name: /startCombatButton/i});
        await user.click(startButton);

        // Move to Knight's turn
        const nextTurnButton = screen.getByRole('button', {name: /nextTurnButton/i});
        await user.click(nextTurnButton);

        // Initiate attack on Dragon
        const attackButtons = screen.getAllByRole('button', {name: /attackButton/i});
        await user.click(attackButtons[0]); // Attack the Dragon (first creature)

        // Enter damage in attack dialog
        const damageInput = screen.getByLabelText('damageInput');
        await user.type(damageInput, '42');

        // Confirm attack
        const confirmAttackButton = screen.getByLabelText('confirmAttackButton');
        await user.click(confirmAttackButton);

        // Verify Dragon's HP is reduced by 42 (from 100 to 58)
        const dragonHP = screen.getByText('58/100');
        expect(dragonHP).toBeInTheDocument();
    });

    it('applies and removes an effect from a creature during combat', async () => {
        // Add Dragon and Knight to the battle
        await createDragon(user);
        await createKnight(user);

        // Start combat
        const startButton = screen.getByRole('button', {name: /startCombatButton/i});
        await user.click(startButton);

        // Move to Knight's turn
        const nextTurnButton = screen.getByRole('button', {name: /nextTurnButton/i});
        await user.click(nextTurnButton);
        // Initiate attack on Dragon
        const attackButtons = screen.getAllByRole('button', {name: /attackButton/i});
        await user.click(attackButtons[0]); // Attack the Dragon (first creature)

        // Enter damage in attack dialog
        const damageInput = screen.getByLabelText('damageInput');
        await user.type(damageInput, '0');

        // Enter effect in dialog
        const effectInput = screen.getByLabelText('effectInput');
        await user.type(effectInput, 'Stunned');

        // Confirm attack
        const confirmAttackButton = screen.getByLabelText('confirmAttackButton');
        await user.click(confirmAttackButton);

        // Verify effect is added
        const effectBadge = screen.getByText('Stunned');
        expect(effectBadge).toBeInTheDocument();

        // Remove effect by clicking on it
        await user.click(effectBadge);

        // Verify effect is removed
        expect(screen.queryByText('Stunned')).not.toBeInTheDocument();
    });
});
