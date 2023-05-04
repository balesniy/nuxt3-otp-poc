export default defineNuxtRouteMiddleware(() => {
  const user = useAuthUser();
  const event = useRequestEvent();
  const api = useApi();

  if (process.server && event.context.user && event.context.session_token) {
    user.value = event.context.user;
    api.setToken(event.context.session_token);
  }
});
