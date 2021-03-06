<template>

  <div>

    <KGrid>
      <KGridItem sizes="100, 50, 50" percentage>
        <h1>{{ $tr('users') }}</h1>
      </KGridItem>
      <KGridItem sizes="100, 50, 50" percentage align="right">
        <KButton
          @click="displayModal(Modals.CREATE_USER)"
          :text="$tr('addNew')"
          :primary="true"
        />
      </KGridItem>
      <KGridItem sizes="3, 3, 3">
        <KSelect
          :label="$tr('filterUserType')"
          :options="userKinds"
          :inline="true"
          v-model="roleFilter"
          class="type-filter"
        />
      </KGridItem>
      <KGridItem sizes="4, 5, 5">
        <KFilterTextbox
          :placeholder="$tr('searchText')"
          v-model="searchFilter"
          class="user-filter"
        />
      </KGridItem>
    </KGrid>

    <UserTable
      class="user-roster"
      :users="visibleUsers"
      :emptyMessage="emptyMessage"
    >
      <template slot="action" slot-scope="userRow">
        <KDropdownMenu
          :text="$tr('manage')"
          :options="manageUserOptions(userRow.user.id)"
          :disabled="!userCanBeEdited(userRow.user)"
          appearance="flat-button"
          @select="handleManageUserSelection($event, userRow.user)"
        />
      </template>
    </UserTable>

    <!-- Modals -->
    <UserCreateModal v-if="modalShown===Modals.CREATE_USER" />

    <EditUserModal
      v-if="modalShown===Modals.EDIT_USER"
      :id="selectedUser.id"
      :name="selectedUser.full_name"
      :username="selectedUser.username"
      :kind="selectedUser.kind"
    />

    <ResetUserPasswordModal
      v-if="modalShown===Modals.RESET_USER_PASSWORD"
      :id="selectedUser.id"
      :name="selectedUser.full_name"
      :username="selectedUser.username"
    />

    <DeleteUserModal
      v-if="modalShown===Modals.DELETE_USER"
      :id="selectedUser.id"
      :name="selectedUser.full_name"
      :username="selectedUser.username"
    />

  </div>

</template>


<script>

  import { mapActions, mapState, mapGetters } from 'vuex';
  import UiIcon from 'keen-ui/src/UiIcon';
  import { UserKinds } from 'kolibri.coreVue.vuex.constants';
  import KButton from 'kolibri.coreVue.components.KButton';
  import KFilterTextbox from 'kolibri.coreVue.components.KFilterTextbox';
  import KDropdownMenu from 'kolibri.coreVue.components.KDropdownMenu';
  import KSelect from 'kolibri.coreVue.components.KSelect';
  import KGrid from 'kolibri.coreVue.components.KGrid';
  import KGridItem from 'kolibri.coreVue.components.KGridItem';
  import UserTable from '../UserTable';
  import { Modals } from '../../constants';
  import UserRole from '../UserRole';
  import { userMatchesFilter, filterAndSortUsers } from '../../userSearchUtils';
  import UserCreateModal from './UserCreateModal';
  import EditUserModal from './EditUserModal';
  import ResetUserPasswordModal from './ResetUserPasswordModal';
  import DeleteUserModal from './DeleteUserModal';

  const ALL_FILTER = 'all';

  export default {
    name: 'UserPage',
    metaInfo() {
      return {
        title: this.$tr('documentTitle'),
      };
    },
    components: {
      UserCreateModal,
      EditUserModal,
      ResetUserPasswordModal,
      DeleteUserModal,
      KButton,
      KFilterTextbox,
      KDropdownMenu,
      UserRole,
      KSelect,
      KGrid,
      KGridItem,
      UserTable,
      UiIcon,
    },
    data: () => ({
      searchFilter: '',
      roleFilter: null,
      selectedUser: null,
    }),
    computed: {
      ...mapGetters(['currentUserId', 'isSuperuser']),
      ...mapState({
        facilityUsers: state => state.pageState.facilityUsers,
        modalShown: state => state.pageState.modalShown,
      }),
      Modals: () => Modals,
      userKinds() {
        return [
          { label: this.$tr('allUsers'), value: ALL_FILTER },
          { label: this.$tr('learners'), value: UserKinds.LEARNER },
          { label: this.$tr('coaches'), value: UserKinds.COACH },
          { label: this.$tr('admins'), value: UserKinds.ADMIN },
        ];
      },
      visibleUsers() {
        return filterAndSortUsers(
          this.facilityUsers,
          user => userMatchesFilter(user, this.searchFilter) && this.userMatchesRole(user)
        );
      },
      emptyMessage() {
        if (this.facilityUsers.length === 0) {
          return this.$tr('noUsersExist');
        } else if (this.visibleUsers.length === 0) {
          return this.$tr('allUsersFilteredOut');
        }
        return '';
      },
    },
    beforeMount() {
      this.roleFilter = this.userKinds[0];
    },
    methods: {
      ...mapActions(['displayModal']),
      userMatchesRole(user) {
        const { value: filterKind } = this.roleFilter;
        if (filterKind === ALL_FILTER) {
          return true;
        }
        if (user.kind === UserKinds.ASSIGNABLE_COACH) {
          return filterKind === UserKinds.COACH;
        }
        return filterKind === user.kind;
      },
      manageUserOptions(userId) {
        return [
          { label: this.$tr('editUser'), value: Modals.EDIT_USER },
          { label: this.$tr('resetUserPassword'), value: Modals.RESET_USER_PASSWORD },
          {
            label: this.$tr('deleteUser'),
            value: Modals.DELETE_USER,
            disabled: userId === this.currentUserId,
          },
        ];
      },
      handleManageUserSelection(selection, user) {
        this.selectedUser = user;
        this.displayModal(selection.value);
      },
      userCanBeEdited(user) {
        // If logged-in user is a superuser, then they can edit anybody (including other SUs).
        // Otherwise, only non-SUs can be edited.
        return this.isSuperuser || !user.is_superuser;
      },
    },
    $trs: {
      filterUserType: 'User type',
      searchText: 'Search for a user…',
      allUsers: 'All',
      admins: 'Admins',
      coaches: 'Coaches',
      learners: 'Learners',
      addNew: 'Add New',
      fullName: 'Full name',
      users: 'Users',
      role: 'Role',
      username: 'Username',
      edit: 'Edit',
      noUsersExist: 'No users exist',
      allUsersFilteredOut: 'No users match the filter',
      manage: 'Manage',
      editUser: 'Edit',
      resetUserPassword: 'Reset password',
      deleteUser: 'Delete',
      userActions: 'User management actions',
      documentTitle: 'Manage Users',
    },
  };

</script>


<style lang="scss" scoped>

  .type-filter {
    margin-bottom: 0;
  }

  .user-filter {
    width: 100%;
    margin-top: 14px;
  }

  .user-roster {
    overflow-x: auto;
  }

</style>
