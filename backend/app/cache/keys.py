from app.cache.client import CACHE_VERSION


class CacheKeys:
    """
    All cache keys follow the schema:
        {version}:{resource}:{org_id}[:{brand_id|"all"}][:{qualifier}]

    Examples:
        v1:restaurant_stats:org-abc123
        v1:sales_today_stats:org-abc123:brand-xyz
        v1:menu:org-abc123:all
        v1:recipe:org-abc123:item-111
    """

    @staticmethod
    def restaurant_stats(org_id: str) -> str:
        return f"{CACHE_VERSION}:restaurant_stats:{org_id}"

    @staticmethod
    def sales_today_stats(org_id: str, brand_id: str | None) -> str:
        brand = brand_id or "all"
        return f"{CACHE_VERSION}:sales_today_stats:{org_id}:{brand}"

    @staticmethod
    def expense_today_stats(org_id: str, brand_id: str | None) -> str:
        brand = brand_id or "all"
        return f"{CACHE_VERSION}:expense_today_stats:{org_id}:{brand}"

    @staticmethod
    def inventory(org_id: str) -> str:
        return f"{CACHE_VERSION}:inventory:{org_id}"

    @staticmethod
    def products(org_id: str) -> str:
        return f"{CACHE_VERSION}:products:{org_id}"

    @staticmethod
    def inventory_stats(org_id: str) -> str:
        return f"{CACHE_VERSION}:inventory_stats:{org_id}"

    @staticmethod
    def menu(org_id: str, brand_id: str | None) -> str:
        brand = brand_id or "all"
        return f"{CACHE_VERSION}:menu:{org_id}:{brand}"

    @staticmethod
    def settings(org_id: str) -> str:
        return f"{CACHE_VERSION}:settings:{org_id}"

    @staticmethod
    def recipe(org_id: str, item_id: str) -> str:
        return f"{CACHE_VERSION}:recipe:{org_id}:{item_id}"

    @staticmethod
    def menu_categories(org_id: str) -> str:
        return f"{CACHE_VERSION}:menu_categories:{org_id}"
