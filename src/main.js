require('./assets/main.scss');

console.clear();
console.log("Starting up application");

import Vue from 'vue';
import VueRouter from 'vue-router';
import VueResource from 'vue-resource';
import VueLocalStorage from 'vue-localstorage/src/index.js';

Vue.use(VueRouter);
Vue.use(VueResource);
Vue.use(VueLocalStorage)

// Vue.url.options.root = '/';
Vue.url.options.root = '/api/'; // enable this in dev mode and vice versa.

import App from './App.vue';
import TimeLine from './TimeLine.vue';
import DetailView from './DetailView2.vue';



const router = new VueRouter({
    base: '/',
    mode: 'history',
    routes: [{
            path: '/',
            component: TimeLine
        },
        {
            path: '/detail/:id',
            component: DetailView
        }
    ],
    linkActiveClass: 'active'
});

const app = new Vue({
    el: '#app',
    router,
    render: h => h(App)
})
