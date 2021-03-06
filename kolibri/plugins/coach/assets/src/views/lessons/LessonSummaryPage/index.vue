<template>

  <div class="lesson-summary">

    <AssignmentSummary
      :kind="lessonKind"
      :title="lessonTitle"
      :active="lessonActive"
      :description="lessonDescription"
      :recipients="lessonAssignments"
      :groups="learnerGroups"
      @changeStatus="setLessonsModal(AssignmentActions.CHANGE_STATUS)"
    >
      <KDropdownMenu
        slot="optionsDropdown"
        :text="$tr('options')"
        :options="lessonOptions"
        @select="handleSelectOption"
      />
    </AssignmentSummary>

    <div>
      <div class="resource-list">
        <div class="resource-list-header">
          <div class="resource-list-header-title-block">
            <h2 class="resource-list-header-title">{{ $tr('resources') }}</h2>
          </div>
          <div class="resource-list-header-add-resource-button">
            <KRouterLink
              :to="lessonSelectionRootPage"
              :text="$tr('addResourcesButtonPrompt')"
              :primary="true"
              appearance="raised-button"
            />
          </div>
        </div>
      </div>

      <ResourceListTable v-if="lessonResources.length" />

      <p v-else class="no-resources-message">
        {{ $tr('noResourcesInLesson') }}
      </p>

      <ManageLessonModals />
    </div>

  </div>

</template>


<script>

  import { mapState, mapActions } from 'vuex';
  import KDropdownMenu from 'kolibri.coreVue.components.KDropdownMenu';
  import KRouterLink from 'kolibri.coreVue.components.KRouterLink';
  import map from 'lodash/map';
  import { ContentNodeKinds } from 'kolibri.coreVue.vuex.constants';
  import { AssignmentActions } from '../../../constants/assignmentsConstants';
  import { selectionRootLink } from '../lessonsRouterUtils';
  import AssignmentSummary from '../../assignments/AssignmentSummary';
  import ManageLessonModals from './ManageLessonModals';
  import ResourceListTable from './ResourceListTable';

  export default {
    name: 'LessonSummaryPage',
    metaInfo() {
      return {
        title: this.lessonTitle,
      };
    },
    components: {
      KDropdownMenu,
      ResourceListTable,
      ManageLessonModals,
      KRouterLink,
      AssignmentSummary,
    },
    computed: {
      ...mapState({
        // IDEA refactor, make actions get all this information themselves.
        classId: state => state.classId,
        lessonId: state => state.pageState.currentLesson.id,
        lessonTitle: state => state.pageState.currentLesson.title,
        lessonActive: state => state.pageState.currentLesson.is_active,
        lessonDescription: state => state.pageState.currentLesson.description,
        lessonAssignments: state => state.pageState.currentLesson.lesson_assignments,
        lessonResources: state => state.pageState.currentLesson.resources,
        learnerGroups: state => state.pageState.learnerGroups,
      }),
      lessonOptions() {
        return map(this.actionsToLabelMap, (label, action) => ({
          label: this.$tr(label),
          action,
        }));
      },
      actionsToLabelMap() {
        return {
          [AssignmentActions.EDIT_DETAILS]: 'editLessonDetails',
          [AssignmentActions.COPY]: 'copyLesson',
          [AssignmentActions.DELETE]: 'deleteLesson',
        };
      },
      AssignmentActions() {
        return AssignmentActions;
      },
      lessonSelectionRootPage() {
        return selectionRootLink({ lessonId: this.lessonId, classId: this.classId });
      },
      lessonKind() {
        return ContentNodeKinds.LESSON;
      },
    },
    methods: {
      ...mapActions(['setLessonsModal']),
      handleSelectOption({ action }) {
        this.setLessonsModal(action);
      },
    },
    $trs: {
      // TODO make labels more semantic
      copyLesson: 'Copy lesson',
      deleteLesson: 'Delete',
      editLessonDetails: 'Edit details',
      noResourcesInLesson: 'No resources in this lesson',
      options: 'Options',
      resources: 'Resources',
      addResourcesButtonPrompt: 'Add resources',
    },
  };

</script>


<style lang="scss" scoped>

  .resource-list-header {
    // TODO use shared class or mixin
    // maintaining a simple right/left alignment in a single text-line without floats. Simple RTL
    display: table;
    width: 100%;

    &-title {
      display: inline-block;
      font-size: 1em;

      &-block {
        display: table-cell;
        text-align: left;
      }
    }

    &-add-resource-button {
      display: table-cell;
      text-align: right;
    }
  }

  .no-resources-message {
    padding: 48px 0;
    text-align: center;
  }

</style>
