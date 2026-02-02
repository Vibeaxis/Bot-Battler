
import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import React from 'react';
import { useSoundContext } from '@/context/SoundContext';

const buttonVariants = cva(
	'inline-flex items-center justify-center rounded-none text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 font-mono uppercase tracking-wider hover:[text-shadow:0_0_8px_var(--accent-color)] hover:text-[var(--accent-color)]',
	{
		variants: {
			variant: {
				default: 'bg-black border border-[var(--accent-color)] text-[var(--accent-color)] hover:bg-[rgba(var(--accent-rgb),0.1)]',
				destructive:
          'bg-red-900/50 border border-red-500 text-red-500 hover:bg-red-900/80 hover:text-red-400 hover:[text-shadow:0_0_8px_#ef4444]',
				outline:
          'border border-[var(--accent-color)] bg-transparent hover:bg-[rgba(var(--accent-rgb),0.1)] text-[var(--accent-color)]',
				secondary:
          'bg-[#0a0a12] text-[#e0e0e0] border border-gray-700 hover:bg-gray-800',
				ghost: 'hover:bg-[rgba(var(--accent-rgb),0.1)] hover:text-[var(--accent-color)]',
				link: 'text-[var(--accent-color)] underline-offset-4 hover:underline',
			},
			size: {
				default: 'h-10 px-4 py-2',
				sm: 'h-9 rounded-none px-3',
				lg: 'h-11 rounded-none px-8',
				icon: 'h-10 w-10',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	},
);

const Button = React.forwardRef(({ className, variant, size, asChild = false, onClick, ...props }, ref) => {
  const { playSound } = useSoundContext();
	const Comp = asChild ? Slot : 'button';
  
  const handleClick = (e) => {
    playSound('CLICK');
    if (onClick) onClick(e);
  };

	return (
		<Comp
			className={cn(buttonVariants({ variant, size, className }))}
			ref={ref}
      onClick={handleClick}
			{...props}
		/>
	);
});
Button.displayName = 'Button';

export { Button, buttonVariants };
