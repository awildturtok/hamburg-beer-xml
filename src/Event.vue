
<template>
    <div style="display:flex;">
        <div v-if="dates" class="date">
            <div>{{dateText}}</div>
        </div>
        <div class="event">
            <router-link :to="viewUrl">
                <h4 class="card-header">{{title}}</h4>
            </router-link>
            <img v-if="previewImg" :src="previewImg"></img>
            <div class="card-block" v-if="description" v-html="description"></div>
            <div class="fade-out"></div>
        </div>
    </div>
</template>

<script>
var moment = require("moment");

export default {
    components: {},
    props: ["id", "title", "description", "urls", "dates", "location"],
    computed: {
        dateText() {
            return this.dates.displayDate;
        },
        viewUrl() {

            return !!this.location ? "/detail/" + this.location.inventoryNr : "/";
        },
        imgUrls() {
            if (!this.urls || !this.urls.url) return [];

            if (!Array.isArray(this.urls.url))
                return [this.urls.url];

            return this.urls.url;
        },
        previewImg() {
            return this.imgUrls[0];
        }
    }
}
</script>
