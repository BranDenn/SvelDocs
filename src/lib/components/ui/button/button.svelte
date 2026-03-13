<script lang="ts" module>
	import { cn } from '$utils';
	import type { WithElementRef } from 'bits-ui';
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';
	import { type VariantProps, tv } from 'tailwind-variants';

	export const buttonVariants = tv({
		base: 'inline-flex shrink-0 items-center justify-center gap-2 text-sm font-medium whitespace-nowrap transition-all outline-none [&_svg]:pointer-events-none [&_svg]:shrink-0',
		variants: {
			variant: {
				default: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs',
				secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-xs',
				destructive: 'bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-xs',
				outline:
					'bg-card text-foreground hover:bg-background border shadow-xs disabled:hover:bg-background/90 aria-disabled:hover:bg-background/90',
				'outline-secondary':
					'bg-background text-foreground hover:bg-background/90 hover:border-foreground border shadow-xs disabled:hover:bg-background/90 aria-disabled:hover:bg-background/90',
				'outline-destructive':
					'bg-background hover:bg-background/90 hover:border-foreground border shadow-xs disabled:hover:bg-background/90 aria-disabled:hover:bg-background/90',
				ghost: 'hover:bg-muted rounded-sm hover:shadow',
				link: 'text-primary underline-offset-4 hover:underline',
				foreground: 'bg-foreground hover:bg-foreground/90 shadow-xs text-background'
			},
			size: {
				default: 'gap-2 px-4 py-2 has-[>svg]:px-3 [&_svg]:size-4 text-sm',
				sm: 'gap-2 px-4 py-2 has-[>svg]:px-2.5 [&_svg]:size-3.5 text-xs',
				lg: 'gap-2 px-6 py-3 has-[>svg]:px-4 [&_svg]:size-4.5 text-base',
				icon: 'p-2 [&_svg]:size-4',
				'icon-sm': 'p-2 [&_svg]:size-3.5',
				'icon-lg': 'p-2 [&_svg]:size-4.5'
			}
		},
		defaultVariants: {
			variant: 'default',
			size: 'default'
		}
	});

	export type ButtonVariant = VariantProps<typeof buttonVariants>['variant'];
	export type ButtonSize = VariantProps<typeof buttonVariants>['size'];

	export type ButtonProps = WithElementRef<HTMLButtonAttributes> &
		WithElementRef<HTMLAnchorAttributes> & {
			variant?: ButtonVariant;
			size?: ButtonSize;
		};
</script>

<script lang="ts">
	let {
		class: className,
		variant = 'default',
		size = 'default',
		ref = $bindable(null),
		href = undefined,
		type = 'button',
		disabled,
		children,
		...restProps
	}: ButtonProps = $props();
</script>

{#if href}
	<a
		bind:this={ref}
		data-slot="button"
		class={cn(buttonVariants({ variant, size }), className)}
		href={disabled ? undefined : href}
		aria-disabled={disabled}
		role={disabled ? 'link' : undefined}
		tabindex={disabled ? -1 : undefined}
		{...restProps}
	>
		{@render children?.()}
	</a>
{:else}
	<button
		bind:this={ref}
		data-slot="button"
		class={cn(buttonVariants({ variant, size }), className)}
		{type}
		{disabled}
		{...restProps}
	>
		{@render children?.()}
	</button>
{/if}
