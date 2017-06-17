<template>
    <div id="timeline">
        <h1>Hio</h1>
    
        <div class="events">
            <event v-for="event in events" :key="event.id" v-bind="event"></event>
        </div>
    </div>
</template>

<script>
import Event from "./Event.vue";

var moment = require("moment");


export default {
    name: "timeline",
    components: { Event },
    data: () => {
        return {
            // todo events will be fetched via API
            events: [{
                title: "a title",
                description: "Did you know!?"
            }, {
                title: "a title too",
                date: moment(),
                image : "https://vuejs.org/images/logo.png",
                description: "this seems ridiculous, why would <b>I</b> care?"
            }]
        };
    }
}
</script>
