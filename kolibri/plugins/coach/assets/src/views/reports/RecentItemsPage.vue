<template>

  <div>

    <Breadcrumbs />
    <h1>{{ $tr('title') }}</h1>

    <CoreTable>
      <thead slot="thead">
        <tr>
          <th class="core-table-icon-col"></th>
          <HeaderCell
            :text="$tr('name')"
            :align="alignStart"
            :sortable="true"
            :column="tableColumns.NAME"
          />
          <HeaderCell
            :text="$tr('progress')"
            :sortable="true"
            :column="tableColumns.CONTENT"
          />
          <HeaderCell
            :text="$tr('lastActivity')"
            :align="alignStart"
            :sortable="true"
            :column="tableColumns.DATE"
          />
        </tr>
      </thead>
      <tbody slot="tbody">
        <tr v-for="row in standardDataTable" :key="row.id">
          <td class="core-table-icon-col">
            <ContentIcon :kind="row.kind" />
          </td>
          <NameCell
            :kind="row.kind"
            :title="row.title"
            :link="genLink(row)"
            :numCoachContents="row.num_coach_contents"
          />
          <td>
            <ProgressBar :showPercentage="false" :progress="row.contentProgress" />
            {{ progressString(row) }}
          </td>
          <ActivityCell :date="row.lastActive" />
        </tr>
      </tbody>
    </CoreTable>

    <p v-if="!standardDataTable.length">
      {{ noProgressText }}
    </p>

  </div>

</template>


<script>

  import { mapState, mapGetters } from 'vuex';
  import CoreTable from 'kolibri.coreVue.components.CoreTable';
  import ContentIcon from 'kolibri.coreVue.components.ContentIcon';
  import { ContentNodeKinds } from 'kolibri.coreVue.vuex.constants';
  import ProgressBar from 'kolibri.coreVue.components.ProgressBar';
  import { standardDataTable } from '../../state/getters/reports';
  import { PageNames } from '../../constants';
  import { TableColumns, RECENCY_THRESHOLD_IN_DAYS } from '../../constants/reportConstants';
  import Breadcrumbs from './Breadcrumbs';
  import HeaderCell from './table-cells/HeaderCell';
  import NameCell from './table-cells/NameCell';
  import ActivityCell from './table-cells/ActivityCell';
  import alignMixin from './align-mixin';

  export default {
    name: 'RecentItemsPage',
    metaInfo() {
      return {
        title: this.$tr('documentTitle'),
      };
    },
    components: {
      CoreTable,
      Breadcrumbs,
      HeaderCell,
      NameCell,
      ActivityCell,
      ContentIcon,
      ProgressBar,
    },
    mixins: [alignMixin],
    $trs: {
      title: 'Recent activity',
      name: 'Name',
      progress: 'Class progress',
      reportProgress: '{completed} {descriptor}',
      listened: '{proportionCompleted} listened',
      opened: '{proportionCompleted} opened',
      watched: '{proportionCompleted} watched',
      mastered: '{proportionCompleted} completed',
      lastActivity: 'Last activity',
      noRecentProgress: 'No activity in past {threshold} days',
      documentTitle: 'Recent',
    },
    computed: {
      ...mapState(['classId', 'pageState']),
      ...mapGetters(['classMemberCount']),
      ...mapState({
        channelId: state => state.pageState.channelId,
        standardDataTable,
      }),
      tableColumns() {
        return TableColumns;
      },
      noProgressText() {
        return this.$tr('noRecentProgress', { threshold: RECENCY_THRESHOLD_IN_DAYS });
      },
    },
    methods: {
      progressString(row) {
        // string representation of a fraction, can't use completedProgress
        const proportionCompleted = `${row.logCountComplete}` + `/${this.classMemberCount}`;
        switch (row.kind) {
          case ContentNodeKinds.AUDIO:
            return this.$tr('listened', { proportionCompleted });
          case ContentNodeKinds.DOCUMENT:
            return this.$tr('opened', { proportionCompleted });
          case ContentNodeKinds.VIDEO:
            return this.$tr('watched', { proportionCompleted });
          case ContentNodeKinds.EXERCISE:
            return this.$tr('mastered', { proportionCompleted });
          case ContentNodeKinds.HTML5:
            return this.$tr('mastered', { proportionCompleted });
          default:
            return this.$tr('mastered', { proportionCompleted });
        }
      },
      genLink(row) {
        return {
          name: PageNames.RECENT_LEARNERS_FOR_ITEM,
          params: {
            classId: this.classId,
            channelId: this.channelId,
            contentId: row.id,
          },
        };
      },
    },
  };

</script>


<style lang="scss" scoped></style>
