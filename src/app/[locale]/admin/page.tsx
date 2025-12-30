'use client';

import { AdminDashboard } from '@/components/admin/AdminDashboard';

export default function AdminPage() {
    // TODO: 添加权限验证，仅允许 Nancy 访问
    return <AdminDashboard />;
}
