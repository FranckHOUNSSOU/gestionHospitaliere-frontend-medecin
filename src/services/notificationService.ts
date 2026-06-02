import client from './clients';

export interface Notification {
  id: string;
  message: string;
  lu: boolean;
  rdvId: string | null;
  createdAt: string;
}

export const getNotifications = () =>
  client.get<Notification[]>('/notifications/moi');

export const getUnreadCount = () =>
  client.get<{ count: number }>('/notifications/moi/count');

export const marquerLu = (id: string) =>
  client.patch(`/notifications/${id}/lire`);

export const marquerToutLu = () =>
  client.patch('/notifications/moi/lire-tout');
