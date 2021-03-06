<template>

  <div class="signup-page">

    <UiToolbar type="colored" textColor="white">
      <template slot="icon">
        <CoreLogo class="app-bar-icon" />
      </template>
      <template slot="brand">
        {{ $tr('kolibri') }}
      </template>
      <div slot="actions">
        <router-link
          class="signin"
          :to="signInPage"
        >
          <span>{{ $tr('logIn') }}</span>
        </router-link>
      </div>
    </UiToolbar>

    <form
      class="signup-form"
      ref="form"
      @submit.prevent="signUp"
    >
      <UiAlert
        v-if="unknownError"
        type="error"
        @dismiss="resetSignUpState"
      >
        {{ errorMessage }}
      </UiAlert>

      <h1 class="signup-title">{{ $tr('createAccount') }}</h1>

      <KTextbox
        ref="name"
        id="name"
        type="text"
        autocomplete="name"
        :label="$tr('name')"
        :maxlength="120"
        :autofocus="true"
        :invalid="nameIsInvalid"
        :invalidText="nameIsInvalidText"
        @blur="nameBlurred = true"
        v-model="name"
      />

      <KTextbox
        ref="username"
        id="username"
        type="text"
        autocomplete="username"
        :label="$tr('username')"
        :maxlength="30"
        :invalid="usernameIsInvalid"
        :invalidText="usernameIsInvalidText"
        @blur="usernameBlurred = true"
        @input="resetSignUpState"
        v-model="username"
      />

      <KTextbox
        ref="password"
        id="password"
        type="password"
        autocomplete="new-password"
        :label="$tr('password')"
        :invalid="passwordIsInvalid"
        :invalidText="passwordIsInvalidText"
        @blur="passwordBlurred = true"
        v-model="password"
      />

      <KTextbox
        ref="confirmedPassword"
        id="confirmed-password"
        type="password"
        autocomplete="new-password"
        :label="$tr('reEnterPassword')"
        :invalid="confirmedPasswordIsInvalid"
        :invalidText="confirmedPasswordIsInvalidText"
        @blur="confirmedPasswordBlurred = true"
        v-model="confirmedPassword"
      />

      <KSelect
        :label="$tr('facility')"
        v-model="selectedFacility"
        :options="facilityList"
        :invalid="facilityIsInvalid"
        :invalidText="facilityIsInvalidText"
        @blur="facilityBlurred = true"
      />

      <KButton
        :disabled="busy"
        :primary="true"
        :text="$tr('finish')"
        type="submit"
        class="submit"
      />

    </form>

    <div class="footer">
      <LanguageSwitcherFooter />
    </div>
  </div>

</template>


<script>

  import { mapState, mapActions, mapGetters, mapMutations } from 'vuex';
  import { validateUsername } from 'kolibri.utils.validators';
  import KButton from 'kolibri.coreVue.components.KButton';
  import UiAlert from 'kolibri.coreVue.components.UiAlert';
  import KTextbox from 'kolibri.coreVue.components.KTextbox';
  import UiToolbar from 'keen-ui/src/UiToolbar';
  import CoreLogo from 'kolibri.coreVue.components.CoreLogo';
  import KSelect from 'kolibri.coreVue.components.KSelect';
  import { PageNames } from '../constants';
  import LanguageSwitcherFooter from './LanguageSwitcherFooter';

  export default {
    name: 'SignUpPage',
    $trs: {
      createAccount: 'Create an account',
      name: 'Full name',
      username: 'Username',
      password: 'Password',
      reEnterPassword: 'Re-enter password',
      passwordMatchError: 'Passwords do not match',
      genericError: 'Something went wrong during sign up',
      usernameAlphaNumError: 'Username can only contain letters, numbers, and underscores',
      usernameAlreadyExistsError: 'An account with that username already exists',
      logIn: 'Sign in',
      kolibri: 'Kolibri',
      finish: 'Finish',
      facility: 'Facility',
      required: 'This field is required',
      documentTitle: 'User Sign Up',
    },
    metaInfo() {
      return {
        title: this.$tr('documentTitle'),
      };
    },
    components: {
      KButton,
      UiAlert,
      KTextbox,
      UiToolbar,
      CoreLogo,
      KSelect,
      LanguageSwitcherFooter,
    },
    data: () => ({
      name: '',
      username: '',
      password: '',
      confirmedPassword: '',
      selectedFacility: {},
      nameBlurred: false,
      usernameBlurred: false,
      passwordBlurred: false,
      confirmedPasswordBlurred: false,
      facilityBlurred: false,
      formSubmitted: false,
    }),
    computed: {
      ...mapGetters(['facilities', 'session']),
      ...mapState({
        errorCode: state => state.pageState.errorCode,
        busy: state => state.pageState.busy,
        backendErrorMessage: state => state.pageState.errorMessage,
      }),
      signInPage() {
        return { name: PageNames.SIGN_IN };
      },
      facilityList() {
        return this.facilities.map(facility => ({
          label: facility.name,
          value: facility.id,
        }));
      },
      nameIsInvalidText() {
        if (this.nameBlurred || this.formSubmitted) {
          if (this.name === '') {
            return this.$tr('required');
          }
        }
        return '';
      },
      nameIsInvalid() {
        return Boolean(this.nameIsInvalidText);
      },
      usernameDoesNotExistYet() {
        if (this.errorCode === 400) {
          return false;
        }
        return true;
      },
      usernameIsInvalidText() {
        if (this.usernameBlurred || this.formSubmitted) {
          if (this.username === '') {
            return this.$tr('required');
          }
          if (!validateUsername(this.username)) {
            return this.$tr('usernameAlphaNumError');
          }
          if (!this.usernameDoesNotExistYet) {
            return this.$tr('usernameAlreadyExistsError');
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
            return this.$tr('passwordMatchError');
          }
        }
        return '';
      },
      confirmedPasswordIsInvalid() {
        return Boolean(this.confirmedPasswordIsInvalidText);
      },
      noFacilitySelected() {
        return !this.selectedFacility.value;
      },
      facilityIsInvalidText() {
        if (this.facilityBlurred || this.formSubmitted) {
          if (this.noFacilitySelected) {
            return this.$tr('required');
          }
        }
        return '';
      },
      facilityIsInvalid() {
        return Boolean(this.facilityIsInvalidText);
      },
      formIsValid() {
        return (
          !this.nameIsInvalid &&
          !this.usernameIsInvalid &&
          !this.passwordIsInvalid &&
          !this.confirmedPasswordIsInvalid &&
          !this.facilityIsInvalid
        );
      },
      unknownError() {
        if (this.errorCode) {
          return this.errorCode !== 400;
        }
        return false;
      },
      errorMessage() {
        return this.backendErrorMessage || this.$tr('genericError');
      },
    },
    beforeMount() {
      if (this.facilityList.length === 1) {
        this.selectedFacility = this.facilityList[0];
      }
    },
    methods: {
      ...mapActions(['signUpNewUser']),
      ...mapMutations({
        resetSignUpState: 'RESET_SIGN_UP_STATE',
      }),
      signUp() {
        this.formSubmitted = true;
        const canSubmit = this.formIsValid && !this.busy;
        if (canSubmit) {
          this.signUpNewUser({
            facility: this.selectedFacility.value,
            full_name: this.name,
            username: this.username,
            password: this.password,
          });
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
    },
  };

</script>


<style lang="scss" scoped>

  @import '~kolibri.styles.definitions';
  $iphone-5-width: 320px;
  $vertical-page-margin: 100px;
  $logo-size: 1.64 * 1.125;
  $logo-margin: 0.38 * $logo-size;

  // component, highest level
  .signup-page {
    width: 100%;
    height: 100%;
    overflow-y: auto;
  }

  .signin {
    margin-right: 1em;
    color: white;
    text-decoration: none;
  }

  // Form
  .signup-title {
    text-align: center;
  }

  .signup-form {
    width: $iphone-5-width - 20;
    margin-top: $vertical-page-margin;
    margin-right: auto;
    margin-left: auto;
  }

  .terms {
    height: 6em;
    padding: 0.5em;
    margin-bottom: 1em;
    overflow-y: scroll;
    color: $core-text-annotation;
    background-color: $core-bg-light;
    p {
      margin-top: 0;
    }
  }

  .app-bar-icon {
    height: 40px;
    margin-left: 0.25em;
  }

  .footer {
    margin: 36px;
    margin-top: 96px;
  }

  .submit {
    margin-left: 0;
  }

</style>
