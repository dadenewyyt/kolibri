<template>

  <div>

    <!-- Cannot match spec with current core modal -->
    <!-- Should be its own component -->
    <KModal
      v-if="permissionPresetDetailsModalShown"
      :title=" $tr('facilityPermissionsPresetDetailsHeader')"
      :submitText="$tr('permissionsModalDismissText')"
      @cancel="hideFacilityPermissionsDetails"
      @submit="hideFacilityPermissionsDetails"
    >

      <dl class="permission-preset-human">
        <dt class="permission-preset-human-title">
          {{ $tr('selfManagedSetupTitle') }}
        </dt>
        <dd class="permission-preset-human-detail">
          {{ $tr('enabledUserSelfSignupPermissionDetail') }}
        </dd>
        <dd class="permission-preset-human-detail">
          {{ $tr('enabledAccountEditPermissionDetail') }}
        </dd>
      </dl>

      <dl class="permission-preset-human">
        <dt class="permission-preset-human-title">
          {{ $tr('adminManagedSetupTitle') }}
        </dt>
        <dd class="permission-preset-human-detail">
          {{ $tr('disabledUserSelfSignupPermissionDetail') }}
        </dd>
        <dd class="permission-preset-human-detail">
          {{ $tr('enabledUserPasswordlessLoginPermissionDetail') }}
        </dd>
        <dd class="permission-preset-human-detail">
          {{ $tr('disabledAccountEditPermissionDetail') }}
        </dd>
      </dl>

      <dl class="permission-preset-human">
        <dt class="permission-preset-human-title">
          {{ $tr('informalSetupTitle') }}
        </dt>
        <dd class="permission-preset-human-detail">
          {{ $tr('disabledUserSelfSignupPermissionDetail') }}
        </dd>
        <dd class="permission-preset-human-detail">
          {{ $tr('enabledAccountEditPermissionDetail') }}
        </dd>
      </dl>
    </KModal>

    <OnboardingForm
      :header="$tr('facilityPermissionsSetupFormHeader')"
      :description="$tr('facilityPermissionsSetupFormDescription')"
      :submitText="submitText"
      @submit="setPermissions"
    >

      <KRadioButton
        ref="first-button"
        class="permission-preset-radio-button"
        v-model="selectedPreset"
        value="nonformal"
        :label="$tr('selfManagedSetupTitle')"
        :description="$tr('selfManagedSetupDescription')"
      />

      <KRadioButton
        class="permission-preset-radio-button"
        v-model="selectedPreset"
        value="formal"
        :label="$tr('adminManagedSetupTitle')"
        :description="$tr('adminManagedSetupDescription')"
      />

      <KRadioButton
        class="permission-preset-radio-button"
        v-model="selectedPreset"
        value="informal"
        :label="$tr('informalSetupTitle')"
        :description="$tr('informalSetupDescription')"
      />

      <KButton
        slot="footer"
        appearance="basic-link"
        :text="$tr('facilityPermissionsPresetDetailsLink')"
        @click="showFacilityPermissionsDetails"
      />


    </OnboardingForm>

  </div>

</template>


<script>

  import { mapActions } from 'vuex';
  import KRadioButton from 'kolibri.coreVue.components.KRadioButton';
  import KButton from 'kolibri.coreVue.components.KButton';
  import KModal from 'kolibri.coreVue.components.KModal';
  import OnboardingForm from '../OnboardingForm';

  export default {
    name: 'FacilityPermissionsForm',
    components: {
      OnboardingForm,
      KRadioButton,
      KButton,
      KModal,
    },
    $trs: {
      facilityPermissionsSetupFormHeader: 'Choose a Facility setup',
      facilityPermissionsSetupFormDescription:
        'How will you be using Kolibri? (You can customize these settings later)',
      facilityPermissionsPresetDetailsLink: 'More information about these settings',
      facilityPermissionsPresetDetailsHeader: 'Facility setup details',
      adminManagedSetupTitle: 'Admin-managed',
      adminManagedSetupDescription: 'For schools and other formal learning contexts',
      selfManagedSetupTitle: 'Self-managed',
      selfManagedSetupDescription:
        'For libraries, orphanages, correctional facilities, youth centers, computer labs, and other non-formal learning contexts',
      informalSetupTitle: 'Informal and personal use',
      informalSetupDescription:
        'For parent-child learning, homeschooling, or supplementary individual learning',
      // IDEA This should be a dynamically generated component, based on mappings
      permissionsModalDismissText: 'Close',
      enabledUserAccountDeletionPermissionDetail: 'Guests can create their own accounts',
      disabledUserAccountDeletionPermissionDetail: 'Admins must create all user accounts',
      enabledAccountEditPermissionDetail: 'Users can edit their account information', //  QUESTION might be worth using select?
      disabledAccountEditPermissionDetail: 'Users cannot edit their account information',
      enabledUserPasswordlessLoginPermissionDetail: 'Users can sign in without their passwords',
      enabledUserSelfSignupPermissionDetail: 'Guests can create their own accounts',
      disabledUserSelfSignupPermissionDetail: 'Admins must create all user accounts',
    },
    props: {
      submitText: {
        type: String,
        required: true,
      },
    },
    data() {
      return {
        selectedPreset: this.$store.state.onboardingData.preset,
        permissionPresetDetailsModalShown: false,
      };
    },
    mounted() {
      this.$refs['first-button'].focus();
    },
    methods: {
      ...mapActions(['submitFacilityPermissions']),
      setPermissions() {
        this.submitFacilityPermissions(this.selectedPreset);
        this.$emit('submit');
      },
      showFacilityPermissionsDetails() {
        this.permissionPresetDetailsModalShown = true;
      },
      hideFacilityPermissionsDetails() {
        this.permissionPresetDetailsModalShown = false;
      },
    },
  };

</script>


<style lang="scss" scoped>

  @import '~kolibri.styles.definitions';

  $margin-of-radio-button-text: 32px;

  .permission-preset {
    cursor: pointer;

    &-modal {
      &-dismiss-button {
        text-transform: uppercase;
      }
    }
  }

  .permission-preset-human {
    margin-bottom: 8px;
    &-title {
      font-weight: bold;
    }
    &-detail {
      display: list-item;
      margin-left: 20px;
      line-height: 1.4em;
    }
  }

</style>
