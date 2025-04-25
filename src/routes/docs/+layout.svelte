<script lang="ts">
	import Header from '$lib/components/header';
	import Sidebar from '$lib/components/sidebar/sidebar.svelte';

	let { children } = $props();
</script>

<Header />

<div class="container flex grow">
	<Sidebar class="hidden border-r md:block">
		Lorem ipsum dolor sit, amet consectetur adipisicing elit. Amet optio voluptatibus distinctio
		ullam, quod quasi? Necessitatibus, dolorem ut sapiente debitis consectetur, atque quos
		consequuntur rerum, provident iure quam molestiae et. Officiis magnam consequuntur perspiciatis
		voluptas a. Consequuntur ex illo vero tempora minima qui obcaecati nisi explicabo saepe quasi
		odit dolorum doloribus eligendi alias nulla, aliquid in, distinctio soluta quam debitis. Alias
		eligendi delectus quaerat in dicta temporibus odit blanditiis voluptate illum doloribus tempore
		molestiae ut voluptas praesentium explicabo nostrum voluptatibus ratione assumenda neque
		inventore, maxime voluptatem velit a dolorum! Iste! Ut et explicabo perferendis assumenda
		exercitationem recusandae ea accusamus. Animi, blanditiis repellat minima assumenda quidem
		accusamus necessitatibus recusandae porro deserunt. Aliquam reprehenderit delectus modi
		repellendus similique quisquam nobis consequuntur est. Neque deserunt asperiores itaque, fuga
		dolore at nostrum aperiam sunt dolorem molestiae harum eligendi natus dignissimos cumque
		necessitatibus error consequatur architecto sapiente praesentium enim quos odit excepturi!
		Voluptatibus, quidem ab.
	</Sidebar>

	<main class="flex-1 p-4">
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

	<Sidebar class="hidden lg:block">On this page</Sidebar>
</div>
