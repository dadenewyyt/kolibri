<template>

  <!-- no extra whitespace inside link -->
  <a :class="buttonClasses" :href="href">{{ text }}</a>

</template>


<script>

  import { validator } from './appearances.js';
  import buttonClassesMixin from './buttonClassesMixin.js';

  /**
   * KExternalLink creates a styled external link
   */
  export default {
    name: 'KExternalLink',
    mixins: [buttonClassesMixin],
    props: {
      /**
       * Link text
       */
      text: {
        type: String,
        required: true,
      },
      /**
       * Link appearance: 'raised-button', 'flat-button', or 'basic-link'
       */
      appearance: {
        type: String,
        default: 'basic-link',
        validator,
      },
      /**
       * For 'raised-button' and 'flat-button' appearances: show as primary or secondary style
       */
      primary: {
        type: Boolean,
        default: false,
      },
      /**
       * URL string
       */
      href: {
        type: String,
        required: true,
      },
    },
  };

</script>


<style lang="scss" scoped>

  @import './buttons';

</style>
