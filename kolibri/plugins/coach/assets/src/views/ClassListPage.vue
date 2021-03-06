<template>

  <div>

    <AuthMessage
      v-if="noClassesExist"
      :header="$tr('noAssignedClassesHeader')"
      :details="$tr('noAssignedClassesDetails')"
    />

    <template v-else>
      <section>
        <h1>{{ $tr('classPageHeader') }}</h1>
        <p>{{ $tr('classPageSubheader') }}</p>
      </section>

      <CoreTable>
        <caption class="visuallyhidden">{{ $tr('tableCaption') }}</caption>
        <thead slot="thead">
          <tr>
            <th class="core-table-icon-col"></th>
            <th class="core-table-main-col">{{ $tr('classroomName') }}</th>
            <th>{{ $tr('coachesColumnHeader') }}</th>
            <th>{{ $tr('learnerColumnHeader') }}</th>
          </tr>
        </thead>

        <tbody slot="tbody">
          <tr
            v-for="classroom in sortedClasses"
            :key="classroom.id"
          >
            <td class="core-table-icon-col">
              <ContentIcon :kind="CLASSROOM" />
            </td>
            <td class="core-table-main-col">
              <KRouterLink
                :text="classroom.name"
                :to="learnerPageLink(classroom.id)"
              />
            </td>
            <td :title="formattedCoachNamesTooltip(classroom)">
              {{ formattedCoachNames(classroom) }}
            </td>
            <td>{{ classroom.learner_count }}</td>
          </tr>
        </tbody>
      </CoreTable>
    </template>

  </div>

</template>


<script>

  import { mapState } from 'vuex';
  import { ContentNodeKinds } from 'kolibri.coreVue.vuex.constants';
  import CoreTable from 'kolibri.coreVue.components.CoreTable';
  import AuthMessage from 'kolibri.coreVue.components.AuthMessage';
  import ContentIcon from 'kolibri.coreVue.components.ContentIcon';
  import orderBy from 'lodash/orderBy';
  import KRouterLink from 'kolibri.coreVue.components.KRouterLink';
  import { PageNames } from '../constants';
  import { filterAndSortUsers } from '../../../../facility_management/assets/src/userSearchUtils';

  function learnerPageLink(classId) {
    return {
      name: PageNames.LEARNER_LIST,
      params: { classId },
    };
  }

  export default {
    name: 'ClassListPage',
    metaInfo() {
      return {
        title: this.$tr('classPageHeader'),
      };
    },
    components: {
      AuthMessage,
      CoreTable,
      ContentIcon,
      KRouterLink,
    },
    computed: {
      ...mapState(['classList']),
      noClassesExist() {
        return this.classList.length === 0;
      },
      CLASSROOM: () => ContentNodeKinds.CLASSROOM,
      sortedClasses() {
        return orderBy(this.classList, [classroom => classroom.name.toUpperCase()], ['asc']);
      },
    },
    methods: {
      learnerPageLink,
      // Duplicated in manage-classroom-page
      coachNames(classroom) {
        const { coaches } = classroom;
        return filterAndSortUsers(coaches, () => true, 'full_name').map(
          ({ full_name }) => full_name
        );
      },
      formattedCoachNames(classroom) {
        const coach_names = this.coachNames(classroom);
        if (coach_names.length === 0) {
          return '–';
        }
        if (coach_names.length === 1) {
          return coach_names[0];
        }
        if (coach_names.length === 2) {
          return this.$tr('twoCoachNames', {
            name1: coach_names[0],
            name2: coach_names[1],
          });
        }
        return this.$tr('manyCoachNames', {
          name1: coach_names[0],
          name2: coach_names[1],
          numRemaining: coach_names.length - 2,
        });
      },
      formattedCoachNamesTooltip(classroom) {
        const coach_names = this.coachNames(classroom);
        if (coach_names.length > 2) {
          return coach_names.join('\n');
        }
        return null;
      },
    },
    $trs: {
      classPageHeader: 'Classes',
      classPageSubheader: 'View learner progress and class performance',
      classroomName: 'Class name',
      tableCaption: 'List of classes',
      noAssignedClassesHeader: "You aren't assigned to any classes",
      noAssignedClassesDetails:
        'To start coaching a class, please consult your Kolibri administrator',
      coachesColumnHeader: 'Coaches',
      learnerColumnHeader: 'Learners',
      classIconTableDescription: 'Class icon',
      twoCoachNames: '{name1}, {name2}',
      manyCoachNames: '{name1}, {name2}… (+{numRemaining, number})',
    },
  };

</script>


<style lang="scss" scoped></style>
