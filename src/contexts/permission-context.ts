import { createContext, useContext } from 'react';
import { UserRoleMenu } from '@/types/role';

export interface PermissionContextType {
  roleMenus: UserRoleMenu[];
  hasMenuPermission: (
    menuNames: string | string[],
    requiredPermissions: string | string[],
    mode?: 'any' | 'all',
  ) => boolean;
  canAccessMenu: (menuNames: string | string[]) => boolean;
  getMenuPermissions: (menuNames: string | string[]) => string[];
  setMenuPermissions: (roleMenus: UserRoleMenu[]) => void;
  clearPermissions: () => void;
}

export const PermissionContext = createContext<PermissionContextType>({
  roleMenus: [],
  hasMenuPermission: () => false,
  canAccessMenu: () => false,
  getMenuPermissions: () => [],
  setMenuPermissions: () => {},
  clearPermissions: () => {},
});

export function usePermissions() {
  return useContext(PermissionContext);
}
