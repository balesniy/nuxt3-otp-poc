<template>
  <div class="drawer drawer-mobile">
    <input id="my-drawer-2" type="checkbox" class="drawer-toggle" />
    <div class="drawer-content">
      <!-- Page content here -->
      <label for="my-drawer-2" class="btn btn-primary drawer-button lg:hidden">Open drawer</label>
      <div ref="listEl" class="px-8 xl:pr-2 pb-16 flex flex-col h-full overflow-y-scroll">
        <div v-for="(html, i) of snippets" class="indicator max-w-full">
          <span v-if="validatorResults[i] || linterResults[i]" class="indicator-item indicator-start">
            <span class="badge badge-error mr-1">{{ validatorResults[i] }}</span>
            <span class="badge badge-warning">{{ linterResults[i] }}</span>
          </span>
          <div class="mockup-code mb-6">
            <pre class="whitespace-pre-wrap"><code>{{ html }}</code></pre>
          </div>
        </div>
      </div>
    </div>
    <div class="drawer-side">
      <label for="my-drawer-2" class="drawer-overlay"></label>
      <ul class="menu p-4 w-80 bg-base-100 text-base-content">
        <!-- Sidebar content here -->
        <li class="menu-title">
          <span>Разметка</span>
        </li>
        <li v-for="{title} of tasks">
          <nuxt-link :to="getTaskSlug(title)" activeClass="active">{{ title }}</nuxt-link>
        </li>
        <li class="menu-title">
          <span>Оформление текста</span>
        </li>
        <li><a>Item 1</a></li>
        <li><a>Item 2</a></li>
      </ul>

    </div>
  </div>
</template>
<script setup lang="ts">
definePageMeta({
  layout: false,
});
const getTaskSlug = (title: string) => {
    return `/courses/${title.toLowerCase().replace(/\s/g, '-')}`
}

const getTaskFromSlug = (slug: string) => {
    const [first, ...rest] = slug.replace(/-/g, ' ')
    return `${first.toUpperCase()}${rest.join('')}`
}
const listEl = ref(null);
const snippetsToShow = 5;
const supabase = useSupabaseClient();
const route = useRoute();
const slug = computed(() => Array.isArray(route.params.task) ? route.params.task[0] : route.params.task);
const title = computed(() => route.params.task ? getTaskFromSlug(slug.value) : 'Recent snippets');

const next = async (count = 0) => {
    const { data } = await useFetch('/api/challenge', {
        headers: useRequestHeaders(['cookie']),
        params: {
            title: title.value,
            from: count,
            to: count + snippetsToShow - 1
        },
    })
    console.log(data.value)
    return data.value || {snippets: [], reports: []}
}
const {snippets, reports} = toRefs(await next());
const validatorResults = computed(() => reports?.value.map(({validator}) => validator.length ? validator[0].messages.length : 0));
const linterResults = computed(() => reports?.value.map(({linter}) => linter.length ? linter[0].messages.length : 0));

const { data: tasks } = await useAsyncData('tasks', async () => {
  const { data } = await supabase.from('Task').select('title, id')
  return data
})

//using useInfiniteScroll from vueuse to implement infinite scroll
useInfiniteScroll(
    listEl,
    async () => {
        const data = await next(snippets.value.length);
        reports.value.push(...data.reports)
        snippets.value.push(...data.snippets)
    },
    {
        // You can set the distance to the bottom (in px) to trigger the load event
        // when the user scrolls to the distance within the bottom.
        distance: 100,
    }
);


if (!route.params.task) {
    let { data: Html_GPT3, error } = await supabase
        .from('Html_GPT3')
        .select('content')
        .order('id', { ascending: false })
        .limit(10)
    if (Html_GPT3) {
        snippets.value = Html_GPT3.map((item) => item.content)
    }
}
</script>
