from django.db.models import Sum
from le_utils.constants import content_kinds

from kolibri.core.content.models import ContentNode
from kolibri.core.content.models import LocalFile
from kolibri.core.content.utils.content_types_tools import renderable_contentnodes_q_filter


def get_files_to_transfer(channel_id, node_ids, exclude_node_ids, available, renderable_only=True):

    # build initial file and node querysets, which will be further filtered below
    files_to_transfer = LocalFile.objects.filter(available=available)
    nodes_to_include = ContentNode.objects.filter(channel_id=channel_id)

    # if requested, filter down to only include particular topics/nodes
    if node_ids:
        nodes_to_include = nodes_to_include.filter(pk__in=node_ids).get_descendants(include_self=True)

    # if requested, filter out nodes we're not able to render
    if renderable_only:
        nodes_to_include = nodes_to_include.filter(renderable_contentnodes_q_filter)

    # filter down the files query to only include files associated with the nodes we care about
    files_to_transfer = files_to_transfer.filter(files__contentnode__in=nodes_to_include)

    # filter down the query to remove files associated with nodes we've specifically been asked to exclude
    if exclude_node_ids:
        nodes_to_exclude = ContentNode.objects.filter(pk__in=exclude_node_ids).get_descendants(include_self=True)
        files_to_transfer = files_to_transfer.exclude(files__contentnode__in=nodes_to_exclude)

    # Make sure the files are unique, to avoid duplicating downloads
    files_to_transfer = files_to_transfer.distinct()

    # calculate the total file sizes across all files being returned in the queryset
    total_bytes_to_transfer = files_to_transfer.aggregate(Sum('file_size'))['file_size__sum'] or 0

    return files_to_transfer, total_bytes_to_transfer


def _get_node_ids(node_ids):

    return ContentNode.objects \
        .filter(pk__in=node_ids) \
        .get_descendants(include_self=True) \
        .values_list('id', flat=True)


def get_num_coach_contents(contentnode, filter_available=True):
    """
    Given a ContentNode model, return the number of Coach Contents underneath it
    """
    if contentnode.coach_content:
        if contentnode.kind == content_kinds.TOPIC:
            queryset = contentnode.get_descendants().filter(coach_content=True)

            if filter_available:
                queryset = queryset.filter(available=True)

            return queryset \
                .exclude(kind=content_kinds.TOPIC) \
                .distinct() \
                .count()
        else:
            # if the content kind is not a topic but it is marked as coach content the total
            # coach content count has to be 1 since this is the last node in the tree
            return 1
    else:
        # if this node is not marked as coach content, then all its descendants cannot be marked
        # as coach content as well, which is made sure by content annotation at import time
        return 0
