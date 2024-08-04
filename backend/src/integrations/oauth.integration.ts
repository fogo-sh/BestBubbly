import { Elysia, NotFoundError } from "elysia";
import oauth2, { github, InferContext } from "@bogeychan/elysia-oauth2";
import { tables } from "../db/schema";
import { eq, and } from "drizzle-orm";

import { randomBytes } from "crypto";
import db from "../db/connection";

const oauthHelper = new Elysia({ name: "oauthHelper" })
  .state({
    states: {} as Record<string, string[]>,
  })
  .derive({ as: "global" }, ({ store }) => ({
    stateStore: store.states,
  }))
  .derive({ as: "global" }, ({ cookie: { oauthSession } }) => ({
    getCurrentUserId: () => {
      if (!oauthSession.value) throw new Error("No oauth session found.");
      return oauthSession.value as string;
    },
  }));

type HelperCtx = InferContext<typeof oauthHelper>;

export const oauthService = new Elysia({ name: "oauthService" })
  .use(oauthHelper)
  .use(
    oauth2({
      redirectTo: "/register",
      profiles: { github: { provider: github(), scope: ["user"] } },
      state: {
        generate: ({ stateStore }: HelperCtx, name) => {
          const newState = randomBytes(8).toString("hex");
          stateStore![name] === undefined
            ? (stateStore![name] = [newState])
            : stateStore![name].push(newState);
          return newState;
        },
        check: ({ stateStore }: HelperCtx, name, state) => {
          const stateExists = stateStore![name]?.includes(state) ?? false;
          if (!stateExists) return false;
          stateStore![name] = stateStore![name]?.filter(
            (s: any) => s !== state
          );
          if (stateStore![name]?.length === 0) delete stateStore![name];
          return true;
        },
      },
      storage: {
        set: async (
          { getCurrentUserId }: HelperCtx,
          name,
          { scope, ...token }
        ) => {
          const uuid = getCurrentUserId!();
          const scopes =
            scope instanceof Array ? scope.map((name) => name) : [scope];

          db.delete(tables.scopes).where(eq(tables.scopes.user_uuid, uuid));

          db.insert(tables.scopes)
            .values([
              {
                ...token,
                name,
                scope: scopes,
                user_uuid: uuid,
              },
            ])
            .onConflictDoUpdate({
              target: tables.scopes.access_token,
              set: { scope: scopes },
              ...token,
            })
            .run();
        },

        get: async ({ getCurrentUserId }: HelperCtx, name) => {
          const uuid = getCurrentUserId!();

          const res = db
            .select()
            .from(tables.scopes)
            .where(
              and(
                eq(tables.scopes.user_uuid, uuid),
                eq(tables.scopes.name, name)
              )
            )
            .get();
          if (!res) return undefined;
          return res;
        },

        delete: ({ getCurrentUserId }: HelperCtx, name) => {
          const uuid = getCurrentUserId!();
          db.delete(tables.scopes).where(eq(tables.scopes.user_uuid, uuid));
        },
      },
    })
  )
  .derive({ as: "global" }, ({ profiles, authorized, tokenHeaders, set }) => {
    const getAuthorizedProvider = async () => {
      type Profile = keyof ReturnType<typeof profiles>;
      const profile = await Object.keys(profiles("github")).reduce(
        async (acc, profileUntyped) => {
          if ((await acc) !== null) return acc;

          const profile = profileUntyped as Profile;

          const authorizedProfile = await authorized(profile);
          if (authorizedProfile) return profile;
          return acc;
        },
        Promise.resolve(null) as Promise<Profile | null>
      );

      if (!profile) throw new NotFoundError("No authorized profile found.");

      return profile;
    };

    const urlMap = {
      github: "https://api.github.com/user",
    } satisfies { [K in keyof ReturnType<typeof profiles>]: string };

    const getAuthenticatedUser = async (): Promise<{
      provider: "github";
      user: {
        id: number;
        email?: string;
        name: string;
        avatar_url: string;
        login: string;
      };
    }> => {
      // TODO add user types for other providers
      const provider = await getAuthorizedProvider();
      const headers = await tokenHeaders(provider);
      const user = await fetch(urlMap[provider], { headers }).then(
        async (res) => {
          if (!res.ok)
            throw new NotFoundError(
              `Failed to fetch user from ${provider}: ${res.statusText}`
            );
          const out = await res.json();
          return out;
        }
      );
      return { provider, user };
    };

    const storeAuthenticatedUser = async () => {
      const { provider, user: userStub } = await getAuthenticatedUser();

      if (provider === "github") {
        const { id, email, name, avatar_url, login } = userStub;
        const id_from_provider = id.toString();

        const key = db
          .select()
          .from(tables.userOauthProviders)
          .where(
            and(
              eq(tables.userOauthProviders.provider, provider),
              eq(tables.userOauthProviders.provider_user_id, id_from_provider)
            )
          )
          .get();

        if (!key) {
          const user = await db
            .insert(tables.users)
            .values({
              github_username: login,
              avatar_url,
              email,
              name,
            })
            .returning()
            .get();

          if (!user) throw new Error("No user found.");

          await db
            .insert(tables.userOauthProviders)
            .values({
              user_id: user.id,
              provider,
              provider_user_id: id_from_provider,
            })
            .returning()
            .get();

          return user;
        }

        const foundUser = db
          .select()
          .from(tables.users)
          .where(eq(tables.users.id, key.user_id))
          .get();

        db.update(tables.users)
          .set({
            github_username: login,
            avatar_url,
            email,
            name,
          })
          .where(eq(tables.users.id, key.user_id))
          .run();

        if (!foundUser) throw new Error("No user found.");

        return foundUser;
      }

      throw new Error(`Unknown provider: ${provider}`);
    };

    const onOauthReturn = async () => {
      const user = await storeAuthenticatedUser();

      // If a user was found/created, grant session token to user.
      const session = db
        .insert(tables.sessions)
        .values({ user_id: user.id })
        .returning()
        .get();

      set.cookie = {
        session: {
          value: JSON.stringify(session.user_id),
          path: "/",
        },
      };

      return {
        /**
         * If session is granted, redirect to user landing page.
         */
        redirectResponse: Response.redirect("/"),
      };
    };

    return { onOauthReturn };
  });
