
<template>
    <div class="event">
        <!--<div v-if="dates" class="date">
            <div>{{dateText}}</div>
        </div>-->
        <h4 class="card-header">{{title}}</h4>
        <img v-if="previewImg" :src="previewImg" ></img>        
        <div class="card-block" v-if="description" v-html="description"></div>
    </div>
</template>

<script>
var moment = require("moment");

export default {
    components: {},
    props: ["id", "title", "description", "urls", "dates"],
    computed: {
        dateText() {
            return this.dates.displayDate;
        },
        viewUrl() {
            return "/view/" + this.id;
        },
        imgUrls() {
            if(!this.urls || !this.urls.url) return [];

            if(!Array.isArray(this.urls.url))
                return [this.urls.url];
            
            return this.urls.url;
        },
        previewImg(){
            return this.imgUrls[0];
        }
    }
}
</script>
