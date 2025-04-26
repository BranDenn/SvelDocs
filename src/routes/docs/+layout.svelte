<script lang="ts">
	import Header from '$lib/components/header';
	import Sidebar from '$lib/components/sidebar/sidebar.svelte';

	let { children } = $props();
</script>

<Header />

<div class="container flex grow">
	<Sidebar class="hidden border-r md:block overflow-y-auto">
		<div class="sticky top-0 h-8 bg-linear-to-b from-background"></div>
		<div class="px-8 flex flex-col">
			{#each { length: 50 }, i}
				<a class="border-l hover:border-l-secondary p-2">Item: {i}</a>
			{/each}
		</div>
		<div class="sticky bottom-0 h-8 bg-linear-to-t from-background"></div>
	</Sidebar>

	<main class="flex-1 p-8">
		Lorem ipsum dolor sit amet consectetur adipisicing elit. Ea non corporis beatae animi provident
		voluptas, cumque neque quaerat voluptatum saepe quidem deserunt, laborum blanditiis tempora
		exercitationem reprehenderit iure, eligendi odio. Laborum nobis ipsum inventore vero
		perferendis, minima excepturi suscipit architecto dolor veritatis voluptatibus minus commodi
		nulla quo nihil obcaecati quas iste ab consectetur. Aspernatur numquam incidunt rerum voluptatum
		voluptatibus totam. Nobis voluptate sapiente modi rem odit amet nulla, ratione expedita a
		inventore esse consequatur provident iste beatae aut, culpa, laudantium aspernatur nam dolorem?
		Fugiat, delectus earum accusamus exercitationem ea dolorem! Sapiente iusto quis accusamus nisi
		provident iste natus blanditiis, nemo quibusdam officiis repudiandae incidunt optio soluta
		accusantium! Dicta, ex expedita? Cum dolores dolore, velit provident alias expedita saepe magni
		assumenda! Excepturi aliquid corrupti assumenda velit quia repudiandae nemo officia nesciunt
		perferendis illum tempore aliquam blanditiis officiis modi hic quasi cumque maiores nisi quis at
		asperiores voluptatum, quisquam iure! At, eius.
	</main>

	<Sidebar class="hidden lg:block p-2">
		<div class="border bg-foreground rounded-lg p-2 text-sm">
			On this page
		</div>
	</Sidebar>
</div>
