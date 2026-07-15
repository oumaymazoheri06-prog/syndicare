import UserAvatar from '@/Components/UserAvatar';
import { createElement } from 'react';

const roles = [
    { value: 'Syndic', label: 'Syndic' },
    { value: 'Coproprietaire', label: 'Copropriétaire' },
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
    { value: 'closed', label: 'Fermé' },
];

const chargeStatuses = [
    { value: 'pending', label: 'En attente' },
    { value: 'paid', label: 'Payée' },
    { value: 'overdue', label: 'En retard' },
];

const paymentStatuses = [
    { value: 'pending', label: 'En attente' },
    { value: 'validated', label: 'Validé' },
];

const paymentMethods = [
    { value: 'virement', label: 'Virement bancaire' },
    { value: 'cashplus', label: 'Cash Plus' },
    { value: 'manuel', label: 'Paiement direct au syndic' },
];

const documentTargetTypes = [
    { value: 'all', label: 'Tout le monde' },
    { value: 'building', label: 'Immeuble' },
    { value: 'apartment', label: 'Lot' },
    { value: 'role', label: 'Rôle' },
];

const documentTargetRoles = [
    { value: 'Coproprietaire', label: 'Copropriétaire' },
    { value: 'Locataire', label: 'Locataire' },
];

const documentCategories = [
    { value: 'pv', label: "Procès-verbaux d'AG" },
    { value: 'reglement', label: 'Règlements' },
    { value: 'finance', label: 'Rapports financiers' },
    { value: 'contrat', label: 'Contrats' },
    { value: 'autre', label: 'Autres' },
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

function UserNameCell({ user }) {
    return createElement(
        'div',
        { className: 'flex min-w-0 items-center gap-2' },
        createElement(UserAvatar, { user, size: 'sm' }),
        createElement(
            'span',
            { className: 'min-w-0 truncate font-semibold text-slate-900' },
            user?.name ?? '-',
        ),
    );
}

export const resourceConfigs = {
    users: {
        title: 'Membres',
        singular: 'membre',
        route: 'users',
        routeKey: 'id',
        indexColumns: [
            {
                key: 'name',
                label: 'Nom',
                render: (_, user) => createElement(UserNameCell, { user }),
            },
            { key: 'email', label: 'E-mail' },
            { key: 'phone_number', label: 'Téléphone' },
            { key: 'role', label: 'Rôle', render: (value) => optionLabelFor(roles, value) },
            { key: 'apartment_label', label: 'Lot' },
            { key: 'invitation_status', label: 'Statut' },
        ],
        formFields: [
            { name: 'name', label: 'Nom', type: 'text' },
            { name: 'email', label: 'E-mail', type: 'email' },
            { name: 'phone_number', label: 'Téléphone', type: 'text' },
            { name: 'role', label: 'Rôle', type: 'select', options: roles },
            { name: 'password', label: 'Mot de passe', type: 'password' },
            {
                name: 'password_confirmation',
                label: 'Confirmer le mot de passe',
                type: 'password',
            },
        ],
        showFields: [
            { name: 'name', label: 'Nom' },
            { name: 'email', label: 'E-mail' },
            { name: 'phone_number', label: 'Téléphone' },
            { name: 'role', label: 'Rôle', format: (value) => optionLabelFor(roles, value) },
            { name: 'apartment_label', label: 'Lot associé' },
            { name: 'invitation_status', label: 'Statut' },
            { name: 'invitation_expires_at', label: "Expiration de l'invitation" },
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
        title: 'Résidents',
        singular: 'résident',
        route: 'residents',
        routeKey: 'id',
        indexColumns: [
            { key: 'name', label: 'Nom' },
            { key: 'email', label: 'E-mail' },
            { key: 'phone_number', label: 'Téléphone' },
        ],
        formFields: [
            { name: 'name', label: 'Nom', type: 'text' },
            { name: 'email', label: 'E-mail', type: 'email' },
            { name: 'phone_number', label: 'Téléphone', type: 'text' },
            { name: 'password', label: 'Mot de passe', type: 'password' },
            {
                name: 'password_confirmation',
                label: 'Confirmer le mot de passe',
                type: 'password',
            },
        ],
        showFields: [
            { name: 'name', label: 'Nom' },
            { name: 'email', label: 'E-mail' },
            { name: 'phone_number', label: 'Téléphone' },
            { name: 'role', label: 'Rôle', format: (value) => optionLabelFor(roles, value) },
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
            { key: 'number', label: 'Numéro' },
            { key: 'floor_label', label: 'Étage' },
            { key: 'building_label', label: 'Immeuble' },
            { key: 'resident_label', label: 'Résident' },
            { key: 'occupancy_status', label: 'Occupation' },
            { key: 'area', label: 'Surface' },
        ],
        formFields: [
            { name: 'number', label: 'Numéro', type: 'text' },
            { name: 'floor_id', label: 'Étage', type: 'select', options: [] },
            { name: 'user_id', label: 'Résident', type: 'select', options: [] },
            { name: 'area', label: 'Surface', type: 'number', step: '0.01', min: '0' },
        ],
        showFields: [
            { name: 'number', label: 'Numéro' },
            { name: 'floor_label', label: 'Étage' },
            { name: 'building_label', label: 'Immeuble' },
            { name: 'resident_label', label: 'Résident' },
            { name: 'occupancy_status', label: 'Occupation' },
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
            { key: 'floors_count', label: 'Étages' },
            { key: 'apartments_count', label: 'Lots' },
            { key: 'occupied_apartments_count', label: 'Occupés' },
            { key: 'vacant_apartments_count', label: 'Vides' },
        ],
        formFields: [
            { name: 'name', label: 'Nom', type: 'text' },
            { name: 'address', label: 'Adresse', type: 'text' },
        ],
        showFields: [
            { name: 'name', label: 'Nom' },
            { name: 'address', label: 'Adresse' },
            { name: 'floors_count', label: "Nombre d'étages" },
            { name: 'apartments_count', label: 'Total lots' },
            { name: 'occupied_apartments_count', label: 'Lots occupés' },
            { name: 'vacant_apartments_count', label: 'Lots vides' },
        ],
        toFormData: (record = {}) => ({
            name: text(record.name),
            address: text(record.address),
        }),
    },
    floors: {
        title: 'Étages',
        singular: 'étage',
        route: 'floors',
        routeKey: 'id',
        indexColumns: [
            { key: 'number', label: 'Numéro' },
            { key: 'building_id', label: 'Immeuble' },
        ],
        formFields: [
            { name: 'number', label: 'Numéro', type: 'text' },
            { name: 'building_id', label: 'Immeuble', type: 'select', options: [] },
        ],
        showFields: [
            { name: 'number', label: 'Numéro' },
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
            {
                key: 'apartment',
                label: 'Lot',
                render: (_, record) => record.apartment?.number ? `Lot ${record.apartment.number}` : '-',
            },
            { key: 'amount', label: 'Montant' },
            { key: 'date', label: 'Date' },
            { key: 'status', label: 'Statut', render: (value) => optionLabelFor(chargeStatuses, value) },
        ],
        formFields: [
            { name: 'description', label: 'Description', type: 'text' },
            { name: 'amount', label: 'Montant', type: 'number', step: '0.01', min: '0' },
            { name: 'date', label: 'Date', type: 'date' },
            { name: 'apartment_id', label: 'Lot', type: 'select', options: [] },
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
        title: 'Dépenses',
        singular: 'dépense',
        route: 'expenses',
        routeKey: 'id',
        indexColumns: [
            { key: 'title', label: 'Titre' },
            { key: 'building', label: 'Immeuble', render: (_, record) => record.building?.name ?? '-' },
            {
                key: 'apartment',
                label: 'Lots concernés',
                render: (_, record) => record.apartment?.number ? `Lot ${record.apartment.number}` : 'Tous les lots',
            },
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
            { name: 'building', label: 'Immeuble', render: (_, record) => record.building?.name ?? '-' },
            {
                name: 'apartment',
                label: 'Lots concernés',
                render: (_, record) => record.apartment?.number ? `Lot ${record.apartment.number}` : 'Tous les lots',
            },
        ],
        toFormData: (record = {}) => ({
            title: text(record.title),
            description: text(record.description),
            amount: record.amount ?? '',
            date: dateValue(record.date),
            building_id: record.building_id ?? '',
            apartment_id: record.apartment_id ?? '',
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
                label: 'Rôle cible',
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
                label: 'Rôle cible',
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
        title: "Journal d'activité",
        singular: 'action',
        route: 'audit-logs',
        routeKey: 'id',
        indexColumns: [
            { key: 'action', label: 'Action' },
            { key: 'details', label: 'Détails' },
        ],
        formFields: [
            { name: 'action', label: 'Action', type: 'text' },
            { name: 'details', label: 'Détails', type: 'textarea', className: 'md:col-span-2' },
        ],
        showFields: [
            { name: 'action', label: 'Action' },
            { name: 'details', label: 'Détails' },
            { name: 'performed_by', label: 'Réalisé par' },
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
            { key: 'category_label', label: 'Catégorie' },
            { key: 'file_name', label: 'Fichier' },
            { key: 'target_label', label: 'Cible' },
        ],
        formFields: [
            { name: 'title', label: 'Titre', type: 'text' },
            { name: 'category', label: 'Catégorie', type: 'select', options: documentCategories },
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
                label: 'Rôle',
                type: 'select',
                options: documentTargetRoles,
                visibleWhen: (data) => data.target_type === 'role',
            },
        ],
        showFields: [
            { name: 'title', label: 'Titre' },
            { name: 'category_label', label: 'Catégorie' },
            { name: 'file_name', label: 'Fichier' },
            { name: 'target_label', label: 'Cible' },
            { name: 'uploaded_by_name', label: 'Ajouté par' },
        ],
        toFormData: (record = {}) => ({
            title: text(record.title),
            category: record.category ?? 'autre',
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
                helperText: 'Activer si déjà lu',
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
            { name: 'method', label: 'Méthode', type: 'select', options: paymentMethods },
            { name: 'status', label: 'Statut', type: 'select', options: paymentStatuses },
            { name: 'payment_date', label: 'Date de paiement', type: 'date' },
        ],
        showFields: [
            { name: 'amount', label: 'Montant' },
            { name: 'charge_id', label: 'Charge' },
            { name: 'method', label: 'Méthode', format: (value) => optionLabelFor(paymentMethods, value) },
            { name: 'payment_proof', label: 'Preuve de paiement' },
            { name: 'status', label: 'Statut', format: (value) => optionLabelFor(paymentStatuses, value) },
            { name: 'payment_date', label: 'Date de paiement' },
        ],
        toFormData: (record = {}) => ({
            amount: record.amount ?? '',
            charge_id: record.charge_id ?? '',
            method: record.method ?? '',
            payment_proof: '',
            status: record.status ?? 'pending',
            payment_date: dateValue(record.payment_date),
        }),
    },
    receipts: {
        title: 'Reçus',
        singular: 'reçu',
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
            { key: 'resident_label', label: 'Résident' },
            { key: 'apartment_label', label: 'Lot' },
            { key: 'status', label: 'Statut', render: (value) => optionLabelFor(ticketStatuses, value) },
        ],
        formFields: [
            { name: 'title', label: 'Titre', type: 'text' },
            { name: 'description', label: 'Description', type: 'textarea', className: 'md:col-span-2' },
            { name: 'assigned_to', label: 'Assigné à', type: 'select', options: [] },
            { name: 'status', label: 'Statut', type: 'select', options: ticketStatuses },
        ],
        showFields: [
            { name: 'title', label: 'Titre' },
            { name: 'description', label: 'Description' },
            { name: 'resident_label', label: 'Résident' },
            { name: 'apartment_label', label: 'Lot concerné' },
            { name: 'status', label: 'Statut', format: (value) => optionLabelFor(ticketStatuses, value) },
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
            { name: 'sender_id', label: 'Expéditeur' },
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
            { key: 'key', label: 'Clé' },
            { key: 'owner', label: 'Détenteur' },
            { key: 'expiration', label: 'Expiration' },
        ],
        formFields: [
            { name: 'key', label: 'Clé', type: 'text' },
            { name: 'owner', label: 'Détenteur', type: 'text' },
            { name: 'expiration', label: 'Expiration', type: 'number', min: '0' },
        ],
        showFields: [
            { name: 'key', label: 'Clé' },
            { name: 'owner', label: 'Détenteur' },
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
    paymentMethods,
    documentTargetTypes,
    documentTargetRoles,
    documentCategories,
};
