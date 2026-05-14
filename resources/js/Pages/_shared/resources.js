const roles = ['Syndic', 'Coproprietaire', 'Locataire'];
const notificationTypes = ['info', 'warning', 'error'];
const ticketStatuses = ['open', 'in_progress', 'closed'];
const chargeStatuses = ['pending', 'paid', 'overdue'];
const paymentStatuses = ['pending', 'validated'];

const text = (value = '') => value ?? '';
const bool = (value = false) => Boolean(value);
const dateValue = (value = '') => (value ? String(value).slice(0, 10) : '');

export const asOptions = (items = [], valueKey = 'id', labelKey = 'name') =>
    items.map((item) => ({
        value: item[valueKey],
        label: item[labelKey],
    }));

export const resourceConfigs = {
    users: {
        title: 'Users',
        singular: 'User',
        route: 'users',
        routeKey: 'id',
        indexColumns: [
            { key: 'name', label: 'Name' },
            { key: 'email', label: 'Email' },
            { key: 'phone_number', label: 'Phone' },
            { key: 'role', label: 'Role' },
            { key: 'invitation_status', label: 'Status' },
        ],
        formFields: [
            { name: 'name', label: 'Name', type: 'text' },
            { name: 'email', label: 'Email', type: 'email' },
            { name: 'phone_number', label: 'Phone Number', type: 'text' },
            { name: 'role', label: 'Role', type: 'select', options: roles },
            { name: 'password', label: 'Password', type: 'password' },
            {
                name: 'password_confirmation',
                label: 'Confirm Password',
                type: 'password',
            },
        ],
        showFields: [
            { name: 'name', label: 'Name' },
            { name: 'email', label: 'Email' },
            { name: 'phone_number', label: 'Phone' },
            { name: 'role', label: 'Role' },
            { name: 'invitation_status', label: 'Status' },
            { name: 'invitation_expires_at', label: 'Invitation Expiration' },
        ],
        toFormData: (record = {}) => ({
            name: text(record.name),
            email: text(record.email),
            phone_number: text(record.phone_number),
            role: record.role ?? 'Coproprietaire',
            password: '',
            password_confirmation: '',
        }),
    },
    residents: {
        title: 'Residents',
        singular: 'Resident',
        route: 'residents',
        routeKey: 'id',
        indexColumns: [
            { key: 'name', label: 'Name' },
            { key: 'email', label: 'Email' },
            { key: 'phone_number', label: 'Phone' },
        ],
        formFields: [
            { name: 'name', label: 'Name', type: 'text' },
            { name: 'email', label: 'Email', type: 'email' },
            { name: 'phone_number', label: 'Phone Number', type: 'text' },
            { name: 'password', label: 'Password', type: 'password' },
            {
                name: 'password_confirmation',
                label: 'Confirm Password',
                type: 'password',
            },
        ],
        showFields: [
            { name: 'name', label: 'Name' },
            { name: 'email', label: 'Email' },
            { name: 'phone_number', label: 'Phone' },
            { name: 'role', label: 'Role' },
        ],
        toFormData: (record = {}) => ({
            name: text(record.name),
            email: text(record.email),
            phone_number: text(record.phone_number),
            password: '',
            password_confirmation: '',
        }),
    },
    apartments: {
        title: 'Apartments',
        singular: 'Apartment',
        route: 'apartments',
        routeKey: 'id',
        indexColumns: [
            { key: 'number', label: 'Number' },
            { key: 'floor_id', label: 'Floor' },
            { key: 'user_id', label: 'Resident' },
            { key: 'area', label: 'Area' },
        ],
        formFields: [
            { name: 'number', label: 'Number', type: 'text' },
            { name: 'floor_id', label: 'Floor', type: 'select', options: [] },
            { name: 'user_id', label: 'Resident', type: 'select', options: [] },
            { name: 'area', label: 'Area', type: 'number', step: '0.01', min: '0' },
        ],
        showFields: [
            { name: 'number', label: 'Number' },
            { name: 'floor_id', label: 'Floor' },
            { name: 'user_id', label: 'Resident' },
            { name: 'area', label: 'Area' },
        ],
        toFormData: (record = {}) => ({
            number: text(record.number),
            floor_id: record.floor_id ?? '',
            user_id: record.user_id ?? '',
            area: record.area ?? '',
        }),
    },
    buildings: {
        title: 'Buildings',
        singular: 'Building',
        route: 'buildings',
        routeKey: 'id',
        indexColumns: [
            { key: 'name', label: 'Name' },
            { key: 'address', label: 'Address' },
        ],
        formFields: [
            { name: 'name', label: 'Name', type: 'text' },
            { name: 'address', label: 'Address', type: 'text' },
        ],
        showFields: [
            { name: 'name', label: 'Name' },
            { name: 'address', label: 'Address' },
        ],
        toFormData: (record = {}) => ({
            name: text(record.name),
            address: text(record.address),
        }),
    },
    floors: {
        title: 'Floors',
        singular: 'Floor',
        route: 'floors',
        routeKey: 'id',
        indexColumns: [
            { key: 'number', label: 'Number' },
            { key: 'building_id', label: 'Building' },
        ],
        formFields: [
            { name: 'number', label: 'Number', type: 'text' },
            { name: 'building_id', label: 'Building', type: 'select', options: [] },
        ],
        showFields: [
            { name: 'number', label: 'Number' },
            { name: 'building_id', label: 'Building' },
        ],
        toFormData: (record = {}) => ({
            number: text(record.number),
            building_id: record.building_id ?? '',
        }),
    },
    charges: {
        title: 'Charges',
        singular: 'Charge',
        route: 'charges',
        routeKey: 'id',
        indexColumns: [
            { key: 'description', label: 'Description' },
            { key: 'amount', label: 'Amount' },
            { key: 'date', label: 'Date' },
            { key: 'status', label: 'Status' },
        ],
        formFields: [
            { name: 'description', label: 'Description', type: 'text' },
            { name: 'amount', label: 'Amount', type: 'number', step: '0.01', min: '0' },
            { name: 'date', label: 'Date', type: 'date' },
            { name: 'apartment_id', label: 'Apartment', type: 'select', options: [] },
            { name: 'status', label: 'Status', type: 'select', options: chargeStatuses },
        ],
        showFields: [
            { name: 'description', label: 'Description' },
            { name: 'amount', label: 'Amount' },
            { name: 'date', label: 'Date' },
            { name: 'apartment_id', label: 'Apartment' },
            { name: 'status', label: 'Status' },
        ],
        toFormData: (record = {}) => ({
            description: text(record.description),
            amount: record.amount ?? '',
            date: dateValue(record.date),
            apartment_id: record.apartment_id ?? '',
            status: record.status ?? 'pending',
        }),
    },
    expenses: {
        title: 'Expenses',
        singular: 'Expense',
        route: 'expenses',
        routeKey: 'id',
        indexColumns: [
            { key: 'title', label: 'Title' },
            { key: 'amount', label: 'Amount' },
            { key: 'date', label: 'Date' },
        ],
        formFields: [
            { name: 'title', label: 'Title', type: 'text' },
            { name: 'description', label: 'Description', type: 'text' },
            { name: 'amount', label: 'Amount', type: 'number', step: '0.01', min: '0' },
            { name: 'date', label: 'Date', type: 'date' },
            { name: 'building_id', label: 'Building', type: 'select', options: [] },
        ],
        showFields: [
            { name: 'title', label: 'Title' },
            { name: 'description', label: 'Description' },
            { name: 'amount', label: 'Amount' },
            { name: 'date', label: 'Date' },
            { name: 'building_id', label: 'Building' },
        ],
        toFormData: (record = {}) => ({
            title: text(record.title),
            description: text(record.description),
            amount: record.amount ?? '',
            date: dateValue(record.date),
            building_id: record.building_id ?? '',
        }),
    },
    announcements: {
    title: 'Announcements',
    singular: 'Announcement',
    route: 'announcements',
    routeKey: 'id',
  indexColumns: [
    { key: 'title', label: 'Title' },
    { key: 'content', label: 'Content' }, // ← make sure it's 'content' not 'body'
],
    formFields: [
        { name: 'title', label: 'Title', type: 'text' },
        { name: 'content', label: 'Content', type: 'textarea', className: 'md:col-span-2' },
        {
            name: 'target_role',
            label: 'Target Role',
            type: 'select',
            options: [
                { value: 'all', label: 'All' },
                { value: 'copropriétaires', label: 'Copropriétaires' },
                { value: 'locataires', label: 'Locataires' },
            ],
        },
        {
            name: 'building_id',
            label: 'Building',
            type: 'select',
            options: [], // populate dynamically — see below
        },
    ],
    showFields: [
        { name: 'title', label: 'Title' },
        { name: 'content', label: 'Content' },
        { name: 'target_role', label: 'Target Role' },
    ],
    toFormData: (record = {}) => ({
        title: text(record.title),
        content: text(record.content),
        target_role: record.target_role ?? 'all',
        building_id: record.building_id ?? '',
    }),
},
    auditLogs: {
        title: 'Audit Logs',
        singular: 'Audit Log',
        route: 'audit-logs',
        routeKey: 'id',
        indexColumns: [
            { key: 'action', label: 'Action' },
            { key: 'details', label: 'Details' },
        ],
        formFields: [
            { name: 'action', label: 'Action', type: 'text' },
            { name: 'details', label: 'Details', type: 'textarea', className: 'md:col-span-2' },
        ],
        showFields: [
            { name: 'action', label: 'Action' },
            { name: 'details', label: 'Details' },
            { name: 'performed_by', label: 'Performed By' },
        ],
        toFormData: (record = {}) => ({
            action: text(record.action),
            details: text(record.details),
        }),
    },
    documents: {
        title: 'Documents',
        singular: 'Document',
        route: 'documents',
        routeKey: 'id',
        indexColumns: [
            { key: 'title', label: 'Title' },
            { key: 'file_path', label: 'File Path' },
        ],
        formFields: [
            { name: 'title', label: 'Title', type: 'text' },
            { name: 'file_path', label: 'File Path', type: 'text' },
        ],
        showFields: [
            { name: 'title', label: 'Title' },
            { name: 'file_path', label: 'File Path' },
            { name: 'uploaded_by', label: 'Uploaded By' },
        ],
        toFormData: (record = {}) => ({
            title: text(record.title),
            file_path: text(record.file_path),
        }),
    },
    notifications: {
        title: 'Alertes',
        singular: 'Alerte',
        route: 'notifications',
        routeKey: 'id',
        indexColumns: [
            { key: 'title', label: 'Title' },
            { key: 'message', label: 'Message' },
            {
                key: 'is_read',
                label: 'Status',
                render: (value) => (value ? 'Lu' : 'Non lu'),
            },
        ],
        formFields: [
            { name: 'title', label: 'Title', type: 'text' },
            { name: 'message', label: 'Message', type: 'textarea', className: 'md:col-span-2' },
            { name: 'user_id', label: 'User', type: 'select', options: [] },
            { name: 'type', label: 'Type', type: 'select', options: notificationTypes },
        ],
        showFields: [
            { name: 'title', label: 'Title' },
            { name: 'message', label: 'Message' },
            { name: 'user_id', label: 'User' },
            { name: 'type', label: 'Type' },
            {
                name: 'is_read',
                label: 'Statut',
                type: 'checkbox',
                helperText: 'Activer si deja lu',
                format: (value) => (value ? 'Lu' : 'Non lu'),
            },
        ],
        toFormData: (record = {}) => ({
            title: text(record.title),
            message: text(record.message),
            user_id: record.user_id ?? '',
            type: record.type ?? 'info',
            is_read: bool(record.is_read),
        }),
    },
    payments: {
        title: 'Payments',
        singular: 'Payment',
        route: 'payments',
        routeKey: 'id',
        indexColumns: [
            { key: 'amount', label: 'Amount' },
            { key: 'status', label: 'Status' },
            { key: 'payment_date', label: 'Payment Date' },
        ],
        formFields: [
            { name: 'amount', label: 'Amount', type: 'number', step: '0.01', min: '0' },
            { name: 'charge_id', label: 'Charge', type: 'select', options: [] },
            { name: 'status', label: 'Status', type: 'select', options: paymentStatuses },
            { name: 'payment_date', label: 'Payment Date', type: 'date' },
        ],
        showFields: [
            { name: 'amount', label: 'Amount' },
            { name: 'charge_id', label: 'Charge' },
            { name: 'status', label: 'Status' },
            { name: 'payment_date', label: 'Payment Date' },
        ],
        toFormData: (record = {}) => ({
            amount: record.amount ?? '',
            charge_id: record.charge_id ?? '',
            status: record.status ?? 'pending',
            payment_date: dateValue(record.payment_date),
        }),
    },
    receipts: {
        title: 'Receipts',
        singular: 'Receipt',
        route: 'receipts',
        routeKey: 'id',
        indexColumns: [
            { key: 'file_path', label: 'File Path' },
            { key: 'payment_id', label: 'Payment' },
        ],
        formFields: [
            { name: 'file_path', label: 'File Path', type: 'text' },
            { name: 'payment_id', label: 'Payment', type: 'select', options: [] },
        ],
        showFields: [
            { name: 'file_path', label: 'File Path' },
            { name: 'payment_id', label: 'Payment' },
        ],
        toFormData: (record = {}) => ({
            file_path: text(record.file_path),
            payment_id: record.payment_id ?? '',
        }),
    },
    tickets: {
        title: 'Tickets',
        singular: 'Ticket',
        route: 'tickets',
        routeKey: 'id',
        indexColumns: [
            { key: 'title', label: 'Title' },
            { key: 'description', label: 'Description' },
            { key: 'status', label: 'Status' },
        ],
        formFields: [
            { name: 'title', label: 'Title', type: 'text' },
            { name: 'description', label: 'Description', type: 'textarea', className: 'md:col-span-2' },
            { name: 'assigned_to', label: 'Assigned To', type: 'select', options: [] },
            { name: 'status', label: 'Status', type: 'select', options: ticketStatuses },
        ],
        showFields: [
            { name: 'title', label: 'Title' },
            { name: 'description', label: 'Description' },
            { name: 'status', label: 'Status' },
            { name: 'assingned_by', label: 'Created By' },
            { name: 'assigned_to', label: 'Assigned To' },
        ],
        toFormData: (record = {}) => ({
            title: text(record.title),
            description: text(record.description),
            assigned_to: record.assigned_to ?? '',
            status: record.status ?? 'open',
        }),
    },
    ticketMessages: {
        title: 'Ticket Messages',
        singular: 'Ticket Message',
        route: 'ticket-messages',
        routeKey: 'id',
        indexColumns: [
            { key: 'ticket_id', label: 'Ticket' },
            { key: 'message', label: 'Message' },
        ],
        formFields: [
            { name: 'ticket_id', label: 'Ticket', type: 'select', options: [] },
            { name: 'message', label: 'Message', type: 'textarea', className: 'md:col-span-2' },
        ],
        showFields: [
            { name: 'ticket_id', label: 'Ticket' },
            { name: 'message', label: 'Message' },
            { name: 'sender_id', label: 'Sender' },
        ],
        toFormData: (record = {}) => ({
            ticket_id: record.ticket_id ?? '',
            message: text(record.message),
        }),
    },
    cacheLocks: {
        title: 'Cache Locks',
        singular: 'Cache Lock',
        route: 'cache-locks',
        routeKey: 'key',
        indexColumns: [
            { key: 'key', label: 'Key' },
            { key: 'owner', label: 'Owner' },
            { key: 'expiration', label: 'Expiration' },
        ],
        formFields: [
            { name: 'key', label: 'Key', type: 'text' },
            { name: 'owner', label: 'Owner', type: 'text' },
            { name: 'expiration', label: 'Expiration', type: 'number', min: '0' },
        ],
        showFields: [
            { name: 'key', label: 'Key' },
            { name: 'owner', label: 'Owner' },
            { name: 'expiration', label: 'Expiration' },
        ],
        toFormData: (record = {}) => ({
            key: text(record.key),
            owner: text(record.owner),
            expiration: record.expiration ?? '',
        }),
    },
};

export const resourceLists = {
    roles,
    notificationTypes,
    ticketStatuses,
    chargeStatuses,
    paymentStatuses,
};
