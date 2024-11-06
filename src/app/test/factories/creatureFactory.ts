import {screen} from "@testing-library/react";

interface CreatureInput {
    name: string;
    initiative: string;
    hp: string;
    ac: string;
}

export const createCreature = async (
    user: any,
    {name, initiative, hp, ac}: CreatureInput
) => {
    const openDialogButton = screen.getByRole('button', {name: /openCreatureDialogButton/i});
    await user.click(openDialogButton);

    await user.type(screen.getByRole('textbox', {name: /creatureNameInput/i}), name);
    await user.type(screen.getByRole('spinbutton', {name: /initiativeInput/i}), initiative);
    await user.type(screen.getByRole('spinbutton', {name: /hpInput/i}), hp);
    await user.type(screen.getByRole('spinbutton', {name: /armorClassInput/i}), ac);

    await user.click(screen.getByRole('button', {name: /addCreatureButton/i}));
};

const PREDEFINED_CREATURES = {
    knight: {
        name: 'Knight',
        initiative: '15',
        hp: '50',
        ac: '18'
    },
    dragon: {
        name: 'Dragon',
        initiative: '20',
        hp: '100',
        ac: '19'
    }
} as const;

export const createKnight = async (user: any) => {
    return createCreature(user, PREDEFINED_CREATURES.knight);
};

export const createDragon = async (user: any) => {
    return createCreature(user, PREDEFINED_CREATURES.dragon);
};
