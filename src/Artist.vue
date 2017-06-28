<template>
    <div class="artist">
	<a property="dc:creator" typeOf="dbo:Person" :href="res">{{name }}</a>, 
    </div>
</template>

<script>

export default {
    components: {},
    props: ["name", "res"],
 
}
</script>
