import StaffLayout from '@/Layouts/StaffLayout';

export default function AdminLayout({ children, title }) {
    return <StaffLayout title={title}>{children}</StaffLayout>;
}
