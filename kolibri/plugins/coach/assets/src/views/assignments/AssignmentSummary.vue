<template>

  <div>
    <div class="lesson-summary-header">
      <div class="lesson-summary-header-title-block">
        <ContentIcon
          :kind="kind"
          class="title-lesson-icon"
        />
        <h1 class="lesson-summary-header-title">
          {{ title }}
        </h1>
      </div>
      <slot name="optionsDropdown"></slot>
    </div>

    <dl>
      <dt>
        {{ $tr('status') }}
        <CoreInfoIcon
          :iconAriaLabel="$tr('statusDescription')"
          :tooltipText="$tr('statusTooltipText')"
          tooltipPosition="bottom left"
        />
      </dt>
      <dd>
        <StatusIcon :active="active" />
        <KButton
          appearance="basic-link"
          class="change-status-button"
          :text="$tr('changeStatus')"
          @click="$emit('changeStatus')"
        />
      </dd>

      <template v-if="showDescription">
        <dt>
          {{ $tr('description') }}
        </dt>
        <dd>
          {{ description || $tr('noDescription') }}
        </dd>
      </template>

      <dt>
        {{ $tr('recipients') }}
      </dt>
      <dd>
        <template v-if="!recipients.length">
          {{ this.$tr('noOne') }}
        </template>
        <template v-else-if="classIsTheRecipient">
          {{ this.$tr('entireClass') }}
        </template>
        <ul
          v-else
          class="group-list"
        >
          <li
            class="group-list-item"
            v-for="recipientGroup in recipientGroups"
            :key="recipientGroup.id"
          >
            <span>{{ recipientGroup.name }}</span>
          </li>
        </ul>
      </dd>
    </dl>

  </div>

</template>


<script>

  import CoreInfoIcon from 'kolibri.coreVue.components.CoreInfoIcon';
  import ContentIcon from 'kolibri.coreVue.components.ContentIcon';
  import KButton from 'kolibri.coreVue.components.KButton';
  import { CollectionKinds } from 'kolibri.coreVue.vuex.constants';
  import StatusIcon from './StatusIcon';

  export default {
    name: 'AssignmentSummary',
    components: {
      CoreInfoIcon,
      ContentIcon,
      StatusIcon,
      KButton,
    },
    props: {
      kind: {
        type: String,
        required: true,
      },
      title: {
        type: String,
        required: true,
      },
      active: {
        type: Boolean,
        required: true,
      },
      description: {
        type: String,
        required: false,
        default: null,
      },
      recipients: {
        type: Array,
        required: true,
      },
      groups: {
        type: Array,
        required: true,
      },
    },
    $trs: {
      status: 'Status',
      statusDescription: 'Status description',
      statusTooltipText: 'Active: visible to learners. Inactive: hidden from learners.',
      changeStatus: 'Change',
      description: 'Description',
      noDescription: 'No description',
      recipients: 'Recipients',
      noOne: 'No one',
      entireClass: 'Entire class',
    },
    computed: {
      showDescription() {
        return this.description !== null;
      },
      normalizedRecipients() {
        return this.recipients.map(recipient => {
          return Object.assign({}, recipient, {
            collection_id:
              recipient.collection_id || recipient.collection.id || recipient.collection,
            collection_kind: recipient.collection_kind || recipient.collection.kind,
          });
        });
      },
      classIsTheRecipient() {
        return (
          this.normalizedRecipients.length === 1 &&
          this.normalizedRecipients[0].collection_kind === CollectionKinds.CLASSROOM
        );
      },
      recipientGroups() {
        return this.normalizedRecipients
          .filter(recipient => recipient.collection_kind === CollectionKinds.LEARNERGROUP)
          .map(recipientGroup => {
            recipientGroup.name = this.groups.find(
              lg => lg.id === recipientGroup.collection_id
            ).name;
            return recipientGroup;
          });
      },
    },
  };

</script>


<style lang="scss" scoped>

  @import '~kolibri.styles.definitions';
  $table-header-size: 12px;

  // TODO use classes
  dt {
    margin-top: 16px;
    margin-bottom: 8px;
    font-size: $table-header-size;
    color: $core-text-annotation; // same as table header
  }

  dd {
    margin-bottom: 1.5em;
    margin-left: 0;
  }

  .group-list {
    padding: 0;
    margin: 0;
    &-item {
      display: inline;
      margin: 0;
      list-style: none;
      &:not(:last-child)::after {
        content: ', ';
      }
    }
  }

  .title-lesson-icon {
    display: inline-block;
    margin-right: 0.5em;
    font-size: 1.8em;
    /deep/ .ui-icon {
      vertical-align: bottom;
    }
  }

  .change-status-button {
    margin-left: 0.5em;
    vertical-align: sub; // hack for now
  }

  .lesson-summary-header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    button {
      align-self: flex-end;
    }
  }

  .lesson-summary-header-title {
    display: inline-block;
  }

</style>
