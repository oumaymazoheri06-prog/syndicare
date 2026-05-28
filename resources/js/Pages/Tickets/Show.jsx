import { CrudShowPage } from '@/Components/CrudScaffold';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { useForm, usePage } from '@inertiajs/react';
import { resourceConfigs } from '../_shared/resources';

function roleLabel(role) {
    if (role === 'Syndic') {
        return 'Syndic';
    }

    if (role === 'Locataire') {
        return 'Locataire';
    }

    return 'Coproprietaire';
}

export default function Show({ ticket }) {
    const config = resourceConfigs.tickets;
    const { auth } = usePage().props;
    const currentUser = auth?.user;
    const messages = ticket.ticket_messages || [];
    const { data, setData, post, processing, errors, reset } = useForm({
        ticket_id: ticket.id,
        message: '',
    });

    const submitMessage = (event) => {
        event.preventDefault();

        post(route('ticket-messages.store'), {
            preserveScroll: true,
            onSuccess: () => reset('message'),
        });
    };

    return (
        <CrudShowPage
            title={config.title}
            resource={config.route}
            record={ticket}
            fields={config.showFields}
            routeKey={config.routeKey}
        >
            <section className="overflow-hidden rounded-[2rem] border border-white/80 bg-white/95 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur">
                <div className="border-b border-emerald-50 p-4 sm:p-6">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <h3 className="text-base font-semibold text-slate-900 sm:text-lg">
                                Suivi de la reclamation
                            </h3>
                            <p className="mt-1 text-sm text-slate-500">
                                Echanges entre le resident et le syndic autour de ce ticket.
                            </p>
                        </div>
                        <span className="inline-flex w-fit rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                            {messages.length} message{messages.length > 1 ? 's' : ''}
                        </span>
                    </div>
                </div>

                <div className="space-y-4 p-4 sm:p-6">
                    {messages.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/70 p-5 text-sm text-emerald-800">
                            Aucun message pour le moment. Ajoutez une reponse pour commencer le suivi.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {messages.map((message) => {
                                const isCurrentUser = message.sender_id === currentUser?.id;
                                const sender = message.sender;

                                return (
                                    <div
                                        key={message.id}
                                        className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <article
                                            className={`max-w-[min(100%,42rem)] rounded-2xl border px-4 py-3 shadow-sm ${
                                                isCurrentUser
                                                    ? 'border-emerald-100 bg-emerald-50'
                                                    : 'border-slate-100 bg-white'
                                            }`}
                                        >
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="text-sm font-semibold text-slate-900">
                                                    {sender?.name || 'Utilisateur'}
                                                </p>
                                                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                                                    {roleLabel(sender?.role)}
                                                </span>
                                            </div>

                                            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                                                {message.message}
                                            </p>

                                            <p className="mt-2 text-xs text-slate-400">
                                                {message.created_at}
                                            </p>
                                        </article>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <form
                        onSubmit={submitMessage}
                        className="rounded-2xl border border-emerald-100 bg-[#fffdf8] p-4"
                    >
                        <label
                            htmlFor="ticket-message"
                            className="text-sm font-semibold text-slate-800"
                        >
                            Ajouter une reponse
                        </label>
                        <textarea
                            id="ticket-message"
                            value={data.message}
                            onChange={(event) => setData('message', event.target.value)}
                            rows={4}
                            className="mt-2 block w-full rounded-xl border-slate-200 bg-white text-sm shadow-sm focus:border-emerald-600 focus:ring-emerald-600"
                            placeholder="Ecrivez une mise a jour, une precision ou une reponse..."
                        />
                        <InputError message={errors.message} className="mt-2" />

                        <div className="mt-3 flex justify-end">
                            <PrimaryButton disabled={processing || !data.message.trim()}>
                                Envoyer la reponse
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </section>
        </CrudShowPage>
    );
}
