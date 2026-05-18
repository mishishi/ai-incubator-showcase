#!/usr/bin/env python3
with open('/root/.openclaw/workspace/showcase-app/scripts/generate-log-json.py', encoding='utf-8') as f:
    c = f.read()

# Fix date to match both 调研时间 and 孵化日期
c = c.replace(
    "date_m = re.search(r'调研时间[：:]\s*(\d{4}-\d{2}-\d{2})', text)",
    "date_m = re.search(r'(调研时间|孵化日期)[：:]\s*(\d{4}-\d{2}-\d{2})', text)"
)

# Fix design direction to also match 设计风格 (for noctern)
c = c.replace(
    "direction = re.search(r'设计方向[：:]\s*([^\n]+)', text)\n        if direction:\n            decisions.append(\"设计方向: \" + direction.group(1).strip())",
    "direction = re.search(r'(设计方向|设计风格)[：:]\s*([^\n]+)', text)\n        if direction:\n            decisions.append(\"设计方向: \" + direction.group(2).strip())"
)

with open('/root/.openclaw/workspace/showcase-app/scripts/generate-log-json.py', 'w', encoding='utf-8') as f:
    f.write(c)
print('done')