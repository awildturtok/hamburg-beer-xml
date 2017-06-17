<template>
    <navbar placement="top"
            type="default">

        <router-link slot="brand"
           to="/"
           title="Home"
           class="navbar-brand">
            <span>Ohne Alster kein Bier</span>
        </router-link>
    
        </navbar>
</template>

<script>
import navbar from '../node_modules/vue-strap/src/Navbar.vue';

export default {
    components: { navbar }
}
</script>

<style>
.navbar-brand {
        width: 310px;
}
#app .navbar .nav {
    padding-left: 15px;
}
</style>
