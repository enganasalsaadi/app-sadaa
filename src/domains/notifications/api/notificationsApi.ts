import { baseApi } from '@/core/api';
import type { NotificationsPage } from '../types';

/** Inbox (contract §11.3). The unread count lives in `/me`, so every read refetches `User`. */
export const notificationsApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
    getNotifications: builder.infiniteQuery<NotificationsPage, void, number>({
      infiniteQueryOptions: {
        initialPageParam: 1,
        getNextPageParam: ({ meta }) =>
          meta.current_page < meta.last_page ? meta.current_page + 1 : undefined,
      },
      query: ({ pageParam }) => ({ url: '/user/notifications', params: { page: pageParam } }),
      providesTags: ['Notification'],
    }),
    markNotificationRead: builder.mutation<null, string>({
      query: id => ({ url: `/user/notifications/${id}/read`, method: 'POST' }),
      invalidatesTags: ['User'],
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const readAt = new Date().toISOString();
        const patch = dispatch(
          notificationsApi.util.updateQueryData('getNotifications', undefined, draft => {
            for (const page of draft.pages) {
              const item = page.items.find(entry => entry.id === id);
              if (item && !item.read_at) item.read_at = readAt;
            }
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),
    markAllNotificationsRead: builder.mutation<null, void>({
      query: () => ({ url: '/user/notifications/read-all', method: 'POST' }),
      invalidatesTags: ['User'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const readAt = new Date().toISOString();
        const patch = dispatch(
          notificationsApi.util.updateQueryData('getNotifications', undefined, draft => {
            for (const page of draft.pages) {
              for (const item of page.items) item.read_at ??= readAt;
            }
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),
  }),
});

export const {
  useGetNotificationsInfiniteQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} = notificationsApi;
