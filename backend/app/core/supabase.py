from supabase import create_client, Client
from app.core.config import settings

def get_supabase() -> Client:
    # Use service role key if available for administrative tasks, 
    # otherwise fallback to anon key
    key = settings.s_service_role_key or settings.s_anon_key
    return create_client(settings.s_url, key)

supabase: Client = get_supabase()
