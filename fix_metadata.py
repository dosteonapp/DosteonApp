content = open('backend/app/services/restaurant_service.py', 'r').read()
content = content.replace(
    '"metadata": {\n                        "draft_confirmed_ids": confirmed_ids,\n                        "draft_counts": counts\n                    }',
    '"metadata": json.dumps({\n                        "draft_confirmed_ids": confirmed_ids,\n                        "draft_counts": counts\n                    })'
)
open('backend/app/services/restaurant_service.py', 'w').write(content)
print('Done')
