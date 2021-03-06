<template>

  <div class="content-grid">
    <div class="filters">
      <div
        v-if="showContentKindFilter"
        class="ib"
      >
        <mat-svg
          category="content"
          name="filter_list"
          class="filter-icon"
        />
        <KSelect
          :label="$tr('resourceType')"
          :options="contentKindFilterOptions"
          :inline="true"
          class="filter"
          v-model="contentKindFilterSelection"
        />
      </div>
      <div
        v-if="showChannelFilter"
        class="ib"
      >
        <mat-svg
          category="navigation"
          name="apps"
          class="filter-icon"
        />
        <KSelect
          :label="$tr('channels')"
          :options="channelFilterOptions"
          :inline="true"
          class="filter"
          v-model="channelFilterSelection"
        />
      </div>
    </div>
    <ContentCard
      v-for="content in contents"
      v-show="showContentCard(content)"
      class="grid-item"
      :isMobile="windowIsSmall"
      :key="content.id"
      :title="content.title"
      :thumbnail="content.thumbnail"
      :kind="content.kind"
      :progress="content.progress"
      :numCoachContents="content.num_coach_contents"
      :link="genContentLink(content.id, content.kind)"
      :contentId="content.content_id"
      :copiesCount="content.copies_count"
      @openCopiesModal="openCopiesModal"
    />
    <CopiesModal
      v-if="modalIsOpen"
      :uniqueId="uniqueId"
      :sharedContentId="sharedContentId"
      @cancel="modalIsOpen = false"
    />
  </div>

</template>


<script>

  import { mapGetters } from 'vuex';
  import { validateLinkObject } from 'kolibri.utils.validators';
  import { ContentNodeKinds } from 'kolibri.coreVue.vuex.constants';
  import some from 'lodash/some';
  import KSelect from 'kolibri.coreVue.components.KSelect';
  import responsiveWindow from 'kolibri.coreVue.mixins.responsiveWindow';
  import ContentCard from './ContentCard';
  import CopiesModal from './CopiesModal';

  const ALL_FILTER = 'all';

  const kindFilterToLabelMap = {
    [ContentNodeKinds.TOPIC]: 'topics',
    [ContentNodeKinds.EXERCISE]: 'exercises',
    [ContentNodeKinds.VIDEO]: 'videos',
    [ContentNodeKinds.AUDIO]: 'audio',
    [ContentNodeKinds.DOCUMENT]: 'documents',
    [ContentNodeKinds.HTML5]: 'html5',
  };

  export default {
    name: 'ContentCardGroupGrid',
    $trs: {
      resourceType: 'Type',
      all: 'All',
      topics: 'Topics',
      exercises: 'Exercises',
      videos: 'Videos',
      audio: 'Audio',
      documents: 'Documents',
      html5: 'Apps',
      channels: 'Channels',
    },
    components: {
      ContentCard,
      KSelect,
      CopiesModal,
    },
    mixins: [responsiveWindow],
    props: {
      contents: {
        type: Array,
        required: true,
      },
      genContentLink: {
        type: Function,
        validator(value) {
          return validateLinkObject(value(1, 'exercise'));
        },
        default: () => {},
        required: false,
      },
      showContentKindFilter: {
        type: Boolean,
        default: true,
      },
      showChannelFilter: {
        type: Boolean,
        default: false,
      },
    },
    data: () => ({
      contentKindFilterSelection: {},
      channelFilterSelection: {},
      modalIsOpen: false,
      sharedContentId: null,
      uniqueId: null,
    }),
    computed: {
      ...mapGetters({
        channels: 'getChannels',
      }),
      allFilter() {
        return { label: this.$tr('all'), value: ALL_FILTER };
      },
      contentKindFilterOptions() {
        const options = Object.keys(kindFilterToLabelMap)
          .filter(kind => this.resultsIncludeContentKind(kind))
          .map(kind => ({
            label: this.$tr(kindFilterToLabelMap[kind]),
            value: kind,
          }));
        return [this.allFilter, ...options];
      },
      channelFilterOptions() {
        const options = this.channels
          .filter(channel => this.resultsIncludeChannel(channel.id))
          .map(channel => ({
            label: channel.title,
            value: channel.id,
          }));
        return [this.allFilter, ...options];
      },
    },
    beforeMount() {
      this.contentKindFilterSelection = this.contentKindFilterOptions[0];
      this.channelFilterSelection = this.channelFilterOptions[0];
    },
    methods: {
      resultsIncludeContentKind(kindFilter) {
        return some(this.contents, { kind: kindFilter });
      },
      resultsIncludeChannel(channelId) {
        return some(this.contents, { channel_id: channelId });
      },
      showContentCard(content) {
        const kindFilter = this.contentKindFilterSelection.value;
        const channelFilter = this.channelFilterSelection.value;
        return (
          (kindFilter === ALL_FILTER || kindFilter === content.kind) &&
          (channelFilter === ALL_FILTER || channelFilter === content.channel_id)
        );
      },
      openCopiesModal(contentId) {
        this.sharedContentId = contentId;
        this.uniqueId = this.contents.find(content => content.content_id === contentId).id;
        this.modalIsOpen = true;
      },
    },
  };

</script>


<style lang="scss" scoped>

  @import '~kolibri.styles.definitions';

  $gutters: 16px;

  .grid-item {
    margin-right: $gutters;
    margin-bottom: $gutters;
  }

  .filter-icon {
    margin-right: 12px;
    vertical-align: middle;
  }

  .filter:nth-of-type(1) {
    margin-right: 32px;
  }

  .filter {
    margin-bottom: 0;
  }

  .filters {
    margin-bottom: 24px;
  }

  .ib {
    display: inline-block;
  }

</style>
