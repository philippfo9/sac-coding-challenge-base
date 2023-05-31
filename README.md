# SAC Coding Challenge

Welcome to the SAC coding challenge. This repository should be forked and be used as a starting point to the coding challenge.

Our goal is to hire someone that contributes to building apps in a productive way and is very output way. We want to work by the principle of KISS - keep it stupid, simple.
We think solutions designed to solve the problem in a direct manner are better than complex structures.

The goal of the challenge is to show your coding skills
- building intuitive user experiences
- using frameworks like NextJS and Typescript to build full-stack apps
- show you can work on your own with high-level requirements from an UI perspective.

The tutorial should also give you an insight into our tech stack.

We're using [chakra-ui](https://github.com/chakra-ui/chakra-ui) as the component library within a Next.js app (React) with TypeScript.

Next.js and chakra-ui have built-in TypeScript declarations, so we'll get autocompletion for their modules straight away.

We are connecting the Next.js `_app.js` with `chakra-ui`'s Provider and theme so the pages can have app-wide dark/light mode. We are also creating some components which shows the usage of `chakra-ui`'s style props.

## Starting point

If you look through the repository, you see three main folders.
One of them is focused on tasks surrounding Monet, one of them surrounding PayLeaf and one is more generic.
Each task will let you know where to start.

To get started:
1. Navigate to your terminal in the root folder of this repo.
2. Make sure to have Docker and docker-compose installed. Inside docker-compose.yml, we prepare the config for a local MySQL database.
3. Run `npm run start-infra` which spins up the local MySQL database.
4. Please navigate to the folder of your specific challenge in a terminal and do the following:
5. Run `npm install`
6. As a database ORM, we're using [Prisma](https://www.prisma.io/) - have a look at the 'prisma' folder, which contains the definition of the database schema as well as a migration folder. Prisma automatically generates migrations based the difference between the local database state and the definition in `schema.prisma`
7. Check out the scripts in package.json and run `npm run db:init` to deploy the latest state to your local DB
8. If you change the schema in `schema`, you can generate a migration running `npm run db:migrate`, which will be located in migrations folder insider the prisma folder
9. To communicate between frontend and backend, we're mostly using TRPC. Have a look at `src/server/routers/router.ts` to see how we configure routes using `trpc/server`
10. In Monet example, see `monet/src/modules/techRaffles/hooks/token.ts` how we access the token route using a React query.
11. This returns us an object managing the state and if it has been returned successfully returns the data.
12. To accomplish your challenge, either migrate the DB and insert seed data or mock a response from a route.
13. With TRPC, all communication is typed via Typescript and `zod`, which verifies the parameters.
14. Start a preview with `npm run dev`
15. There might be links that are not working, we removed lots of pages and components to keep it simple
16. For completing your challenge, please take a look at the routers, maybe copy `templatePage` and for how to use trpc hooks refer to `token.ts`

### Documentation on frameworks
1. Prisma (ORM): https://www.prisma.io/docs/getting-started/quickstart
2. React: https://react.dev/learn
3. Chakra UI (components): https://chakra-ui.com/getting-started
4. Next.JS: https://nextjs.org/docs
5. Typescript: https://www.typescriptlang.org/docs/
6. TRPC server and client (backend<>frontend comms): https://trpc.io/docs/nextjs/setup
7. Zod (schema declaration): https://www.npmjs.com/package/zod

## Notes

Chakra has supported Gradients and RTL in `v1.1`. To utilize RTL, [add RTL direction and swap](https://chakra-ui.com/docs/features/rtl-support).

If you don't have multi-direction app, you should make `<Html lang="ar" dir="rtl">` inside `_document.ts`.
