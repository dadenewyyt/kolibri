<template>

  <div>
    <div v-if="isUserLoggedIn ">
      <h2>{{ $tr('allClassesHeader') }}</h2>

      <div class="classrooms">
        <ContentCard
          class="content-card"
          v-for="c in classrooms"
          :key="c.id"
          :link="classAssignmentsLink(c.id)"
          :showContentIcon="false"
          :title="c.name"
          :kind="CLASSROOM"
          :isMobile="windowIsSmall"
        />
      </div>
    </div>
    <AuthMessage authorizedRole="learner" v-else />
  </div>

</template>


<script>

  import { mapState, mapGetters } from 'vuex';
  import AuthMessage from 'kolibri.coreVue.components.AuthMessage';
  import responsiveWindow from 'kolibri.coreVue.mixins.responsiveWindow';
  import { ContentNodeKinds } from 'kolibri.coreVue.vuex.constants';
  import ContentCard from '../ContentCard';
  import { classAssignmentsLink } from './classPageLinks';

  export default {
    name: 'AllClassesPage',
    metaInfo() {
      return {
        title: this.$tr('documentTitle'),
      };
    },
    components: {
      AuthMessage,
      ContentCard,
    },
    mixins: [responsiveWindow],
    computed: {
      ...mapGetters(['isUserLoggedIn']),
      ...mapState({
        classrooms: state => state.pageState.classrooms,
      }),
      CLASSROOM() {
        return ContentNodeKinds.CLASSROOM;
      },
    },
    methods: {
      classAssignmentsLink,
    },
    $trs: {
      allClassesHeader: 'Classes',
      documentTitle: 'All classes',
    },
  };

</script>


<style lang="scss" scoped>

  .content-card {
    margin-right: 16px;
    margin-bottom: 16px;
  }

</style>
