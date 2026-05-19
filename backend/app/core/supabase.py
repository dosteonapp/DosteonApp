from supabase import create_client, Client, ClientOptions
from app.core.config import settings

def get_supabase() -> Client:
    """Create stateless Supabase admin client.
    
    CRITICAL: Admin client must NOT persist sessions or auto-refresh tokens.
    Without these settings, the client caches auth state between requests,
    causing subsequent signup attempts to fail. This is a service role key
    issue that requires the client to be purely stateless (request→response).
    """
    key = settings.s_service_role_key or settings.s_anon_key
    
    # Admin client: never persist sessions, never auto-refresh tokens
    options = ClientOptions(
        persist_session=False,
        auto_refresh_token=False,
    )
    
    return create_client(settings.s_url, key, options)

supabase: Client = get_supabase()
