const roles = [
    { value: 'Syndic', label: 'Syndic' },
    { value: 'Coproprietaire', label: 'Coproprietaire' },
    { value: 'Locataire', label: 'Locataire' },
];

const notificationTypes = [
    { value: 'info', label: 'Information' },
    { value: 'warning', label: 'Avertissement' },
    { value: 'error', label: 'Erreur' },
];

const ticketStatuses = [
    { value: 'open', label: 'Ouvert' },
    { value: 'in_progress', label: 'En cours' },
    { value: 'closed', label: 'Ferme' },
];

const chargeStatuses = [
    { value: 'pending', label: 'En attente' },
    { value: 'paid', label: 'Payee' },
    { value: 'overdue', label: 'En retard' },
];

const paymentStatuses = [
    { value: 'pending', label: 'En attente' },
    { value: 'validated', label: 'Valide' },
];

const documentTargetTypes = [
    { value: 'all', label: 'Tout le monde' },
    { value: 'building', label: 'Immeuble' },
    { value: 'apartment', label: 'Lot' },
    { value: 'role', label: 'Role' },
];

const documentTargetRoles = [
    { value: 'Coproprietaire', label: 'Coproprietaire' },
    { value: 'Locataire', label: 'Locataire' },
];

const announcementTargetRoles = [
    { value: 'all', label: 'Tous' },
    { value: 'coproprietaires', label: 'Copropriétaires' },
    { value: 'locataires', label: 'Locataires' },
];

const text = (value = '') => value ?? '';
const bool = (value = false) => Boolean(value);
const dateValue = (value = '') => (value ? String(value).slice(0, 10) : '');
const optionLabelFor = (options, value) =>
    options.find((option) => option.value === value)?.label ?? value ?? '-';

export const asOptions = (items = [], valueKey = 'id', labelKey = 'name') =>
    items.map((item) => ({
        value: item[valueKey],
        label: item[labelKey],
    }));

export const resourceConfigs = {
    users: {
        title: 'Membres',
        singular: 'membre',
        route: 'users',
        routeKey: 'id',
        indexColumns: [
            { key: 'name', label: 'Nom' },
            { key: 'email', label: 'Email' },
            { key: 'phone_number', label: 'Telephone' },
            { key: 'role', label: 'Role', render: (value) => optionLabelFor(roles, value) },
            { key: 'invitation_status', label: 'Statut' },
        ],
        formFields: [
            { name: 'name', label: 'Nom', type: 'text' },
            { name: 'email', label: 'Email', type: 'email' },
            { name: 'phone_number', label: 'Telephone', type: 'text' },
            { name: 'role', label: 'Role', type: 'select', options: roles },
            { name: 'password', label: 'Mot de passe', type: 'password' },
            {
                name: 'password_confirmation',
                label: 'Confirmer le mot de passe',
                type: 'password',
            },
        ],
        showFields: [
            { name: 'name', label: 'Nom' },
            { name: 'email', label: 'Email' },
            { name: 'phone_number', label: 'Telephone' },
            { name: 'role', label: 'Role', format: (value) => optionLabelFor(roles, value) },
            { name: 'invitation_status', label: 'Statut' },
            { name: 'invitation_expires_at', label: 'Expiration de l invitation' },
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
        singular: 'resident',
        route: 'residents',
        routeKey: 'id',
        indexColumns: [
            { key: 'name', label: 'Nom' },
            { key: 'email', label: 'Email' },
            { key: 'phone_number', label: 'Telephone' },
        ],
        formFields: [
            { name: 'name', label: 'Nom', type: 'text' },
            { name: 'email', label: 'Email', type: 'email' },
            { name: 'phone_number', label: 'Telephone', type: 'text' },
            { name: 'password', label: 'Mot de passe', type: 'password' },
            {
                name: 'password_confirmation',
                label: 'Confirmer le mot de passe',
                type: 'password',
            },
        ],
        showFields: [
            { name: 'name', label: 'Nom' },
            { name: 'email', label: 'Email' },
            { name: 'phone_number', label: 'Telephone' },
            { name: 'role', label: 'Role', format: (value) => optionLabelFor(roles, value) },
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
        title: 'Lots',
        singular: 'lot',
        route: 'apartments',
        routeKey: 'id',
        indexColumns: [
            { key: 'number', label: 'Numero' },
            { key: 'floor_id', label: 'Etage' },
            { key: 'user_id', label: 'Resident' },
            { key: 'area', label: 'Surface' },
        ],
        formFields: [
            { name: 'number', label: 'Numero', type: 'text' },
            { name: 'floor_id', label: 'Etage', type: 'select', options: [] },
            { name: 'user_id', label: 'Resident', type: 'select', options: [] },
            { name: 'area', label: 'Surface', type: 'number', step: '0.01', min: '0' },
        ],
        showFields: [
            { name: 'number', label: 'Numero' },
            { name: 'floor_id', label: 'Etage' },
            { name: 'user_id', label: 'Resident' },
            { name: 'area', label: 'Surface' },
        ],
        toFormData: (record = {}) => ({
            number: text(record.number),
            floor_id: record.floor_id ?? '',
            user_id: record.user_id ?? '',
            area: record.area ?? '',
        }),
    },
    buildings: {
        title: 'Immeubles',
        singular: 'immeuble',
        route: 'buildings',
        routeKey: 'id',
        indexColumns: [
            { key: 'name', label: 'Nom' },
            { key: 'address', label: 'Adresse' },
        ],
        formFields: [
            { name: 'name', label: 'Nom', type: 'text' },
            { name: 'address', label: 'Adresse', type: 'text' },
        ],
        showFields: [
            { name: 'name', label: 'Nom' },
            { name: 'address', label: 'Adresse' },
        ],
        toFormData: (record = {}) => ({
            name: text(record.name),
            address: text(record.address),
        }),
    },
    floors: {
        title: 'Etages',
        singular: 'etage',
        route: 'floors',
        routeKey: 'id',
        indexColumns: [
            { key: 'number', label: 'Numero' },
            { key: 'building_id', label: 'Immeuble' },
        ],
        formFields: [
            { name: 'number', label: 'Numero', type: 'text' },
            { name: 'building_id', label: 'Immeuble', type: 'select', options: [] },
        ],
        showFields: [
            { name: 'number', label: 'Numero' },
            { name: 'building_id', label: 'Immeuble' },
        ],
        toFormData: (record = {}) => ({
            number: text(record.number),
            building_id: record.building_id ?? '',
        }),
    },
    charges: {
        title: 'Charges',
        singular: 'charge',
        route: 'charges',
        routeKey: 'id',
        indexColumns: [
            { key: 'description', label: 'Description' },
            { key: 'amount', label: 'Montant' },
            { key: 'date', label: 'Date' },
            { key: 'status', label: 'Statut', render: (value) => optionLabelFor(chargeStatuses, value) },
        ],
        formFields: [
            { name: 'description', label: 'Description', type: 'text' },
            { name: 'amount', label: 'Montant', type: 'number', step: '0.01', min: '0' },
            { name: 'date', label: 'Date', type: 'date' },
            { name: 'apartment_id', label: 'Lot', type: 'select', options: [] },
            { name: 'status', label: 'Statut', type: 'select', options: chargeStatuses },
        ],
        showFields: [
            { name: 'description', label: 'Description' },
            { name: 'amount', label: 'Montant' },
            { name: 'date', label: 'Date' },
            { name: 'apartment_id', label: 'Lot' },
            { name: 'status', label: 'Statut', format: (value) => optionLabelFor(chargeStatuses, value) },
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
        title: 'Depenses',
        singular: 'depense',
        route: 'expenses',
        routeKey: 'id',
        indexColumns: [
            { key: 'title', label: 'Titre' },
            { key: 'amount', label: 'Montant' },
            { key: 'date', label: 'Date' },
        ],
        formFields: [
            { name: 'title', label: 'Titre', type: 'text' },
            { name: 'description', label: 'Description', type: 'text' },
            { name: 'amount', label: 'Montant', type: 'number', step: '0.01', min: '0' },
            { name: 'date', label: 'Date', type: 'date' },
            { name: 'building_id', label: 'Immeuble', type: 'select', options: [] },
        ],
        showFields: [
            { name: 'title', label: 'Titre' },
            { name: 'description', label: 'Description' },
            { name: 'amount', label: 'Montant' },
            { name: 'date', label: 'Date' },
            { name: 'building_id', label: 'Immeuble' },
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
        title: 'Annonces',
        singular: 'annonce',
        route: 'announcements',
        routeKey: 'id',
        indexColumns: [
            { key: 'title', label: 'Titre' },
            { key: 'content', label: 'Contenu' },
        ],
        formFields: [
            { name: 'title', label: 'Titre', type: 'text' },
            { name: 'content', label: 'Contenu', type: 'textarea', className: 'md:col-span-2' },
            {
                name: 'target_role',
                label: 'Role cible',
                type: 'select',
                options: announcementTargetRoles,
            },
            { name: 'building_id', label: 'Immeuble', type: 'select', options: [] },
        ],
        showFields: [
            { name: 'title', label: 'Titre' },
            { name: 'content', label: 'Contenu' },
            {
                name: 'target_role',
                label: 'Role cible',
                format: (value) => optionLabelFor(announcementTargetRoles, value),
            },
        ],
        toFormData: (record = {}) => ({
            title: text(record.title),
            content: text(record.content),
            target_role: record.target_role ?? 'all',
            building_id: record.building_id ?? '',
        }),
    },
    auditLogs: {
        title: 'Journal d activite',
        singular: 'action',
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
            { name: 'performed_by', label: 'Realise par' },
        ],
        toFormData: (record = {}) => ({
            action: text(record.action),
            details: text(record.details),
        }),
    },
    documents: {
        title: 'Documents',
        singular: 'document',
        route: 'documents',
        routeKey: 'id',
        indexColumns: [
            { key: 'title', label: 'Titre' },
            { key: 'file_path', label: 'Chemin du fichier' },
            { key: 'target_label', label: 'Cible' },
        ],
        formFields: [
            { name: 'title', label: 'Titre', type: 'text' },
            { name: 'file_path', label: 'Chemin du fichier', type: 'text' },
            { name: 'target_type', label: 'Type de cible', type: 'select', options: documentTargetTypes },
            {
                name: 'building_id',
                label: 'Immeuble',
                type: 'select',
                options: [],
                visibleWhen: (data) => data.target_type === 'building',
            },
            {
                name: 'apartment_id',
                label: 'Lot',
                type: 'select',
                options: [],
                visibleWhen: (data) => data.target_type === 'apartment',
            },
            {
                name: 'target_role',
                label: 'Role',
                type: 'select',
                options: documentTargetRoles,
                visibleWhen: (data) => data.target_type === 'role',
            },
        ],
        showFields: [
            { name: 'title', label: 'Titre' },
            { name: 'file_path', label: 'Chemin du fichier' },
            { name: 'target_label', label: 'Cible' },
            { name: 'uploaded_by', label: 'Ajoute par' },
        ],
        toFormData: (record = {}) => ({
            title: text(record.title),
            file_path: text(record.file_path),
            target_type: record.target_type ?? (record.building_id ? 'building' : 'all'),
            building_id: record.building_id ?? '',
            apartment_id: record.apartment_id ?? '',
            target_role: record.target_role ?? '',
        }),
    },
    notifications: {
        title: 'Alertes',
        singular: 'alerte',
        route: 'notifications',
        routeKey: 'id',
        indexColumns: [
            { key: 'title', label: 'Titre' },
            { key: 'message', label: 'Message' },
            {
                key: 'is_read',
                label: 'Statut',
                render: (value) => (value ? 'Lu' : 'Non lu'),
            },
        ],
        formFields: [
            { name: 'title', label: 'Titre', type: 'text' },
            { name: 'message', label: 'Message', type: 'textarea', className: 'md:col-span-2' },
            { name: 'user_id', label: 'Utilisateur', type: 'select', options: [] },
            { name: 'type', label: 'Type', type: 'select', options: notificationTypes },
        ],
        showFields: [
            { name: 'title', label: 'Titre' },
            { name: 'message', label: 'Message' },
            { name: 'user_id', label: 'Utilisateur' },
            { name: 'type', label: 'Type', format: (value) => optionLabelFor(notificationTypes, value) },
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
        title: 'Paiements',
        singular: 'paiement',
        route: 'payments',
        routeKey: 'id',
        indexColumns: [
            { key: 'amount', label: 'Montant' },
            { key: 'status', label: 'Statut', render: (value) => optionLabelFor(paymentStatuses, value) },
            { key: 'payment_date', label: 'Date de paiement' },
        ],
        formFields: [
            { name: 'amount', label: 'Montant', type: 'number', step: '0.01', min: '0' },
            { name: 'charge_id', label: 'Charge', type: 'select', options: [] },
            { name: 'status', label: 'Statut', type: 'select', options: paymentStatuses },
            { name: 'payment_date', label: 'Date de paiement', type: 'date' },
        ],
        showFields: [
            { name: 'amount', label: 'Montant' },
            { name: 'charge_id', label: 'Charge' },
            { name: 'status', label: 'Statut', format: (value) => optionLabelFor(paymentStatuses, value) },
            { name: 'payment_date', label: 'Date de paiement' },
        ],
        toFormData: (record = {}) => ({
            amount: record.amount ?? '',
            charge_id: record.charge_id ?? '',
            status: record.status ?? 'pending',
            payment_date: dateValue(record.payment_date),
        }),
    },
    receipts: {
        title: 'Recus',
        singular: 'recu',
        route: 'receipts',
        routeKey: 'id',
        indexColumns: [
            { key: 'file_path', label: 'Chemin du fichier' },
            { key: 'payment_id', label: 'Paiement' },
        ],
        formFields: [
            { name: 'file_path', label: 'Chemin du fichier', type: 'text' },
            { name: 'payment_id', label: 'Paiement', type: 'select', options: [] },
        ],
        showFields: [
            { name: 'file_path', label: 'Chemin du fichier' },
            { name: 'payment_id', label: 'Paiement' },
        ],
        toFormData: (record = {}) => ({
            file_path: text(record.file_path),
            payment_id: record.payment_id ?? '',
        }),
    },
    tickets: {
        title: 'Tickets',
        singular: 'ticket',
        route: 'tickets',
        routeKey: 'id',
        indexColumns: [
            { key: 'title', label: 'Titre' },
            { key: 'description', label: 'Description' },
            { key: 'status', label: 'Statut', render: (value) => optionLabelFor(ticketStatuses, value) },
        ],
        formFields: [
            { name: 'title', label: 'Titre', type: 'text' },
            { name: 'description', label: 'Description', type: 'textarea', className: 'md:col-span-2' },
            { name: 'assigned_to', label: 'Assigne a', type: 'select', options: [] },
            { name: 'status', label: 'Statut', type: 'select', options: ticketStatuses },
        ],
        showFields: [
            { name: 'title', label: 'Titre' },
            { name: 'description', label: 'Description' },
            { name: 'status', label: 'Statut', format: (value) => optionLabelFor(ticketStatuses, value) },
            { name: 'assingned_by', label: 'Cree par' },
            { name: 'assigned_to', label: 'Assigne a' },
        ],
        toFormData: (record = {}) => ({
            title: text(record.title),
            description: text(record.description),
            assigned_to: record.assigned_to ?? '',
            status: record.status ?? 'open',
        }),
    },
    ticketMessages: {
        title: 'Messages de ticket',
        singular: 'message',
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
            { name: 'sender_id', label: 'Expediteur' },
        ],
        toFormData: (record = {}) => ({
            ticket_id: record.ticket_id ?? '',
            message: text(record.message),
        }),
    },
    cacheLocks: {
        title: 'Traitements en cours',
        singular: 'traitement',
        route: 'cache-locks',
        routeKey: 'key',
        indexColumns: [
            { key: 'key', label: 'Cle' },
            { key: 'owner', label: 'Detenteur' },
            { key: 'expiration', label: 'Expiration' },
        ],
        formFields: [
            { name: 'key', label: 'Cle', type: 'text' },
            { name: 'owner', label: 'Detenteur', type: 'text' },
            { name: 'expiration', label: 'Expiration', type: 'number', min: '0' },
        ],
        showFields: [
            { name: 'key', label: 'Cle' },
            { name: 'owner', label: 'Detenteur' },
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
    documentTargetTypes,
    documentTargetRoles,
};
