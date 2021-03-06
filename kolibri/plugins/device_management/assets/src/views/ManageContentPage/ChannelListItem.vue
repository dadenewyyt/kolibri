<template>

  <component
    class="channel-list-item"
    :style="verticalPadding"
    :is="componentTemplate"
  >
    <template slot="thumbnail">
      <div class="spec-ref-thumbnail">
        <img v-if="thumbnailImg" :src="thumbnailImg" class="thumbnail">
        <div v-else class="default-icon">
          <mat-svg category="navigation" name="apps" />
        </div>
      </div>
    </template>

    <template slot="header">
      <div>
        <h2 class="title" dir="auto">{{ channel.name }}</h2>
        <UiIcon class="icon" v-if="!channel.public">
          <mat-svg name="lock_open" category="action" />
        </UiIcon>
      </div>
      <div class="version">
        {{ $tr('version', { version: versionNumber }) }}
      </div>
    </template>

    <template slot="meta">
      <div v-if="inImportMode && onDevice" class="spec-ref-on-device">
        <UiIcon class="icon">
          <mat-svg
            category="action"
            name="check_circle"
            class="on-device-icon"
          />
        </UiIcon>
        <span class="on-device-text">{{ $tr('onYourDevice') }}</span>
      </div>
      <div v-if="inExportMode || inManageMode" dir="auto" class="spec-ref-resources-size">
        {{ resourcesSizeText }}
      </div>
    </template>

    <template slot="description">
      <p dir="auto" class="spec-ref-description">
        {{ channel.description || $tr('defaultDescription') }}
      </p>
      <CoachContentLabel
        :value="channel.num_coach_contents"
        :isTopic="true"
      />
    </template>

    <template slot="buttons">
      <KRouterLink
        v-if="inImportMode || inExportMode"
        :text="$tr('selectButton')"
        :disabled="tasksInQueue"
        :to="selectContentLink"
        appearance="raised-button"
      />
      <KDropdownMenu
        v-if="inManageMode"
        :text="$tr('manageChannelActions')"
        :disabled="tasksInQueue"
        :options="manageChannelActions"
        @select="handleManageChannelAction($event.value)"
      />
    </template>
  </component>

</template>


<script>

  import { mapState, mapGetters } from 'vuex';
  import CoachContentLabel from 'kolibri.coreVue.components.CoachContentLabel';
  import KRouterLink from 'kolibri.coreVue.components.KRouterLink';
  import KDropdownMenu from 'kolibri.coreVue.components.KDropdownMenu';
  import responsiveWindow from 'kolibri.coreVue.mixins.responsiveWindow';
  import UiIcon from 'keen-ui/src/UiIcon';
  import bytesForHumans from './bytesForHumans';
  import { selectContentPageLink } from './manageContentLinks';
  import ChannelListItemLarge from './ChannelListItemLarge';
  import ChannelListItemSmall from './ChannelListItemSmall';

  const Modes = {
    IMPORT: 'IMPORT',
    EXPORT: 'EXPORT',
    MANAGE: 'MANAGE',
  };

  const ChannelActions = {
    DELETE_CHANNEL: 'DELETE_CHANNEL',
    IMPORT_MORE_FROM_CHANNEL: 'IMPORT_MORE_FROM_CHANNEL',
  };

  export default {
    name: 'ChannelListItem',
    components: {
      CoachContentLabel,
      KDropdownMenu,
      KRouterLink,
      ChannelListItemLarge,
      ChannelListItemSmall,
      UiIcon,
    },
    mixins: [responsiveWindow],
    props: {
      channel: {
        type: Object,
        required: true,
      },
      mode: {
        type: String, // 'IMPORT' | 'EXPORT' | 'MANAGE'
        required: true,
        validator(val) {
          return Object.keys(Modes).includes(val);
        },
      },
      onDevice: {
        type: Boolean,
        default: false,
      },
    },
    computed: {
      ...mapGetters(['channelIsInstalled']),
      ...mapState(['pageState']),
      manageChannelActions() {
        return [
          {
            label: this.$tr('importMoreFromChannel'),
            value: ChannelActions.IMPORT_MORE_FROM_CHANNEL,
          },
          {
            label: this.$tr('deleteChannel'),
            value: ChannelActions.DELETE_CHANNEL,
          },
        ];
      },
      inImportMode() {
        return this.mode === Modes.IMPORT;
      },
      inExportMode() {
        return this.mode === Modes.EXPORT;
      },
      inManageMode() {
        return this.mode === Modes.MANAGE;
      },
      resourcesSizeText() {
        return bytesForHumans(this.channel.on_device_file_size);
      },
      thumbnailImg() {
        return this.channel.thumbnail;
      },
      tasksInQueue() {
        const { taskList = [] } = this.pageState;
        return taskList.length > 0;
      },
      versionNumber() {
        const installed = this.channelIsInstalled(this.channel.id);
        if (installed) {
          return installed.version;
        }
        return this.channel.version;
      },
      selectContentLink() {
        return selectContentPageLink({
          channelId: this.channel.id,
          driveId: this.$route.query.drive_id,
          forExport: this.$route.query.for_export,
        });
      },
      verticalPadding() {
        return {
          paddingBottom: `${this.windowGutter}px`,
          paddingTop: `${this.windowGutter}px`,
        };
      },
      componentTemplate() {
        if (this.windowIsLarge) {
          return ChannelListItemLarge;
        }
        return ChannelListItemSmall;
      },
    },
    methods: {
      handleManageChannelAction(action) {
        if (action === ChannelActions.DELETE_CHANNEL) {
          return this.$emit('clickdelete');
        }
        return this.$emit('import_more', { ...this.channel });
      },
    },
    $trs: {
      defaultDescription: '(No description)',
      deleteChannel: 'Delete',
      importMoreFromChannel: 'Import more',
      manageChannelActions: 'Actions',
      onYourDevice: 'On your device',
      selectButton: 'Select',
      version: 'Version {version}',
    },
  };

</script>


<style lang="scss" scoped>

  @import '~kolibri.styles.definitions';

  .channel-list-item {
    border-top: 1px solid $core-grey;
  }

  .title {
    display: inline;
  }

  .version {
    font-size: 0.85em;
    color: $core-text-annotation;
  }

  .thumbnail {
    width: 100%;
  }

  .default-icon {
    text-align: center;
    background-color: $core-grey;
    svg {
      width: 30%;
      height: 30%;
      margin: 20px;
    }
  }

  .on-device-icon {
    fill: $core-status-correct;
  }

  .on-device-text {
    margin-left: 8px;
  }

  .icon {
    vertical-align: text-bottom;
  }

</style>
