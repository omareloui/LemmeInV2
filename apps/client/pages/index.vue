<script setup lang="ts">
import { createTRPCClient } from "@trpc/client";

import type { AppRouter } from "~~/@types";

const client = createTRPCClient<AppRouter>({ url: "http://localhost:2022" });

const helloResponse = await client.query("hello", { name: "omar" });
</script>

<template>
  <div>
    <h1>hi!</h1>
    <p>Response {{ helloResponse }}</p>
  </div>
</template>
