<template>

  <div class="lesson-summary">
    <div class="lesson-summary-header">
      <div class="lesson-summary-header-title-block">
        <content-icon
          kind="lesson"
          class="title-lesson-icon"
        />
        <h1 class="lesson-summary-header-title">
          {{ lessonTitle }}
        </h1>
      </div>
      <div class="lesson-summary-header-options">
        <dropdown-menu
          :name="$tr('options')"
          :options="lessonOptions"
          @select="handleSelectOption"
        />
      </div>
    </div>
    <div>
      <dl>
        <dt>
          {{ $tr('status') }}
          <info-icon
            :iconAriaLabel="$tr('lessonStatusDescription')"
            :tooltipText="$tr('statusTooltipText')"
            tooltipPosition="bottom left"
          />
        </dt>
        <dd>
          <status-icon :active="lessonActive" />
          <k-button
            appearance="basic-link"
            class="change-status-button"
            :text="$tr('changeLessonStatus')"
            @click="currentAction=LessonActions.CHANGE_STATUS"
          />
        </dd>

        <dt>
          {{ $tr('description') }}
        </dt>
        <dd>
          {{ lessonDescription || $tr('noDescription') }}
        </dd>

        <dt>
          {{ $tr('visibleTo') }}
        </dt>
        <dd>
          <template v-if="!lessonAssignments.length">
            {{ this.$tr('noOne') }}
          </template>
          <template v-else-if="lessonIsAssignedToClass(lessonAssignments)">
            {{ this.$tr('entireClass') }}
          </template>
          <ul
            v-else
            class="group-list"
          >
            <li
              class="group-list-item"
              v-for="assignment in lessonAssignments"
              :key="assignment.id"
            >
              <span>{{ getGroupName(assignment) }}</span>
            </li>
          </ul>
        </dd>
      </dl>

      <div class="resource-list">
        <div class="resource-list-header">
          <div class="resource-list-header-title-block">
            <h2 class="resource-list-header-title">{{ $tr('resources') }}</h2>
          </div>
          <div class="resource-list-header-add-resource-button">
            <k-router-link
              :to="lessonSelectionRootPage"
              :text="$tr('addResourcesButtonPrompt')"
              :primary="true"
              appearance="raised-button"
            />
          </div>
        </div>
      </div>

      <core-table>
        <thead slot="thead">
          <tr>
            <th class="visuallyhidden core-table-icon-col">
              {{ $tr('resourceReorderColumnHeaderForTable') }}
            </th>
            <th class="core-table-main-col">
              {{ $tr('nameColumnHeaderForTable') }}
            </th>
            <th>
              {{ $tr('resourceProgressColumnHeaderForTable') }}
            </th>
            <th class="visuallyhidden">
              {{ $tr('resourceRemovalColumnHeaderForTable') }}
            </th>
          </tr>
        </thead>
        <transition-group
          name="resource-reorder"
          slot="tbody"
          tag="tbody"
        >
          <tr
            v-if="!removals.includes(resourceId)"
            :key="resourceId"
            v-for="(resourceId, index) in workingResources"
          >
            <td class="core-table-icon-col">
              <ui-icon-button
                type="flat"
                icon="keyboard_arrow_up"
                :ariaLabel="$tr('moveResourceUpButtonDescription')"
                :disabled="index === 0"
                @click="moveUpOne(index)"
                class="position-adjustment-button"
              />
              <ui-icon-button
                type="flat"
                icon="keyboard_arrow_down"
                :ariaLabel="$tr('moveResourceDownButtonDescription')"
                :disabled="index === (workingResources.length - 1)"
                @click="moveDownOne(index)"
                class="position-adjustment-button"
              />
            </td>
            <td>
              {{ resourceTitle(resourceId) }}
            </td>
            <td>
              <!-- TODO stubbed. Need progress endpoint that scopes by user -->
              <progress-bar
                v-if="false"
                class="resource-progress-bar"
                :progress="resourceProgress(resourceId)"
                :showPercentage="false"
              />
            </td>
            <td>
              <k-button
                :text="$tr('resourceRemovalButtonLabel')"
                @click="stageRemoval(index, resourceId)"
                appearance="flat-button"
              />
            </td>
          </tr>
        </transition-group>
      </core-table>

      <p v-if="workingResources.length===0" class="no-resources-message">
        {{ $tr('noResourcesInLesson') }}
      </p>

      <manage-lesson-modals
        :currentAction="currentAction"
        @cancel="currentAction=null"
      />
    </div>

  </div>

</template>


<script>

  import dropdownMenu from 'kolibri.coreVue.components.dropdownMenu';
  import kButton from 'kolibri.coreVue.components.kButton';
  import uiIconButton from 'keen-ui/src/UiIconButton';
  import progressBar from 'kolibri.coreVue.components.progressBar';
  import kRouterLink from 'kolibri.coreVue.components.kRouterLink';
  // why PascalCase?
  import coreTable from 'kolibri.coreVue.components.CoreTable';
  import map from 'lodash/map';
  import ManageLessonModals from '../ManageLessonModals';
  import { LessonActions, CollectionTypes } from '../../../lessonsConstants';
  import StatusIcon from '../StatusIcon';
  import contentIcon from 'kolibri.coreVue.components.contentIcon';
  import InfoIcon from '../InfoIcon';
  import { selectionRootLink } from '../lessonsRouterUtils';
  import { createSnackbar, clearSnackbar } from 'kolibri.coreVue.vuex.actions';
  import { saveLessonResources, updateCurrentLesson } from '../../../state/actions/lessons';
  import debounce from 'lodash/debounce';

  const removalSnackbarTime = 5000;
  const saveDebounceTime = 6000;

  // debounced function, pulling out of direct binding to preserve cancel() function
  const commitRemovals = debounce(function() {
    const remainingResources = this.workingResources.filter(
      resourceId => !this.removals.includes(resourceId)
    );
    this.removals = [];
    this.setWorkingResources(remainingResources);
    this.autoSave();
  }, removalSnackbarTime);

  export default {
    name: 'lessonSummaryPage',
    components: {
      dropdownMenu,
      ManageLessonModals,
      StatusIcon,
      contentIcon,
      kButton,
      uiIconButton,
      kRouterLink,
      InfoIcon,
      coreTable,
      progressBar,
    },
    data() {
      return {
        currentAction: null,
        removals: [],
      };
    },
    computed: {
      lessonOptions() {
        return map(this.actionsToLabelMap, (label, action) => ({
          label: this.$tr(label),
          action,
        }));
      },
      actionsToLabelMap() {
        return {
          [LessonActions.EDIT_DETAILS]: 'editLessonDetails',
          [LessonActions.COPY]: 'copyLesson',
          [LessonActions.DELETE]: 'deleteLesson',
        };
      },
      LessonActions() {
        return LessonActions;
      },
      lessonSelectionRootPage() {
        return selectionRootLink({ lessonId: this.lessonId, classId: this.classId });
      },
      removalMessage() {
        const numberOfRemovals = this.removals.length;

        if (!numberOfRemovals) {
          return '';
        } else if (numberOfRemovals === 1) {
          return this.$tr('singleResourceRemovalConfirmationMessage', {
            resourceTitle: this.resourceTitle(this.removals[0]),
          });
        }

        return this.$tr('multipleResourceRemovalsConfirmationMessage', {
          numberOfRemovals,
        });
      },
    },
    methods: {
      handleSelectOption({ action }) {
        this.currentAction = action;
      },
      lessonIsAssignedToClass(assignments) {
        return (
          assignments.length === 1 && assignments[0].collection_kind === CollectionTypes.CLASSROOM
        );
      },
      getGroupName(assignment) {
        return this.learnerGroups.find(lg => lg.id === assignment.collection).name;
      },
      resourceTitle(resourceId) {
        return this.resourceContentNodes[resourceId].title;
      },
      resourceProgress(resourceId) {
        return this.resourceContentNodes[resourceId].progress;
      },
      stageRemoval(index, resourceId) {
        this.removals.push(resourceId);

        this.createSnackbar({
          text: this.removalMessage,
          duration: removalSnackbarTime,
          autoDismiss: true,
          actionText: this.$tr('undoActionPrompt'),
          actionCallback: () => {
            this.removals = [];
            this.clearSnackbar();
          },
        });

        // cancel any pending calls to reset timer
        this.cancelCommitRemovals();
        this.commitRemovals();
      },
      commitRemovals,
      cancelCommitRemovals: commitRemovals.cancel,
      autoSave: debounce(function() {
        const modelResources = this.workingResources.map(resourceId => ({
          contentnode_id: resourceId,
        }));
        return this.saveLessonResources(this.lessonId, modelResources).then(() => {
          this.updateCurrentLesson(this.lessonId);
        });
      }, saveDebounceTime),
      moveUpOne(oldIndex) {
        this.shiftOne(oldIndex, oldIndex - 1);
      },
      moveDownOne(oldIndex) {
        this.shiftOne(oldIndex, oldIndex + 1);
      },
      shiftOne(oldIndex, newIndex) {
        // TODO measure performance, see if worth keeping over generalized shiftMany
        const resources = [...this.workingResources];
        const oldResourceId = resources[newIndex];
        resources[newIndex] = resources[oldIndex];
        resources[oldIndex] = oldResourceId;

        this.setWorkingResources(resources);
        this.autoSave();

        this.createSnackbar({
          text: this.$tr('resourceReorderConfirmationMessage'),
          autoDismiss: true,
        });
      },
      shiftMany(oldIndex, newIndex) {
        // to be used w/ drag and drop if we do this
        const resources = [...this.workingResources];
        // remove the resourceId from the array, store here
        const [resourceId] = resources.splice(oldIndex, 1);
        // re-add resourceId at the new index
        resources.splice(newIndex, 0, resourceId);

        this.setWorkingResources(resources);
        this.autoSave();
      },
    },
    vuex: {
      getters: {
        classId: state => state.classId,
        lessonId: state => state.pageState.currentLesson.id,
        lessonTitle: state => state.pageState.currentLesson.name,
        lessonActive: state => state.pageState.currentLesson.is_active,
        lessonDescription: state => state.pageState.currentLesson.description,
        lessonAssignments: state => state.pageState.currentLesson.assigned_groups,
        lessonResources: state => state.pageState.currentLesson.resources,
        workingResources: state => state.pageState.workingResources,
        // consider loading this async?
        resourceContentNodes: state => state.pageState.resourceContentNodes,
        learnerGroups: state => state.pageState.learnerGroups,
      },
      actions: {
        createSnackbar,
        clearSnackbar,
        saveLessonResources,
        updateCurrentLesson,
        removeFromWorkingResources(store, resourceId) {
          store.dispatch('REMOVE_FROM_WORKING_RESOURCES', resourceId);
        },
        setWorkingResources(store, resourceArray) {
          store.dispatch('SET_WORKING_RESOURCES', resourceArray);
        },
      },
    },
    $trs: {
      // TODO make labels more semantic
      active: 'Active',
      changeLessonStatus: 'Change',
      copyLesson: 'Copy lesson',
      deleteLesson: 'Delete',
      description: 'Description',
      editLessonDetails: 'Edit details',
      entireClass: 'Entire class',
      numberOfGroups: '{count, number, integer} {count, plural, one {group} other {groups}}',
      noOne: 'No one',
      inactive: 'Inactive',
      lessonStatusDescription: 'Lesson status description',
      noDescription: 'No description',
      noResourcesInLesson: 'No resources in this lesson',
      options: 'Options',
      resources: 'Resources',
      status: 'Status',
      statusTooltipText: 'Active: learners can see lesson. Inactive: hidden from learners.',
      visibleTo: 'Visible to',
      addResourcesButtonPrompt: 'Add resources',
      resourceReorderColumnHeaderForTable: 'Reorder buttons',
      nameColumnHeaderForTable: 'Name',
      resourceProgressColumnHeaderForTable: 'Resource progress',
      resourceRemovalColumnHeaderForTable: 'Removal button',
      resourceRemovalButtonLabel: 'Remove',
      resourceReorderConfirmationMessage: 'New lesson order saved',
      singleResourceRemovalConfirmationMessage: 'Removed { resourceTitle }',
      multipleResourceRemovalsConfirmationMessage: 'Removed { numberOfRemovals } resources',
      moveResourceUpButtonDescription: 'Move this resource one position up in this lesson',
      moveResourceDownButtonDescription: 'Move this resource one position down in this lesson',
      undoActionPrompt: 'Undo',
    },
  };

</script>


<style lang="stylus" scoped>

  @require '~kolibri.styles.definitions'
  $table-header-size = 12px


  .lesson-summary-header
    // maintaining a simple right/left alignment in a single text-line without floats. Simple RTL
    display: table
    width: 100%

    &-title
      display: inline-block

      &-block
        display: table-cell
        text-align: left

    &-options
      display: table-cell
      text-align: right

  // TODO use classes
  dt
    color: $core-text-annotation // same as table header
    font-size: $table-header-size
    margin-top: 16px
    margin-bottom: 16px

  dd
    margin-left: 0
    margin-bottom: 1.5em

  .group-list
    margin: 0
    padding: 0
    &-item
      margin: 0
      list-style: none
      display: inline
      &:not(:last-child)::after
        content: ', '

  .title-lesson-icon
    display: inline-block
    font-size: 1.8em
    margin-right: 0.5em
    >>>.ui-icon
      vertical-align: bottom

  .change-status-button
    vertical-align: sub // hack for now
    margin-left: 0.5em


  .resource-list-header
    // TODO use shared class or mixin
    // maintaining a simple right/left alignment in a single text-line without floats. Simple RTL
    display: table
    width: 100%

    &-title
      display: inline-block
      font-size: 1em

      &-block
        display: table-cell
        text-align: left

    &-add-resource-button
      display: table-cell
      text-align: right

  .position-adjustment-button
    display: block
    margin: 0

  .resource-reorder-move
    transition: transform 0.5s
    background-color: $core-bg-canvas // duping color set in core-table for selected

  .lesson-summary
    margin-bottom: 30px

  .no-resources-message
    text-align: center
    padding: 48px 0

</style>