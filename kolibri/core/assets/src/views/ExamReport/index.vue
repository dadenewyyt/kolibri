<template>

  <MultiPaneLayout ref="multiPaneLayout">
    <PageStatus
      slot="header"
      :contentName="exam.title"
      :userName="userName"
      :questions="examAttempts"
      :completionTimestamp="completionTimestamp"
      :completed="closed"
    />

    <AttemptLogList
      slot="aside"
      :attemptLogs="attemptLogs"
      :selectedQuestionNumber="questionNumber"
      @select="handleNavigateToQuestion"
    />

    <div slot="main" class="exercise-container">
      <h3>{{ $tr('question', {questionNumber: questionNumber + 1}) }}</h3>

      <KCheckbox
        :label="$tr('showCorrectAnswerLabel')"
        :checked="showCorrectAnswer"
        @change="toggleShowCorrectAnswer"
      />
      <InteractionList
        v-if="!showCorrectAnswer"
        :interactions="currentInteractionHistory"
        :selectedInteractionIndex="selectedInteractionIndex"
        @select="navigateToQuestionAttempt"
      />
      <ContentRenderer
        :id="exercise.pk"
        :itemId="itemId"
        :allowHints="false"
        :kind="exercise.kind"
        :files="exercise.files"
        :contentId="exercise.content_id"
        :available="exercise.available"
        :extraFields="exercise.extra_fields"
        :interactive="false"
        :assessment="true"
        :answerState="answerState"
        :showCorrectAnswer="showCorrectAnswer"
      />
    </div>
  </MultiPaneLayout>

</template>


<script>

  import { mapState } from 'vuex';
  import ImmersiveFullScreen from 'kolibri.coreVue.components.ImmersiveFullScreen';
  import ContentRenderer from 'kolibri.coreVue.components.ContentRenderer';
  import AttemptLogList from 'kolibri.coreVue.components.AttemptLogList';
  import InteractionList from 'kolibri.coreVue.components.InteractionList';
  import KButton from 'kolibri.coreVue.components.KButton';
  import KCheckbox from 'kolibri.coreVue.components.KCheckbox';
  import find from 'lodash/find';
  import MultiPaneLayout from 'kolibri.coreVue.components.MultiPaneLayout';
  import PageStatus from './PageStatus';

  export default {
    name: 'ExamReport',
    $trs: {
      backTo: 'Back to exam report for { title }',
      correctAnswer: 'Correct answer',
      yourAnswer: 'Your answer',
      correctAnswerCannotBeDisplayed: 'Correct answer cannot be displayed',
      question: 'Question { questionNumber, number }',
      showCorrectAnswerLabel: 'Show correct answer',
    },
    components: {
      ImmersiveFullScreen,
      ContentRenderer,
      PageStatus,
      AttemptLogList,
      InteractionList,
      KButton,
      KCheckbox,
      MultiPaneLayout,
    },
    props: {
      examAttempts: {
        type: Array,
        required: true,
      },
      exam: {
        type: Object,
        required: true,
      },
      userName: {
        type: String,
        required: true,
      },
      userId: {
        type: String,
        required: true,
      },
      currentAttempt: {
        type: Object,
        required: true,
      },
      currentInteractionHistory: {
        type: Array,
        required: true,
      },
      currentInteraction: {
        type: Object,
        required: false,
        default: null,
      },
      selectedInteractionIndex: {
        type: Number,
        required: true,
      },
      questionNumber: {
        type: Number,
        required: true,
      },
      exercise: {
        type: Object,
        required: true,
      },
      itemId: {
        type: String,
        required: true,
      },
      completionTimestamp: {
        type: Date,
        required: false,
        default: null,
      },
      closed: {
        type: Boolean,
        required: true,
      },
      backPageLink: {
        type: Object,
        required: true,
      },
      navigateToQuestion: {
        type: Function,
        required: true,
      },
      navigateToQuestionAttempt: {
        type: Function,
        required: true,
      },
    },
    data() {
      return {
        showCorrectAnswer: false,
      };
    },
    computed: {
      ...mapState({
        questions: state => state.pageState.questions,
        exerciseContentNodes: state => state.pageState.exerciseContentNodes,
      }),
      attemptLogs() {
        return this.examAttempts.map(attempt => {
          const questionId = this.questions[attempt.questionNumber - 1].contentId;
          const num_coach_contents = find(this.exerciseContentNodes, { id: questionId })
            .num_coach_contents;
          return { ...attempt, num_coach_contents };
        });
      },
      answerState() {
        // Do not pass in answerState if showCorrectAnswer is set to true
        // answerState has a precedence over showCorrectAnswer
        if (
          !this.showCorrectAnswer &&
          this.currentInteraction &&
          this.currentInteraction.type === 'answer'
        ) {
          return this.currentInteraction.answer;
        }
        return null;
      },
    },
    methods: {
      handleNavigateToQuestion(questionNumber) {
        this.navigateToQuestion(questionNumber);
        this.$refs.multiPaneLayout.scrollMainToTop();
        this.showCorrectAnswer = false;
      },
      toggleShowCorrectAnswer() {
        this.showCorrectAnswer = !this.showCorrectAnswer;
        this.$forceUpdate();
      },
    },
  };

</script>


<style lang="scss" scoped>

  @import '~kolibri.styles.definitions';

  .exercise-container {
    padding: 8px;
    background-color: $core-bg-light;
  }

  h3 {
    margin-top: 0;
  }

</style>
