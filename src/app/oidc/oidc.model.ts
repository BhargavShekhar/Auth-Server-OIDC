import { z } from "zod";

export const oidcClientPayloadModel = z.object({
    name: z.string(),
    redirectUris: z.array(z.string())
});

export type clientRegistrationDto = z.infer<typeof oidcClientPayloadModel>;