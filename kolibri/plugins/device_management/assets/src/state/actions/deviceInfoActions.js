import client from 'kolibri.client';
import urls from 'kolibri.urls';
import samePageCheckGenerator from 'kolibri.utils.samePageCheckGenerator';
import ConditionalPromise from 'kolibri.lib.conditionalPromise';
import bytesForHumans from '../../views/ManageContentPage/bytesForHumans';

/* Function to fetch device info from the backend
 * and resolve validated data
 */
export function getDeviceInfo() {
  return client({ path: urls['deviceinfo']() }).then(response => {
    const data = response.entity;
    data.server_time = new Date(data.server_time);
    data.content_storage_free_space = bytesForHumans(data.content_storage_free_space);
    return data;
  });
}

/**
 * Action to hydrate device-info page.
 *
 * @param {Store} store
 * @returns Promise<void>
 */
export function showDeviceInfoPage(store) {
  if (store.getters.canManageContent) {
    const promises = ConditionalPromise.all([getDeviceInfo()]).only(samePageCheckGenerator(store))
      ._promise;
    return promises
      .then(function onSuccess([deviceInfo]) {
        store.commit('SET_DEVICE_INFO_PAGE_STATE', {
          deviceInfo,
        });
      })
      .catch(function onFailure(error) {
        store.dispatch('handleApiError', error);
      });
  }
  return Promise.resolve();
}
