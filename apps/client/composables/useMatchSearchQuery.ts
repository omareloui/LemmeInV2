import { ref } from "#imports";

export function useMatchSearchQuery(searchQuery: ReturnType<typeof ref>) {
  watch(searchQuery, newValue => {
    const route = useRoute();
    const router = useRouter();
    const query: typeof route.query = { ...route.query };
    if (newValue) query.search = newValue as string;
    else delete query.search;
    router.push({
      path: route.path,
      query,
    });
  });
}
