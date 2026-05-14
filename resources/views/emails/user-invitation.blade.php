<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <title>Invitation Syndicare</title>
</head>
<body style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6;">
    <h1 style="color: #0e3715;">Bienvenue sur Syndicare</h1>

    <p>Bonjour {{ $user->name }},</p>

    <p>
        Votre compte Syndicare a ete cree. Utilisez votre email comme login :
        <strong>{{ $user->email }}</strong>.
    </p>

    <p>
        Pour activer votre compte et choisir votre mot de passe, cliquez sur le lien ci-dessous.
    </p>

    <p>
        <a
            href="{{ $acceptUrl }}"
            style="display: inline-block; border-radius: 999px; background: #0e3715; color: #ffffff; padding: 12px 20px; text-decoration: none; font-weight: 700;"
        >
            Activer mon compte
        </a>
    </p>

    <p>Ce lien expire le {{ $expiresAt }}.</p>

    <p>
        Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br>
        <a href="{{ $acceptUrl }}">{{ $acceptUrl }}</a>
    </p>

    <p>A bientot,<br>L'equipe Syndicare</p>
</body>
</html>
