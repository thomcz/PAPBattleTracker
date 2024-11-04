interface CreatureInput {
    name: string;
    initiative: string;
    hp: string;
    ac: string;
}

export const createCreature = async (
    user: any,
    {name, initiative, hp, ac}: CreatureInput,
    {
        nameInput,
        initiativeInput,
        hpInput,
        acInput,
        addButton
    }: any
) => {
    await user.type(nameInput, name);
    await user.type(initiativeInput, initiative);
    await user.type(hpInput, hp);
    await user.type(acInput, ac);
    await user.click(addButton);
};

export const createKnight = async (user: any, elements: any) => {
    return createCreature(
        user,
        {
            name: 'Knight',
            initiative: '15',
            hp: '50',
            ac: '18'
        },
        elements
    );
};

export const createDragon = async (user: any, elements: any) => {
    return createCreature(
        user,
        {
            name: 'Dragon',
            initiative: '20',
            hp: '100',
            ac: '19'
        },
        elements
    );
};
