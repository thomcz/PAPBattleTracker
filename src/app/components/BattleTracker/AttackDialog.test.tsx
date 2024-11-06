import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AttackDialog from './AttackDialog'

describe('AttackDialog', () => {
    const user = userEvent.setup()
    const mockOnClose = jest.fn()
    const mockOnAttack = jest.fn()
    const targetName = 'Dragon'

    beforeEach(() => {
        mockOnClose.mockClear()
        mockOnAttack.mockClear()
    })

    it('renders when isOpen is true', () => {
        render(
            <AttackDialog
                isOpen={true}
                onClose={mockOnClose}
                onAttack={mockOnAttack}
                targetName={targetName}
            />
        )

        expect(screen.getByText(`Attack ${targetName}`)).toBeInTheDocument()
        expect(screen.getByLabelText('damageInput')).toBeInTheDocument()
        expect(screen.getByLabelText('effectInput')).toBeInTheDocument()
    })

    it('does not render when isOpen is false', () => {
        render(
            <AttackDialog
                isOpen={false}
                onClose={mockOnClose}
                onAttack={mockOnAttack}
                targetName={targetName}
            />
        )

        expect(screen.queryByText(`Attack ${targetName}`)).not.toBeInTheDocument()
    })

    it('calls onClose when close button is clicked', async () => {
        render(
            <AttackDialog
                isOpen={true}
                onClose={mockOnClose}
                onAttack={mockOnAttack}
                targetName={targetName}
            />
        )

        const closeButton = screen.getByLabelText('closeAttackDialog')
        await user.click(closeButton)

        expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('submits damage and effect when form is submitted', async () => {
        render(
            <AttackDialog
                isOpen={true}
                onClose={mockOnClose}
                onAttack={mockOnAttack}
                targetName={targetName}
            />
        )

        const damageInput = screen.getByLabelText('damageInput')
        const effectInput = screen.getByLabelText('effectInput')
        const submitButton = screen.getByLabelText('confirmAttackButton')

        await user.type(damageInput, '25')
        await user.type(effectInput, 'Stunned')
        await user.click(submitButton)

        expect(mockOnAttack).toHaveBeenCalledWith(25, 'Stunned')
        expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('submits damage without effect when effect is empty', async () => {
        render(
            <AttackDialog
                isOpen={true}
                onClose={mockOnClose}
                onAttack={mockOnAttack}
                targetName={targetName}
            />
        )

        const damageInput = screen.getByLabelText('damageInput')
        const submitButton = screen.getByLabelText('confirmAttackButton')

        await user.type(damageInput, '30')
        await user.click(submitButton)

        expect(mockOnAttack).toHaveBeenCalledWith(30, undefined)
        expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('does not submit when damage is invalid', async () => {
        render(
            <AttackDialog
                isOpen={true}
                onClose={mockOnClose}
                onAttack={mockOnAttack}
                targetName={targetName}
            />
        )

        const damageInput = screen.getByLabelText('damageInput')
        const submitButton = screen.getByLabelText('confirmAttackButton')

        await user.type(damageInput, 'invalid')
        await user.click(submitButton)

        expect(mockOnAttack).not.toHaveBeenCalled()
        expect(mockOnClose).not.toHaveBeenCalled()
    })
})
