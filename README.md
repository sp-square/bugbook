# BugBook

## Description

## STARTING FROM SCRATCH

### A - PROJECT SET-UP

#### 1. Install the dependencies

In your terminal, create the front end as follows:
`npx create-next-app@latest`

Then answer the prompts as follows:

- OK to proceed? `y`
- What is your project named? `.`
- Would you like to use TypeScript? `Yes`
- Would you like to use ESLint? `Yes`
- Would you like to use Tailwind CSS? `Yes`
- Would you like to use 'src/' directory? `No`
- Would you like to use App Router? `Yes`
- Would you like to customize the default import alias (@/\*)? `No`

Install the packages needed:

```
npm i lucia @lucia-auth/adapter-prisma prisma @prisma/client @tanstack/react-query @tanstack/react-query-devtools @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder @tiptap/pm uploadthing @uploadthing/react arctic date-fns ky next-themes react-cropper react-image-file-resizer react-intersection-observer react-linkify-it stream-chat stream-chat-react --legacy-peer-deps
```

as well as the following dev dependencies:

```
npm i -D prettier eslint-config-prettier prettier-plugin-tailwindcss --legacy-peer-deps
```

To use the shadcn react component library and install some of the components needed for the app, type the following command:

```
npx --legacy-peer-deps shadcn-ui@latest init
```

Then answer the prompts as follows:

- Which style would you like to use? `.`
- Which color would you like to use as base color? `Slate`
- Would you like to use CSS variables for colors? `Yes`

#### 2. Customize the theme

- Go to `https://ui.shadcn.com/themes`
- Click on the `Customize` button and make your selections
- Click on the `Copy code` button and copy the code
- Go to `app/globals.css` and replace the

```
@layer base {
  :root {
    ...
  }
}
```

with what you copied from the shadcn website.
Be carefull not to delete the existing code at the bottom:

```
@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

#### 3. Install shadcn components

At the command line, type the following:

```
npx --legacy-peer-deps shadcn-ui@latest add button dialog dropdown-menu form input label skeleton tabs textarea toast tooltip
```

#### 4. Configure your VSCode

1. Tailwind support:
   Make sure you have the extension `Tailwind CSS IntelliSense` installed.
   Then, in the Command Palette, search for "Open Settings (UI)". Once the tab open, search for "files associations", and `Add Item` `*.css`. Give it the `Value` `tailwindcss`. This adds tailwind support to css files.

Next, in the Open Settings (UI) tab opened, search for "editor quick suggestions", and turn `on` quick suggestions for `strings` because tailwind classes are strings and only when we enable this, do we get the autocomplete suggestions for tailwind classes.

2. Prettier support:
   We installed the dev dependencies `prettier`, `eslint-config-prettier`, and `prettier-plugin-tailwindcss`.
   Now, to enable the `prettier-plugin-tailwindcss`, we have to create a configuration file in the root folder. Create a file named `prettier.config.js` and insert the following code:

```
module.exports = {
  plugins: ["prettier-plugin-tailwindcss"],
};
```

Also, install the prettier extension `Prettier - Code formatter`.
And then in the Open Settings (UI) tab opened, search for "default formatter" and set it to `Prettier - Code formatter`.

Finally, in the file `.eslintrc.json`, edit the code like so:

```
{
  "extends": ["next/core-web-vitals", "prettier"]
}
```

to make sure that `eslint` work together with `prettier`.

3. Prisma support:

Install the `Prisma` extension.

4. Multiple case support:

Install the `Multiple cursor case preserve` extension.

5. Reload VSCode:

In the command palette, type "reload" and select `Reload Window` to reload VSCode and ensure all extensions are loaded.

### B - DATABASE SET-UP

#### 1. Set-up Postgres with Vercel and Prisma ORM

We use Vercel Postgres because it's very easy to set-up, and the first database is free. We will also deploy our project to Vercel so we have everything under one roof.

- Sign into your Vercel account
- Click on the `Storage` tab
- Select `Create` Postgres database
- Fill in the Database Name and pick a region close to your location so that it be as fast as possible in development. After we deployed, it shouldn't matter any more because we use serverless functions that are distributed around the globe.
- Click on `Create` and you see your newly created database dashboard. There are credentials under the tab `.env.local` that we will need shortly
- Go back to your project on VSCode and install Prisma ORM with the command: `npx prisma init`
- Copy all variables from the `.env.local` in your Vercel Postgres DB dashboard and paste in your project `.env` file (you can delete whatever Prisma initially created by default)
- Then we have some extra configuration for Prisma. We need to copy the code snippet from the `Prisma` tab in the Vercel db dashboard and replace it with the correspond in the `prisma/schema.prisma` file. In the same file, also edit the `generate client` block with the following:

```
generator client {
  provider = "prisma-client-js"
  previewFeatures = ["fullTextSearch"]
}
```

#### 2. Set-up Postgres with Neon

If you want to use a different Postgres database, you can just do this as well. You will just need a connection string. Vercel Postgres is powered by NEON under the hood (`https://neon.tech/`)

- Go to `https://neon.tech/` and sign in or create an account.
- In the Projects dashboard, click on button `Create project`.
- Navigate to the Branches dashboard, and select `main`
- In the `main` branch dashboard, click on the `Roles & Databases` tab and click on the button `Add role` to create a new role (for example: "sandrine"). Then click on the button `Add database` to add a new database (for example: "bugbook_db"), and select the new role (e.g. "sandrine") for the owner.
- Click on `Dashboard` on the side menu, to go back to the Project Dashboard. Select the `bugbook_db` database and the new role (e.g. "sandrine") to see the connection string.
- Copy the connection string and paste it into a `.env` file in your project.

```
DATABASE_URL=<your-neon-bugbook_db-connection-string-here>
```

- It is possible to set up the Prisma migration from within the Neon Dashboard by selecting `SQL Editor` on the side menu. Make sure to select the `bugbook_db` database on the upper right dropdown. FYI, we can write SQL in the editor (no need to do it here).
- Go back to your project on VSCode and install Prisma ORM with the command: `npx prisma init`
- Then edit the `prisma/schema.prisma` file like so:

```
generator client {
  provider = "prisma-client-js"
  previewFeatures = ["fullTextSearch"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

#### 3. Set-up Prisma ORM

<u>**Create a file to interact with our database**</u>

This is a file that will initialize the Prisma client.
Create a `lib` folder at the root of your project. Next, within `lib`, create a file `prisma.ts` with the following content:

```
import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient()
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

// if we are in production, we want to initialize our prisma client normally
// if we are not in production, we don't want to initialize it multiple times - which is what would happen with nextjs hot reloading
if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
```

We don't need to touch this file anymore, but we can now bring in this `db` variable and use it to make queries.

<u>**Open the Prisma studio**</u>

At the command line, run `npx prisma studio` to inspect your database.

### C - AUTHENTICATION SET-UP

In this project, we use Lucia for authentication. The documentation can be found at `https://lucia-auth.com/`.

1. First we need to edit our database schema to store users and sessions. Lucia uses sessions under the hood - not jwt or other tokens. Every time a user is logged in, we create a session in our database and a corresponding cookie in the browser of the user. Only if both parts match - if there is a session in the database and the user has the correct cookie, then the user is authenticated.
   Navigate to `https://lucia-auth.com/database/prisma` and copy and paste the starting User and Session models in your `prisma/schema.prisma` file. You can edit those models to fit your particular app purposes.

```
model User {
id       String    @id
sessions Session[]
}

model Session {
id        String   @id
userId    String
expiresAt DateTime

user      User     @relation(references: [id], fields: [userId], onDelete: Cascade)
}
```

2. We push our new database schema to the cloud. At the command line, enter: `npx prisma db push`

3. Next we set-up an `auth.ts` file where we create a Lucia client and set-up the authentication logic
