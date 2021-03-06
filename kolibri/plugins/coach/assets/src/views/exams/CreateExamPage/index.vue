<template>

  <div>
    <h1>{{ $tr('createNewExam') }}</h1>
    <KGrid>
      <KGridItem size="4">
        <KTextbox
          ref="title"
          :label="$tr('title')"
          :autofocus="true"
          :invalid="titleIsInvalid"
          :invalidText="titleIsInvalidText"
          :maxlength="100"
          @blur="titleBlurred = true"
          v-model.trim="inputTitle"
        />
      </KGridItem>
      <KGridItem size="3">
        <KTextbox
          ref="numQuest"
          type="number"
          :label="$tr('numQuestions')"
          :invalid="numQuestIsInvalid"
          :invalidText="numQuestIsInvalidText"
          @blur="numQuestBlurred = true"
          v-model.trim.number="inputNumQuestions"
        />
      </KGridItem>
    </KGrid>

    <h2>{{ $tr('chooseExercises') }}</h2>

    <div>
      <nav>
        <ol>
          <li
            v-for="(topic, index) in topic.breadcrumbs"
            :key="index"
            :class="breadCrumbClass(index)"
          >
            <button v-if="notLastBreadcrumb(index)" @click="handleGoToTopic(topic.id)">
              {{ topic.title }}
            </button>
            <strong v-else>{{ topic.title }}</strong>
          </li>
        </ol>
      </nav>

      <div>
        <transition name="fade" mode="out-in">
          <KCircularLoader
            v-if="loading"
            key="progress"
            :delay="false"
          />

          <CoreTable
            v-else
            key="table"
          >
            <thead slot="thead">
              <tr>
                <th class="core-table-checkbox-col">
                  <KCheckbox
                    :label="$tr('selectAll')"
                    :showLabel="false"
                    :checked="allExercisesWithinCurrentTopicSelected"
                    :indeterminate="someExercisesWithinCurrentTopicSelected"
                    :disabled="!subtopics.length && !exercises.length"
                    @change="changeSelection"
                  />
                </th>
                <th class="core-table-main-col">{{ $tr('name') }}</th>
                <th></th>
              </tr>
            </thead>
            <tbody slot="tbody">
              <ExerciseRow
                v-for="exercise in exercises"
                :key="exercise.id"
                :exerciseId="exercise.id"
                :exerciseTitle="exercise.title"
                :numCoachContents="exercise.num_coach_contents"
                :exerciseNumAssessments="exercise.numAssessments"
                :selectedExercises="selectedExercises"
                @addExercise="handleAddExercise"
                @removeExercise="handleRemoveExercise"
              />
              <TopicRow
                v-for="topic in subtopics"
                :key="topic.id"
                :topicId="topic.id"
                :topicTitle="topic.title"
                :numCoachContents="topic.num_coach_contents"
                :allExercisesWithinTopic="topic.allExercisesWithinTopic"
                :selectedExercises="selectedExercises"
                @goToTopic="handleGoToTopic"
                @addTopicExercises="handleAddTopicExercises"
                @removeTopicExercises="handleRemoveTopicExercises"
              />
            </tbody>
          </CoreTable>
        </transition>
      </div>
    </div>

    <div class="footer">
      <p>{{ $tr('selected', { count: selectedExercises.length }) }}</p>

      <UiAlert
        v-if="formIsInvalid"
        type="error"
        :dismissible="false"
      >
        {{ formIsInvalidText }}
      </UiAlert>

      <KButton :text="$tr('preview')" @click="preview" />

      <br>
      <KButton :text="$tr('finish')" :primary="true" @click="finish" :disabled="submitting" />
    </div>

    <PreviewNewExamModal
      v-if="showPreviewNewExamModal"
      :examQuestionSources="questionSources"
      :examSeed="seed"
      :examNumQuestions="inputNumQuestions"
      @randomize="randomize"
    />

  </div>

</template>


<script>

  import { mapState, mapActions } from 'vuex';
  import responsiveWindow from 'kolibri.coreVue.mixins.responsiveWindow';
  import KButton from 'kolibri.coreVue.components.KButton';
  import KCheckbox from 'kolibri.coreVue.components.KCheckbox';
  import KTextbox from 'kolibri.coreVue.components.KTextbox';
  import KGrid from 'kolibri.coreVue.components.KGrid';
  import KGridItem from 'kolibri.coreVue.components.KGridItem';
  import KCircularLoader from 'kolibri.coreVue.components.KCircularLoader';
  import UiAlert from 'kolibri.coreVue.components.UiAlert';
  import shuffle from 'lodash/shuffle';
  import orderBy from 'lodash/orderBy';
  import random from 'lodash/random';
  import CoreTable from 'kolibri.coreVue.components.CoreTable';
  import flatMap from 'lodash/flatMap';
  import { Modals as ExamModals } from '../../../constants/examConstants';
  import PreviewNewExamModal from './PreviewNewExamModal';
  import ExerciseRow from './ExerciseRow';
  import TopicRow from './TopicRow';

  export default {
    name: 'CreateExamPage',
    metaInfo() {
      return {
        title: this.$tr('documentTitle'),
      };
    },
    components: {
      KCircularLoader,
      KButton,
      KTextbox,
      KGrid,
      KGridItem,
      TopicRow,
      ExerciseRow,
      PreviewNewExamModal,
      KCheckbox,
      UiAlert,
      CoreTable,
    },
    mixins: [responsiveWindow],
    $trs: {
      createNewExam: 'Create a new exam',
      chooseExercises: 'Select exercises to pull questions from',
      selectAll: 'Select all',
      title: 'Exam title',
      numQuestions: 'Number of questions',
      examRequiresTitle: 'The exam requires a title',
      numQuestionsBetween: 'Enter a number between 1 and 50',
      numQuestionsExceed:
        'The max number of questions based on the exercises you selected is {maxQuestionsFromSelection}. Select more exercises to reach {inputNumQuestions} questions, or lower the number of questions to {maxQuestionsFromSelection}.',
      noneSelected: 'No exercises are selected',
      searchContent: 'Search for content within channel',
      preview: 'Preview',
      finish: 'Finish',
      added: 'Added',
      removed: 'Removed',
      selected:
        '{count, number, integer} {count, plural, one {Exercise} other {Exercises}} selected',
      name: 'Name',
      documentTitle: 'Create new exam',
    },
    data() {
      return {
        selectedChannel: '',
        inputTitle: '',
        inputNumQuestions: '',
        titleBlurred: false,
        numQuestBlurred: false,
        selectionMade: false,
        searchInput: '',
        loading: false,
        seed: this.generateRandomSeed(),
        selectAll: false,
        previewOrSubmissionAttempt: false,
        submitting: false,
        dummyChannelId: null,
      };
    },
    computed: {
      ...mapState(['classId']),
      ...mapState({
        topic: state => state.pageState.topic,
        subtopics: state => state.pageState.subtopics,
        exercises: state => state.pageState.exercises,
        selectedExercises: state => state.pageState.selectedExercises,
        examsModalSet: state => state.pageState.examsModalSet,
      }),
      titleIsInvalidText() {
        if (this.titleBlurred || this.previewOrSubmissionAttempt) {
          if (this.inputTitle === '') {
            return this.$tr('examRequiresTitle');
          }
        }
        return '';
      },
      titleIsInvalid() {
        return Boolean(this.titleIsInvalidText);
      },
      maxQuestionsFromSelection() {
        // in case numAssestments is null, return 0
        return this.selectedExercises.reduce(
          (sum, exercise) => sum + (exercise.numAssessments || 0),
          0
        );
      },
      numQuestExceedsSelection() {
        return this.inputNumQuestions > this.maxQuestionsFromSelection;
      },
      exercisesAreSelected() {
        return this.selectedExercises.length > 0;
      },
      numQuestIsInvalidText() {
        if (this.numQuestBlurred || this.previewOrSubmissionAttempt) {
          if (this.inputNumQuestions === '') {
            return this.$tr('numQuestionsBetween');
          }
          if (this.inputNumQuestions < 1 || this.inputNumQuestions > 50) {
            return this.$tr('numQuestionsBetween');
          }
          if (!Number.isInteger(this.inputNumQuestions)) {
            return this.$tr('numQuestionsBetween');
          }
          if (this.exercisesAreSelected && this.numQuestExceedsSelection) {
            return this.$tr('numQuestionsExceed', {
              inputNumQuestions: this.inputNumQuestions,
              maxQuestionsFromSelection: this.maxQuestionsFromSelection,
            });
          }
        }
        return '';
      },
      numQuestIsInvalid() {
        return Boolean(this.numQuestIsInvalidText);
      },
      selectionIsInvalidText() {
        if (this.selectionMade || this.previewOrSubmissionAttempt) {
          if (!this.exercisesAreSelected) {
            return this.$tr('noneSelected');
          }
        }
        return '';
      },
      selectionIsInvalid() {
        return Boolean(this.selectionIsInvalidText);
      },
      formIsInvalidText() {
        if (this.titleIsInvalid) {
          return this.titleIsInvalidText;
        }
        if (this.numQuestIsInvalid) {
          return this.numQuestIsInvalidText;
        }
        if (this.selectionIsInvalid) {
          return this.selectionIsInvalidText;
        }
        return '';
      },
      formIsInvalid() {
        return Boolean(this.formIsInvalidText);
      },
      allExercisesWithinCurrentTopic() {
        const subtopicExercises = flatMap(
          this.subtopics,
          subtopic => subtopic.allExercisesWithinTopic
        );
        return [...subtopicExercises, ...this.exercises];
      },
      allExercisesWithinCurrentTopicSelected() {
        if (this.allExercisesWithinCurrentTopic.length === 0) {
          return false;
        }
        return this.allExercisesWithinCurrentTopic.every(exercise =>
          this.selectedExercises.some(selectedExercise => selectedExercise.id === exercise.id)
        );
      },
      noExercisesWithinCurrentTopicSelected() {
        return this.allExercisesWithinCurrentTopic.every(
          exercise =>
            !this.selectedExercises.some(selectedExercise => selectedExercise.id === exercise.id)
        );
      },
      someExercisesWithinCurrentTopicSelected() {
        return (
          !this.allExercisesWithinCurrentTopicSelected &&
          !this.noExercisesWithinCurrentTopicSelected
        );
      },
      showPreviewNewExamModal() {
        return this.examsModalSet === ExamModals.PREVIEW_NEW_EXAM;
      },
      questionSources() {
        const questionSources = [];
        for (let i = 0; i < this.inputNumQuestions; i++) {
          const questionSourcesIndex = i % this.selectedExercises.length;
          if (questionSources[questionSourcesIndex]) {
            questionSources[questionSourcesIndex].number_of_questions += 1;
          } else {
            questionSources.push({
              exercise_id: this.selectedExercises[i].id,
              number_of_questions: 1,
              title: this.selectedExercises[i].title,
            });
          }
        }
        return orderBy(questionSources, [exercise => exercise.title.toLowerCase()]);
      },
    },
    methods: {
      ...mapActions([
        'createSnackbar',
        'goToTopic',
        'goToTopLevel',
        'createExamAndRoute',
        'addExercise',
        'addExercisesToExam',
        'removeExercisesFromExam',
        'removeExercise',
        'setExamsModal',
        'setSelectedExercises',
      ]),
      setDummyChannelId(id) {
        if (!this.dummyChannelId) {
          this.dummyChannelId = id;
        }
      },
      changeSelection() {
        this.selectionMade = true;
        const allExercises = this.allExercisesWithinCurrentTopic;
        const currentTopicTitle = this.topic.title;
        if (this.allExercisesWithinCurrentTopicSelected) {
          this.handleRemoveTopicExercises(allExercises, currentTopicTitle);
        } else {
          this.handleAddTopicExercises(allExercises, currentTopicTitle);
        }
        if (!this.dummyChannelId) {
          this.setDummyChannelId(this.subtopics[0].id);
        }
      },
      handleGoToTopic(topicId) {
        this.loading = true;
        if (!topicId) {
          this.goToTopLevel().then(() => {
            this.loading = false;
          });
        } else {
          this.goToTopic(topicId).then(() => {
            this.loading = false;
          });
        }
        if (!this.dummyChannelId) {
          this.setDummyChannelId(topicId);
        }
      },
      handleAddExercise(exercise) {
        this.selectionMade = true;
        this.addExercise(exercise);
        this.createSnackbar({ text: `${this.$tr('added')} ${exercise.title}`, autoDismiss: true });
      },
      handleRemoveExercise(exercise) {
        this.removeExercise(exercise);
        this.createSnackbar({
          text: `${this.$tr('removed')} ${exercise.title}`,
          autoDismiss: true,
        });
      },
      handleAddTopicExercises(allExercisesWithinTopic, topicTitle, topicId) {
        this.selectionMade = true;
        this.addExercisesToExam(allExercisesWithinTopic);
        this.createSnackbar({ text: `${this.$tr('added')} ${topicTitle}`, autoDismiss: true });
        if (!this.dummyChannelId) {
          this.setDummyChannelId(topicId);
        }
      },
      handleRemoveTopicExercises(allExercisesWithinTopic, topicTitle) {
        this.removeExercisesFromExam(allExercisesWithinTopic);
        this.createSnackbar({ text: `${this.$tr('removed')} ${topicTitle}`, autoDismiss: true });
      },
      preview() {
        this.previewOrSubmissionAttempt = true;
        if (this.formIsInvalid) {
          this.focusOnInvalidField();
        } else {
          this.setExamsModal(ExamModals.PREVIEW_NEW_EXAM);
        }
      },
      finish() {
        this.previewOrSubmissionAttempt = true;
        if (this.formIsInvalid) {
          this.focusOnInvalidField();
        } else {
          this.submitting = true;
          const exam = {
            collection: this.classId,
            channel_id: this.dummyChannelId,
            title: this.inputTitle,
            question_count: this.inputNumQuestions,
            question_sources: this.questionSources,
            seed: this.seed,
            assignments: [{ collection: this.classId }],
          };
          this.createExamAndRoute(exam);
        }
      },
      focusOnInvalidField() {
        if (this.titleIsInvalid) {
          this.$refs.title.focus();
        } else if (this.numQuestIsInvalid) {
          this.$refs.numQuest.focus();
        }
      },
      notLastBreadcrumb(index) {
        return index !== this.topic.breadcrumbs.length - 1;
      },
      breadCrumbClass(index) {
        if (this.notLastBreadcrumb(index)) {
          return 'not-last';
        }
        return '';
      },
      generateRandomSeed() {
        return random(1000);
      },
      randomize() {
        this.seed = this.generateRandomSeed();
        this.setSelectedExercises(shuffle(this.selectedExercises));
      },
    },
  };

</script>


<style lang="scss" scoped>

  @import '~kolibri.styles.definitions';

  .footer {
    text-align: center;

    button {
      margin: auto;
      margin-bottom: 1em;
    }
  }

  ol {
    padding: 0.5em;
  }

  li {
    display: inline-block;

    button {
      padding: 0;
      font-size: 1em;
      vertical-align: baseline;
      border: 0;
    }
  }

  .not-last {
    &::after {
      padding-right: 0.5em;
      padding-left: 0.5em;
      content: '/';
    }
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.1s;
  }

  .fade-enter,
  .fade-leave-to .fade-leave-active {
    opacity: 0;
  }

  .validation-error {
    color: $core-text-error;
  }

</style>
