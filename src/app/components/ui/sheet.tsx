import * as React from "react"
import * as SheetPrimitive from "@radix-ui/react-dialog"

interface SheetProps extends React.ComponentProps<typeof SheetPrimitive.Root> {
    children: React.ReactNode;
}

interface SheetContentProps extends React.ComponentProps<typeof SheetPrimitive.Content> {
    children: React.ReactNode;
}

interface SheetHeaderProps {
    children: React.ReactNode;
}

interface SheetTitleProps {
    children: React.ReactNode;
}

export function Sheet({ children, ...props }: SheetProps) {
    return <SheetPrimitive.Root {...props}>{children}</SheetPrimitive.Root>
}

export function SheetTrigger({ children, ...props }: any) {
    return <SheetPrimitive.Trigger {...props}>{children}</SheetPrimitive.Trigger>
}

export function SheetContent({ children, ...props }: SheetContentProps) {
    return (
        <SheetPrimitive.Portal>
            <SheetPrimitive.Overlay className="fixed inset-0 bg-black/50" />
            <SheetPrimitive.Content
                className="fixed right-0 top-0 h-full w-[400px] bg-white shadow-lg"
                {...props}
            >
                {children}
            </SheetPrimitive.Content>
        </SheetPrimitive.Portal>
    )
}

export function SheetHeader({ children }: SheetHeaderProps) {
    return <div className="px-6 py-4 border-b">{children}</div>
}

export function SheetTitle({ children }: SheetTitleProps) {
    return <SheetPrimitive.Title className="text-lg font-semibold">{children}</SheetPrimitive.Title>
}