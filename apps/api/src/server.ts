import Fastify from "fastify";
import cors from "@fastify/cors";
import {
  HomebrewFeatureSchema, HomebrewCharacterSchema,
  type HomebrewFeature,
  type HomebrewCharacter
} from "@foundry-homebrew-hub/shared";

const app = Fastify({
  logger: true
});

await app.register(cors, {
  origin: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
});

const features = new Map<string, HomebrewFeature>();
const characters = new Map<string, HomebrewCharacter>();

app.get("/health", async () => {
  return { status: "ok" };
});

app.get("/features", async () => {
  return Array.from(features.values());
});

app.post("/features", async (request, reply) => {
  const result = HomebrewFeatureSchema.safeParse(request.body);

  if (!result.success) {
    return reply.status(400).send({
      error: "Invalid feature",
      issues: result.error.issues
    });
  }

  features.set(result.data.id, result.data);

  return {
    message: "Feature saved",
    feature: result.data
  };
});

app.put<{ Params: { id: string } }>("/features/:id", async (request, reply) => {
  const existingFeature = features.get(request.params.id);

  if (!existingFeature) {
    return reply.status(404).send({
      error: "Feature not found"
    });
  }

  const body =
    typeof request.body === "object" && request.body !== null
      ? request.body
      : {};

  const result = HomebrewFeatureSchema.safeParse({
    ...body,
    id: request.params.id
  });

  if (!result.success) {
    return reply.status(400).send({
      error: "Invalid feature",
      issues: result.error.issues
    });
  }

  features.set(request.params.id, result.data);

  return {
    message: "Feature updated",
    feature: result.data
  };
});

app.delete<{ Params: { id: string } }>("/features/:id", async (request, reply) => {
  const wasDeleted = features.delete(request.params.id);

  if (!wasDeleted) {
    return reply.status(404).send({
      error: "Feature not found"
    });
  }

  return {
    message: "Feature deleted"
  };
});

app.get("/characters", async () => {
  return Array.from(characters.values());
});

app.post("/characters", async (request, reply) => {
  const result = HomebrewCharacterSchema.safeParse(request.body);

  if (!result.success) {
    return reply.status(400).send({
      error: "Invalid character",
      issues: result.error.issues
    });
  }

  characters.set(result.data.id, result.data);

  return {
    message: "Character saved",
    character: result.data
  };
});

app.put<{ Params: { id: string } }>("/characters/:id", async (request, reply) => {
  const existingCharacter = characters.get(request.params.id);

  if (!existingCharacter) {
    return reply.status(404).send({
      error: "Character not found"
    });
  }

  const body =
    typeof request.body === "object" && request.body !== null
      ? request.body
      : {};

  const result = HomebrewCharacterSchema.safeParse({
    ...body,
    id: request.params.id
  });

  if (!result.success) {
    return reply.status(400).send({
      error: "Invalid character",
      issues: result.error.issues
    });
  }

  characters.set(request.params.id, result.data);

  return {
    message: "Character updated",
    character: result.data
  };
});

app.delete<{ Params: { id: string } }>("/characters/:id", async (request, reply) => {
  const wasDeleted = characters.delete(request.params.id);

  if (!wasDeleted) {
    return reply.status(404).send({
      error: "Character not found"
    });
  }

  return {
    message: "Character deleted"
  };
});

await app.listen({
  port: 3000,
  host: "0.0.0.0"
});