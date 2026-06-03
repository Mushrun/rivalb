/**
 * Résout un chemin de média vers une URL accessible.
 * - Si le chemin commence par '/' → déjà une URL complète (ex: /images/avatars/...)
 * - Sinon → ancien format storage (ex: avatars/...) → préfixe /storage/
 */
export function resolveMediaUrl(path) {
    if (!path) return null;
    return path.startsWith('/') ? path : `/storage/${path}`;
}
