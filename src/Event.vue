
<template>
    <div class="event">
        <h4 class="card-header">{{title}}
            <span v-if="date" class="date">({{dateText}})</span>
        </h4>
        <img v-if="image" :src="image">
        <div class="card-block" v-if="description" v-html="description"></div>
    </div>
</template>

<script>
var moment = require("moment");

export default {
    components: {},
    props: ["id", "title", "description", "date", "image"],
    computed: {
        dateText() {
            return moment(this.date).calendar();
        },
        viewUrl(){
            return "/view/" + this.id;
        }
    }
}
</script>
