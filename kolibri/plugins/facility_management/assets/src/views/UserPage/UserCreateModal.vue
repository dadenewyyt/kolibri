<template>

  <KModal
    :title="$tr('addNewAccountTitle')"
    :submitText="$tr('createAccount')"
    :cancelText="$tr('cancel')"
    :submitDisabled="submitting"
    @submit="createNewUser"
    @cancel="close"
  >
    <UiAlert type="error" v-if="errorMessage" @dismiss="errorMessage = ''">
      {{ errorMessage }}
    </UiAlert>

    <section>
      <KTextbox
        ref="name"
        type="text"
        :label="$tr('name')"
        :autofocus="true"
        :maxlength="120"
        :invalid="nameIsInvalid"
        :invalidText="nameIsInvalidText"
        @blur="nameBlurred = true"
        v-model.trim="fullName"
      />
      <KTextbox
        ref="username"
        type="text"
        :label="$tr('username')"
        :maxlength="30"
        :invalid="usernameIsInvalid"
        :invalidText="usernameIsInvalidText"
        @blur="usernameBlurred = true"
        v-model="username"
      />
      <KTextbox
        ref="password"
        type="password"
        :label="$tr('password')"
        :invalid="passwordIsInvalid"
        :invalidText="passwordIsInvalidText"
        @blur="passwordBlurred = true"
        v-model="password"
      />
      <KTextbox
        ref="confirmedPassword"
        type="password"
        :label="$tr('reEnterPassword')"
        :invalid="confirmedPasswordIsInvalid"
        :invalidText="confirmedPasswordIsInvalidText"
        @blur="confirmedPasswordBlurred = true"
        v-model="confirmedPassword"
      />

      <KSelect
        :label="$tr('userType')"
        :options="userKindDropdownOptions"
        v-model="kind"
      />

      <fieldset class="coach-selector" v-if="coachIsSelected">
        <KRadioButton
          :label="$tr('classCoachLabel')"
          :description="$tr('classCoachDescription')"
          :value="true"
          v-model="classCoach"
        />
        <KRadioButton
          :label="$tr('facilityCoachLabel')"
          :description="$tr('facilityCoachDescription')"
          :value="false"
          v-model="classCoach"
        />
      </fieldset>
    </section>
  </KModal>

</template>


<script>

  import { mapActions, mapState, mapGetters } from 'vuex';
  import { UserKinds } from 'kolibri.coreVue.vuex.constants';
  import { validateUsername } from 'kolibri.utils.validators';
  import KRadioButton from 'kolibri.coreVue.components.KRadioButton';
  import KModal from 'kolibri.coreVue.components.KModal';
  import KTextbox from 'kolibri.coreVue.components.KTextbox';
  import KSelect from 'kolibri.coreVue.components.KSelect';
  import UiAlert from 'kolibri.coreVue.components.UiAlert';

  export default {
    name: 'UserCreateModal',
    $trs: {
      addNewAccountTitle: 'Add new account',
      cancel: 'Cancel',
      name: 'Full name',
      username: 'Username',
      password: 'Password',
      reEnterPassword: 'Re-enter password',
      userType: 'User type',
      createAccount: 'Create Account',
      learner: 'Learner',
      coach: 'Coach',
      admin: 'Admin',
      coachSelectorHeader: 'Coach type',
      classCoachLabel: 'Class coach',
      classCoachDescription: "Can only instruct classes that they're assigned to",
      facilityCoachLabel: 'Facility coach',
      facilityCoachDescription: 'Can instruct all classes in your facility',
      usernameAlreadyExists: 'Username already exists',
      usernameNotAlphaNumUnderscore: 'Username can only contain letters, numbers, and underscores',
      pwMismatchError: 'Passwords do not match',
      unknownError: 'Whoops, something went wrong. Try again',
      loadingConfirmation: 'Loading...',
      required: 'This field is required',
    },
    components: {
      KRadioButton,
      KModal,
      KTextbox,
      UiAlert,
      KSelect,
    },
    data() {
      return {
        fullName: '',
        username: '',
        password: '',
        confirmedPassword: '',
        kind: {
          label: this.$tr('learner'),
          value: UserKinds.LEARNER,
        },
        classCoach: true,
        errorMessage: '',
        submitting: false,
        nameBlurred: false,
        usernameBlurred: false,
        passwordBlurred: false,
        confirmedPasswordBlurred: false,
        formSubmitted: false,
      };
    },
    computed: {
      ...mapGetters(['currentFacilityId']),
      ...mapState({
        facilityUsers: state => state.pageState.facilityUsers,
      }),
      newUserRole() {
        if (this.coachIsSelected) {
          if (this.classCoach) {
            return UserKinds.ASSIGNABLE_COACH;
          }
          return UserKinds.COACH;
        }
        // Admin or Learner
        return this.kind.value;
      },
      coachIsSelected() {
        return this.kind.value === UserKinds.COACH;
      },
      nameIsInvalidText() {
        if (this.nameBlurred || this.formSubmitted) {
          if (this.fullName === '') {
            return this.$tr('required');
          }
        }
        return '';
      },
      nameIsInvalid() {
        return Boolean(this.nameIsInvalidText);
      },
      usernameAlreadyExists() {
        return this.facilityUsers.find(
          ({ username }) => username.toLowerCase() === this.username.toLowerCase()
        );
      },
      usernameIsInvalidText() {
        if (this.usernameBlurred || this.formSubmitted) {
          if (this.username === '') {
            return this.$tr('required');
          }
          if (!validateUsername(this.username)) {
            return this.$tr('usernameNotAlphaNumUnderscore');
          }
          if (this.usernameAlreadyExists) {
            return this.$tr('usernameAlreadyExists');
          }
        }
        return '';
      },
      usernameIsInvalid() {
        return Boolean(this.usernameIsInvalidText);
      },
      passwordIsInvalidText() {
        if (this.passwordBlurred || this.formSubmitted) {
          if (this.password === '') {
            return this.$tr('required');
          }
        }
        return '';
      },
      passwordIsInvalid() {
        return Boolean(this.passwordIsInvalidText);
      },
      confirmedPasswordIsInvalidText() {
        if (this.confirmedPasswordBlurred || this.formSubmitted) {
          if (this.confirmedPassword === '') {
            return this.$tr('required');
          }
          if (this.confirmedPassword !== this.password) {
            return this.$tr('pwMismatchError');
          }
        }
        return '';
      },
      confirmedPasswordIsInvalid() {
        return Boolean(this.confirmedPasswordIsInvalidText);
      },
      formIsValid() {
        return (
          !this.nameIsInvalid &&
          !this.usernameIsInvalid &&
          !this.passwordIsInvalid &&
          !this.confirmedPasswordIsInvalid
        );
      },
      userKindDropdownOptions() {
        return [
          {
            label: this.$tr('learner'),
            value: UserKinds.LEARNER,
          },
          {
            label: this.$tr('coach'),
            value: UserKinds.COACH,
          },
          {
            label: this.$tr('admin'),
            value: UserKinds.ADMIN,
          },
        ];
      },
    },
    methods: {
      ...mapActions(['createUser', 'displayModal']),
      createNewUser() {
        this.errorMessage = '';
        this.formSubmitted = true;
        if (this.formIsValid) {
          this.submitting = true;
          this.createUser({
            username: this.username,
            full_name: this.fullName,
            role: {
              kind: this.newUserRole,
              collection: this.currentFacilityId,
            },
            password: this.password,
          }).then(
            () => {
              this.close();
            },
            error => {
              this.submitting = false;
              if (error.status.code === 400) {
                this.errorMessage = Object.values(error.entity)[0][0];
              } else if (error.status.code === 403) {
                this.errorMessage = error.entity;
              } else {
                this.errorMessage = this.$tr('unknownError');
              }
            }
          );
        } else {
          this.focusOnInvalidField();
        }
      },
      focusOnInvalidField() {
        if (this.nameIsInvalid) {
          this.$refs.name.focus();
        } else if (this.usernameIsInvalid) {
          this.$refs.username.focus();
        } else if (this.passwordIsInvalid) {
          this.$refs.password.focus();
        } else if (this.confirmedPasswordIsInvalid) {
          this.$refs.confirmedPassword.focus();
        }
      },
      close() {
        this.displayModal(false);
      },
    },
  };

</script>


<style lang="scss" scoped>

  .user-create-form {
    min-height: 500px;
  }

  .coach-selector {
    padding: 0;
    margin: 0;
    margin-bottom: 3em;
    border: 0;
  }

</style>
