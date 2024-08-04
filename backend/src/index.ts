import { Elysia } from "elysia";
import { auth } from "./modules/auth/auth.routes";

new Elysia({ name: "oauthService" }).use(auth).listen(3000);

console.log("Listening on http://localhost:3000");
