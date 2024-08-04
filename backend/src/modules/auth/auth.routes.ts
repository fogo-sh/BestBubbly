import Elysia from "elysia";
import { oauthService } from "../../integrations/oauth.integration";
import { randomUUID } from "crypto";

export const auth = new Elysia()
  .use(oauthService)
  .get("/login", ({ profiles, set }) => {
    return Response.redirect(profiles().github.login);
  })
  .get(
    "/register",
    async ({ onOauthReturn }: any) => {
      const { redirectResponse } = await onOauthReturn();
      if (redirectResponse) return redirectResponse;
      throw new Error("Not implemented");
    },
    {
      error: ({ error }) => "Caught: " + error.message,
    }
  );
