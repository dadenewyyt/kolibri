<template>

  <section :class="{'content-area-perseus': isPerseusExercise}">
    <h2 v-if="isPerseusExercise" class="header">
      {{ header }}
    </h2>
    <ContentRenderer
      :class="{ hof: isPerseusExercise}"
      :showCorrectAnswer="true"
      :id="content.pk"
      :itemId="selectedQuestion"
      :allowHints="false"
      :kind="content.kind"
      :files="content.files"
      :contentId="content.content_id"
      :channelId="content.channel_id"
      :available="content.available"
      :extraFields="content.extra_fields"
      :interactive="false"
    />
  </section>

</template>


<script>

  import ContentRenderer from 'kolibri.coreVue.components.ContentRenderer';

  export default {
    name: 'ContentArea',
    components: {
      ContentRenderer,
    },
    props: {
      content: {
        type: Object,
        required: true,
      },
      // Perseus-specific
      selectedQuestion: {
        type: String,
        required: false,
      },
      isPerseusExercise: {
        type: Boolean,
        required: false,
        default: false,
      },
      header: {
        type: String,
        required: false,
        default: '',
      },
    },
    computed: {
      hasHeader() {
        return Boolean(this.header);
      },
    },
  };

</script>


<style lang="scss" scoped>

  @import '~kolibri.styles.definitions';

  .content-area-perseus {
    padding: 16px;
    background-color: $core-bg-light;
  }

  .hof {
    overflow-x: hidden; // .solutionarea's negative margin oversteps
  }

  .header {
    margin: 0;
    font-size: 16px; // same as question-list
  }

</style>
