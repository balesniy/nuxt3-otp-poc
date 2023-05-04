// https://nuxt.com/docs/api/configuration/nuxt-config
const ONE_DAY = 60 * 60 * 24 * 1000
const ONE_WEEK = ONE_DAY * 7

export default defineNuxtConfig({
    modules: ['@nuxtjs/tailwindcss', '@nuxtjs/supabase', '@vueuse/nuxt',],
    runtimeConfig: {
        cookieName: process.env.COOKIE_NAME || '__session',
        cookieSecret: process.env.COOKIE_SECRET || 'secret',
        cookieExpires: parseInt(process.env.COOKIE_REMEMBER_ME_EXPIRES || ONE_DAY.toString(), 10), // 1 day
        cookieRememberMeExpires: parseInt(process.env.COOKIE_REMEMBER_ME_EXPIRES || ONE_WEEK.toString(), 10), // 7 days
    },
    nitro: {
        // devProxy: {
        //     '/api': {
        //         target: 'https://searadar.com/api', changeOrigin: true
        //     }
        // }
    }
})
