import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"

interface DialogProps extends React.ComponentProps<typeof DialogPrimitive.Root> {
    children: React.ReactNode;
}

interface DialogContentProps extends React.ComponentProps<typeof DialogPrimitive.Content> {
    children: React.ReactNode;
}

interface DialogHeaderProps {
    children: React.ReactNode;
}

interface DialogTitleProps {
    children: React.ReactNode;
}

export function Dialog({ children, ...props }: DialogProps) {
    return <DialogPrimitive.Root {...props}>{children}</DialogPrimitive.Root>
}
export function DialogContent({ children, ...props }: DialogContentProps) {
    return (
        <DialogPrimitive.Portal>
            <DialogPrimitive.Overlay className="fixed inset-0 bg-black/50" />
            <DialogPrimitive.Content
                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg"
                {...props}
            >
                {children}
            </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
    )
}

export function DialogHeader({ children }: DialogHeaderProps) {
    return <div className="px-6 py-4 border-b">{children}</div>
}

export function DialogTitle({ children }: DialogTitleProps) {
    return <DialogPrimitive.Title className="text-lg font-semibold">{children}</DialogPrimitive.Title>
}