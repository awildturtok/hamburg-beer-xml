require('./assets/main.scss');

import Vue from 'vue';
import VueRouter from 'vue-router';
import VueResource from 'vue-resource';
import VueLocalStorage from 'vue-localstorage/src/index.js';

Vue.use(VueRouter);
Vue.use(VueResource);
Vue.use(VueLocalStorage)

Vue.url.options.root = 'localhost:8080';

import App from './App.vue';
import TimeLine from './TimeLine.vue';

const router = new VueRouter({
    mode: 'history',
    routes: [
        { path: '/', component: TimeLine },
    ],
    linkActiveClass: 'active'
});

const app = new Vue({
    el: '#app',
    router,
    render: h => h(App)
})