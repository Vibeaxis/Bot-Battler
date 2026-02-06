import { cn } from '@/lib/utils';
import * as ToastPrimitives from '@radix-ui/react-toast';
import { cva } from 'class-variance-authority';
import { X, AlertTriangle, CheckCircle2, Info } from 'lucide-react'; 
import React from 'react';

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = React.forwardRef(({ className, ...props }, ref) => (
    <ToastPrimitives.Viewport
        ref={ref}
        className={cn(
            // Positioned Top-Right, below header
            'fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:top-20 sm:right-4 sm:bottom-auto sm:flex-col md:max-w-[420px]',
            className
        )}
        {...props}
    />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const toastVariants = cva(
    // ANIMATION UPDATES:
    // - Changed 'slide-in-from-right-full' to 'zoom-in-95' and 'fade-in-0'
    // - This creates a "Pop Up" effect rather than a "Slide In"
    'group relative pointer-events-auto flex w-full items-center justify-between space-x-4 overflow-hidden border-l-4 p-4 pr-8 shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-all data-[swipe=move]:transition-none data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95',
    {
        variants: {
            variant: {
                default: 
                    'bg-black/95 border-l-[var(--accent-color)] border-y border-r border-y-gray-800 border-r-gray-800 text-gray-100',
                destructive:
                    'bg-red-950/95 border-l-red-500 border-y border-r border-red-900/50 text-red-100',
                success: 
                    'bg-green-950/95 border-l-green-500 border-y border-r border-green-900/50 text-green-100',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    },
);

const Toast = React.forwardRef(({ className, variant, ...props }, ref) => {
    return (
        <ToastPrimitives.Root
            ref={ref}
            className={cn(toastVariants({ variant }), className)}
            {...props}
        />
    );
});
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastAction = React.forwardRef(({ className, ...props }, ref) => (
    <ToastPrimitives.Action
        ref={ref}
        className={cn(
            'inline-flex h-8 shrink-0 items-center justify-center border bg-transparent px-3 text-sm font-mono font-medium transition-colors hover:bg-white/10 focus:outline-none disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-red-500/30 group-[.destructive]:hover:border-red-500/30 group-[.destructive]:hover:bg-red-500/10 group-[.destructive]:hover:text-red-50',
            className,
        )}
        {...props}
    />
));
ToastAction.displayName = ToastPrimitives.Action.displayName;

const ToastClose = React.forwardRef(({ className, ...props }, ref) => (
    <ToastPrimitives.Close
        ref={ref}
        className={cn(
            'absolute right-2 top-2 p-1 text-white/50 opacity-0 transition-opacity hover:text-white focus:opacity-100 focus:outline-none group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50',
            className,
        )}
        toast-close=""
        {...props}
    >
        <X className="h-4 w-4" />
    </ToastPrimitives.Close>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

const ToastTitle = React.forwardRef(({ className, ...props }, ref) => (
    <ToastPrimitives.Title
        ref={ref}
        // Cyberpunk font style
        className={cn('text-sm font-bold font-mono uppercase tracking-widest [text-shadow:0_0_5px_currentColor]', className)}
        {...props}
    />
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = React.forwardRef(({ className, ...props }, ref) => (
    <ToastPrimitives.Description
        ref={ref}
        className={cn('text-xs font-mono opacity-80 mt-1', className)}
        {...props}
    />
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;

export {
    Toast,
    ToastAction,
    ToastClose,
    ToastDescription,
    ToastProvider,
    ToastTitle,
    ToastViewport,
};