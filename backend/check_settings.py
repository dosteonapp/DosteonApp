from app.core.config import settings

print(f"URL: {settings.s_url}")
print(f"ANON KEY (start): {settings.s_anon_key[:10] if settings.s_anon_key else 'None'}")
print(f"SERVICE KEY (start): {settings.s_service_role_key[:10] if settings.s_service_role_key else 'None'}")
