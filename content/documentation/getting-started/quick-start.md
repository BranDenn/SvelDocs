---
description: How to clone the repo and get the boilerplate running.
---

## Setup

import * as Steps from '$ui/steps';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '$ui/tabs';

<Steps.Root>
	<Steps.Title>Clone the repository</Steps.Title>
	<Steps.Body>
		Run `git clone https://github.com/BranDenn/SvelDocs` to copy the project locally.
	</Steps.Body>

	<Steps.Title>Install packages</Steps.Title>
	<Steps.Body>
		<Tabs value="bun">
			<TabsList>
				<TabsTrigger value="bun">bun</TabsTrigger>
				<TabsTrigger value="npm">npm</TabsTrigger>
				<TabsTrigger value="pnpm">pnpm</TabsTrigger>
			</TabsList>
			<TabsContent value="bun">
				```bash
				bun install
				```
			</TabsContent>
			<TabsContent value="npm">
				```bash
				npm install
				```
			</TabsContent>
			<TabsContent value="pnpm">
				```bash
				pnpm install
				```
			</TabsContent>
		</Tabs>
	</Steps.Body>

	<Steps.Title>Start the dev server</Steps.Title>
	<Steps.Body>
		<Tabs value="bun">
			<TabsList>
				<TabsTrigger value="bun">bun</TabsTrigger>
				<TabsTrigger value="npm">npm</TabsTrigger>
				<TabsTrigger value="pnpm">pnpm</TabsTrigger>
			</TabsList>
			<TabsContent value="bun">
				```bash
				bun run dev
				```
			</TabsContent>
			<TabsContent value="npm">
				```bash
				npm run dev
				```
			</TabsContent>
			<TabsContent value="pnpm">
				```bash
				pnpm run dev
				```
			</TabsContent>
		</Tabs>
	</Steps.Body>
</Steps.Root>