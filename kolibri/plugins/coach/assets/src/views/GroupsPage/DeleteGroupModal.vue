<template>

  <KModal
    :title="$tr('deleteLearnerGroup')"
    :submitText="$tr('deleteGroup')"
    :cancelText="$tr('cancel')"
    @submit="deleteGroup(groupId)"
    @cancel="close"
  >
    <p>{{ $tr('areYouSure', { groupName: groupName }) }}</p>
    <p>{{ $tr('learnersWillBecomeUngrouped') }}</p>
  </KModal>

</template>


<script>

  import { mapActions } from 'vuex';
  import KModal from 'kolibri.coreVue.components.KModal';
  import KTextbox from 'kolibri.coreVue.components.KTextbox';

  export default {
    name: 'DeleteGroupModal',
    $trs: {
      deleteLearnerGroup: 'Delete group',
      areYouSure: "Are you sure you want to delete '{ groupName }'?",
      learnersWillBecomeUngrouped: "Learners within this group will become 'Ungrouped'.",
      cancel: 'Cancel',
      deleteGroup: 'Delete group',
    },
    components: {
      KModal,
      KTextbox,
    },
    props: {
      groupName: {
        type: String,
        required: true,
      },
      groupId: {
        type: String,
        required: true,
      },
    },
    methods: {
      ...mapActions(['displayModal', 'deleteGroup']),
      close() {
        this.displayModal(false);
      },
    },
  };

</script>


<style lang="scss" scoped></style>
